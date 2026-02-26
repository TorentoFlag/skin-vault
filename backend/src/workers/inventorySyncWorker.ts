import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.ts';
import { inventorySyncQueue, QUEUE_NAMES } from '../config/queues.ts';
import { syncInventory } from '../services/inventoryService.ts';
import { logger } from '../utils/logger.ts';

export const inventorySyncWorker = new Worker(
  QUEUE_NAMES.INVENTORY_SYNC,
  async () => {
    logger.info('Inventory sync job started');
    await syncInventory();
    logger.info('Inventory sync job complete');
  },
  {
    connection: createRedisConnection(),
    concurrency: 1,
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 10 },
  },
);

inventorySyncWorker.on('failed', (_job, err) => {
  logger.error({ err: err.message }, 'Inventory sync job failed');
});

export const scheduleInventorySync = async () => {
  await inventorySyncQueue.add(
    'sync',
    {},
    {
      repeat: { every: 15 * 60 * 1000 },
      jobId: 'inventory-sync-repeatable',
    },
  );
  logger.info('Inventory sync scheduled (every 15 min)');
};
