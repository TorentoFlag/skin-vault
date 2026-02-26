import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';
import { env } from './env.ts';
import { logger } from '../utils/logger.ts';

export const createRedisConnection = () =>
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

export const redis = createRedisConnection();

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error(err, 'Redis error'));

const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export const acquireLock = async (key: string, ttlMs: number): Promise<string | null> => {
  const token = randomUUID();
  const result = await redis.set(key, token, 'PX', ttlMs, 'NX');
  return result === 'OK' ? token : null;
};

export const releaseLock = async (key: string, token: string): Promise<void> => {
  await redis.eval(RELEASE_SCRIPT, 1, key, token);
};
