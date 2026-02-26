import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.ts';
import { QUEUE_NAMES, tradeMonitorQueue } from '../config/queues.ts';
import type { TradeMonitorJobData } from '../config/queues.ts';
import { steamBot } from '../services/steamBot.ts';
import { prisma } from '../config/database.ts';
import { unlockItems } from '../services/inventoryService.ts';
import { issueRefund } from '../services/paymentService.ts';
import { logger } from '../utils/logger.ts';

const TRADE_TIMEOUT_MS = 15 * 60 * 1000;
const POLL_INTERVAL_MS = 30_000;

const STATE_ACCEPTED = 3;
const STATE_EXPIRED = 5;
const STATE_CANCELLED = 6;
const STATE_DECLINED = 7;
const STATE_INVALID_ITEMS = 8;

const TERMINAL_FAILURE_STATES = [STATE_EXPIRED, STATE_CANCELLED, STATE_DECLINED, STATE_INVALID_ITEMS];

const handleTradeAccepted = async (orderId: string) => {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
  logger.info({ orderId }, 'Trade accepted, order completed');
};

const handleTradeFailed = async (orderId: string, itemIds: string[], state: number) => {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'FAILED' },
  });
  await unlockItems(itemIds);
  await issueRefund(orderId);
  logger.warn({ orderId, state }, 'Trade failed, items unlocked, refund issued');
};

const handleTradeTimeout = async (orderId: string, tradeOfferId: string, itemIds: string[]) => {
  try {
    await steamBot.cancelTradeOffer(tradeOfferId);
  } catch (err) {
    logger.warn({ orderId, tradeOfferId, err }, 'Failed to cancel trade offer on Steam');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
  });
  await unlockItems(itemIds);
  await issueRefund(orderId);
  logger.info({ orderId, tradeOfferId }, 'Trade timed out, cancelled + refunded');
};

export const tradeMonitorWorker = new Worker<TradeMonitorJobData>(
  QUEUE_NAMES.TRADE_MONITOR,
  async (job) => {
    const { orderId, tradeOfferId, itemIds, enqueuedAt } = job.data;
    const elapsed = Date.now() - new Date(enqueuedAt).getTime();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'FAILED') {
      logger.debug({ orderId, status: order?.status }, 'Monitor: order already in terminal state');
      return;
    }

    if (!steamBot.isReady()) {
      await tradeMonitorQueue.add('monitor', job.data, { delay: POLL_INTERVAL_MS });
      logger.warn({ orderId }, 'Monitor: bot not ready, re-polling');
      return;
    }

    let state: number;
    try {
      state = await steamBot.getTradeOfferState(tradeOfferId);
    } catch (err) {
      logger.warn({ orderId, tradeOfferId, err }, 'Monitor: failed to get trade offer state');
      if (elapsed < TRADE_TIMEOUT_MS) {
        await tradeMonitorQueue.add('monitor', job.data, { delay: POLL_INTERVAL_MS });
      } else {
        await handleTradeTimeout(orderId, tradeOfferId, itemIds);
      }
      return;
    }

    if (state === STATE_ACCEPTED) {
      await handleTradeAccepted(orderId);
      return;
    }

    if (TERMINAL_FAILURE_STATES.includes(state)) {
      await handleTradeFailed(orderId, itemIds, state);
      return;
    }

    if (elapsed >= TRADE_TIMEOUT_MS) {
      await handleTradeTimeout(orderId, tradeOfferId, itemIds);
      return;
    }

    await tradeMonitorQueue.add('monitor', job.data, { delay: POLL_INTERVAL_MS });
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 50 },
  },
);

tradeMonitorWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, orderId: job?.data.orderId, err: err.message }, 'Trade monitor job failed');
});
