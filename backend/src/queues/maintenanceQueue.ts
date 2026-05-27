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
  // Clear existing repeatable jobs to ensure interval updates are applied
  const repeatableJobs = await maintenanceQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await maintenanceQueue.removeRepeatableByKey(job.key);
  }
  
  // 1. Schedule repeatable jobs
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
    repeat: { every: 5 * 60 * 1000 } // 5 minutes
  })

  await maintenanceQueue.add('recover-stuck-jobs', {}, {
    repeat: { every: 5 * 60 * 1000 } // 5 minutes
  })

  // 2. Trigger once immediately on startup for health visibility
  await maintenanceQueue.add('check-deadlines', {}, { jobId: 'startup-check-deadlines' })
  await maintenanceQueue.add('poll-emails', {}, { jobId: 'startup-poll-emails' })
  await maintenanceQueue.add('retry-emails', {}, { jobId: 'startup-retry-emails' })
  await maintenanceQueue.add('recover-stuck-jobs', {}, { jobId: 'startup-recover-stuck-jobs' })

  logger.info('🚀 BullMQ Maintenance Jobs scheduled and triggered for startup')
}
