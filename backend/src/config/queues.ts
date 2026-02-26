import { Queue } from 'bullmq';
import { redis } from './redis.ts';

export const QUEUE_NAMES = {
  TRADE: 'trade',
  TRADE_MONITOR: 'trade-monitor',
  INVENTORY_SYNC: 'inventory-sync',
  MARKET_SYNC: 'market-sync',
} as const;

export interface TradeJobData {
  orderId: string;
  userId: string;
  tradeUrl: string;
  itemAssetIds: string[];
  itemIds: string[];
}

export interface TradeMonitorJobData {
  orderId: string;
  tradeOfferId: string;
  userId: string;
  itemIds: string[];
  enqueuedAt: string;
}

export const tradeQueue = new Queue(QUEUE_NAMES.TRADE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

export const tradeMonitorQueue = new Queue(QUEUE_NAMES.TRADE_MONITOR, {
  connection: redis,
});

export const inventorySyncQueue = new Queue(QUEUE_NAMES.INVENTORY_SYNC, {
  connection: redis,
});

export const marketSyncQueue = new Queue(QUEUE_NAMES.MARKET_SYNC, {
  connection: redis,
});
