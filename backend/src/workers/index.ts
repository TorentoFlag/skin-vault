import { tradeWorker } from './tradeWorker.ts';
import { tradeMonitorWorker } from './tradeMonitorWorker.ts';
import { inventorySyncWorker, scheduleInventorySync } from './inventorySyncWorker.ts';
import { marketSyncWorker, scheduleMarketSync } from './marketSyncWorker.ts';
import { logger } from '../utils/logger.ts';

export const startWorkers = async () => {
  await scheduleInventorySync();
  logger.info('All BullMQ workers started');
};

export const startMarketSync = async () => {
  await scheduleMarketSync();
};

export const stopWorkers = async () => {
  await Promise.all([
    tradeWorker.close(),
    tradeMonitorWorker.close(),
    inventorySyncWorker.close(),
    marketSyncWorker.close(),
  ]);
  logger.info('All BullMQ workers stopped');
};
