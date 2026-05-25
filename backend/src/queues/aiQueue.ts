import { Queue } from 'bullmq'
import { redisConnection } from './connection.js'
import { logger } from '../utils/logger.js'

export const AI_QUEUE_NAME = 'ai-profiling-queue'

export const aiQueue = new Queue(AI_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})

logger.info(`✅ BullMQ Queue "${AI_QUEUE_NAME}" initialized`)
