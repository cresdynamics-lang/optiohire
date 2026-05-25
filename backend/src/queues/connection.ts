import Redis from 'ioredis'
import { logger } from '../utils/logger.js'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
})

redisConnection.on('error', (err) => {
  logger.error('❌ Redis Connection Error:', { message: err.message })
})

redisConnection.on('connect', () => {
  logger.info('✅ Connected to Redis for BullMQ')
})
