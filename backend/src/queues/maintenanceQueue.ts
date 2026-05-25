import { Queue } from 'bullmq'
import { redisConnection } from './connection.js'
import { logger } from '../utils/logger.js'

export const MAINTENANCE_QUEUE_NAME = 'maintenance-queue'

export const maintenanceQueue = new Queue(MAINTENANCE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
})

export async function setupMaintenanceJobs() {
  await maintenanceQueue.add('check-deadlines', {}, {
    repeat: { every: 15 * 60 * 1000 } // 15 minutes
  })

  await maintenanceQueue.add('generate-reports', {}, {
    repeat: { every: 10 * 60 * 1000 } // 10 minutes
  })

  await maintenanceQueue.add('retry-emails', {}, {
    repeat: { every: 60 * 1000 } // 1 minute
  })

  await maintenanceQueue.add('poll-emails', {}, {
    repeat: { every: 10 * 1000 } // 10 seconds
  })

  await maintenanceQueue.add('recover-stuck-jobs', {}, {
    repeat: { every: 5 * 60 * 1000 } // 5 minutes
  })

  logger.info('🚀 BullMQ Maintenance Jobs scheduled')
}
