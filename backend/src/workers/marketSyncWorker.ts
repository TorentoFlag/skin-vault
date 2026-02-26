import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.ts';
import { marketSyncQueue, QUEUE_NAMES } from '../config/queues.ts';
import { syncFromMarket } from '../services/steamMarketService.ts';
import { logger } from '../utils/logger.ts';

export const marketSyncWorker = new Worker(
  QUEUE_NAMES.MARKET_SYNC,
  async () => {
    logger.info('Market sync job started');
    const count = await syncFromMarket(200);
    logger.info({ count }, 'Market sync job complete');
  },
  {
    connection: createRedisConnection(),
    concurrency: 1,
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 10 },
  },
);

marketSyncWorker.on('failed', (_job, err) => {
  logger.error({ err: err.message }, 'Market sync job failed');
});

export const scheduleMarketSync = async () => {
  // Run immediately on startup
  await marketSyncQueue.add('sync-immediate', {});

  // Then schedule repeat every 10 minutes
  await marketSyncQueue.add(
    'sync',
    {},
    {
      repeat: { every: 10 * 60 * 1000 },
      jobId: 'market-sync-repeatable',
    },
  );
  logger.info('Market sync scheduled (every 10 min)');
};
