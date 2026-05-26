import Redis from 'ioredis'
import RedisMock from 'ioredis-mock'
import { logger } from '../utils/logger.js'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const redisEnabled = String(process.env.REDIS_ENABLED || '').trim().toLowerCase() === 'true'

export const redisConnection = redisEnabled ? new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
}) : new RedisMock({
  maxRetriesPerRequest: null,
  enableReadyCheck: false
}) as any;

if (redisEnabled) {
  redisConnection.on('error', (err: any) => {
    logger.error('❌ Redis Connection Error:', { message: err.message })
  })

  redisConnection.on('connect', () => {
    logger.info('✅ Connected to Redis for BullMQ')
  })
} else {
  logger.info('⚠️ Redis is disabled, using ioredis-mock for BullMQ in-memory')
}
