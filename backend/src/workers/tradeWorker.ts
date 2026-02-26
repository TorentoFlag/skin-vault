import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.ts';
import { QUEUE_NAMES, tradeMonitorQueue } from '../config/queues.ts';
import type { TradeJobData } from '../config/queues.ts';
import { steamBot } from '../services/steamBot.ts';
import { prisma } from '../config/database.ts';
import { unlockItems } from '../services/inventoryService.ts';
import { issueRefund } from '../services/paymentService.ts';
import { logger } from '../utils/logger.ts';

const markOrderFailed = async (orderId: string, itemIds: string[], reason: string) => {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'FAILED' },
  });
  await unlockItems(itemIds);
  await issueRefund(orderId);
  logger.error({ orderId, reason }, 'Order marked as FAILED, refund issued');
};

export const tradeWorker = new Worker<TradeJobData>(
  QUEUE_NAMES.TRADE,
  async (job) => {
    const { orderId, tradeUrl, itemAssetIds, itemIds } = job.data;
    logger.info({ orderId, jobId: job.id }, 'Trade worker processing job');

    if (!steamBot.isReady()) {
      throw new Error('Steam bot is not ready');
    }

    if (!tradeUrl) {
      await markOrderFailed(orderId, itemIds, 'User has no trade URL');
      return;
    }

    const inventory = await steamBot.getInventory();
    const matchedItems = inventory.filter((item) =>
      itemAssetIds.includes(String(item.assetid)),
    );

    if (matchedItems.length !== itemAssetIds.length) {
      await markOrderFailed(orderId, itemIds, `Missing items in bot inventory (expected ${itemAssetIds.length}, found ${matchedItems.length})`);
      return;
    }

    const { offerId } = await steamBot.sendTradeOffer(tradeUrl, matchedItems);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'TRADE_SENT', tradeOfferId: offerId },
    });

    await tradeMonitorQueue.add('monitor', {
      orderId,
      tradeOfferId: offerId,
      userId: job.data.userId,
      itemIds,
      enqueuedAt: new Date().toISOString(),
    }, { delay: 30_000 });

    logger.info({ orderId, offerId }, 'Trade offer sent, monitor enqueued');
  },
  {
    connection: createRedisConnection(),
    concurrency: 1,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

tradeWorker.on('failed', async (job, err) => {
  logger.error({ jobId: job?.id, orderId: job?.data.orderId, err: err.message }, 'Trade job failed');

  if (job && job.attemptsMade >= (job.opts.attempts ?? 3) && job.data.orderId) {
    await markOrderFailed(job.data.orderId, job.data.itemIds, `Trade job exhausted all retries: ${err.message}`);
  }
});
