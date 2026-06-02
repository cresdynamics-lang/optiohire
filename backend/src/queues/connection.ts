import Redis from 'ioredis'
import { logger } from '../utils/logger.js'

const REDIS_URL = process.env.REDIS_URL || (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : 'redis://127.0.0.1:6379')

// Redis is now MANDATORY for BullMQ.
export const isRedisEnabled = true;

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000);
    return delay;
  }
});

redisConnection.on('error', (err: any) => {
  logger.error('❌ Redis Connection Error:', { message: err.message })
})

redisConnection.on('connect', () => {
  logger.info('✅ Connected to Redis for BullMQ')
})
