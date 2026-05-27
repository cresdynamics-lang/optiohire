import { Request, Response } from 'express'
import { aiQueue } from '../queues/aiQueue.js'
import { maintenanceQueue } from '../queues/maintenanceQueue.js'
import { logger } from '../utils/logger.js'
import { healthMonitor } from '../utils/healthMonitor.js'

export async function getQueueHealth(req: Request, res: Response) {
  try {
    // 1. Get persistent health status from DB
    const healthRecords = await healthMonitor.getFullHealth()

    // 2. Define the set of core "Known Tasks" that should always be visible
    const knownTaskKeys = [
      'worker.ai.profile.application',
      'worker.maintenance.check.deadlines',
      'worker.maintenance.generate.reports',
      'worker.maintenance.retry.emails',
      'worker.maintenance.poll.emails',
      'worker.maintenance.recover.stuck.jobs'
    ]

    // 3. Merge known keys with dynamic keys found in the database
    const dbKeys = healthRecords.current.map((r: any) => r.component_key)
    const allKeys = Array.from(new Set([...knownTaskKeys, ...dbKeys]))

    // 4. Construct live list
    const liveStats = await Promise.all(
      allKeys.map(async (key: string) => {
        const record = healthRecords.current.find((r: any) => r.component_key === key)
        
        // Default counts
        let counts = { active: 0, waiting: 0, failed: 0 }
        
        // Map to parent queues for real-time counts
        let queue = null
        if (key.startsWith('worker.ai')) queue = aiQueue
        else if (key.startsWith('worker.maintenance')) queue = maintenanceQueue
        
        if (queue) {
          counts = await queue.getJobCounts('active', 'waiting', 'failed')
        }

        // Friendly name mapping
        let name = key.split('.').pop()?.replace(/-/g, ' ') || key
        name = name.charAt(0).toUpperCase() + name.slice(1)
        
        if (key === 'worker.ai.profile.application') name = 'AI Profiling'
        else if (key === 'worker.maintenance.poll.emails') name = 'Email Polling'
        else if (key === 'worker.maintenance.retry.emails') name = 'Email Retries'
        else if (key === 'worker.maintenance.generate.reports') name = 'Report Generation'
        else if (key === 'worker.maintenance.check.deadlines') name = 'Deadline Monitor'
        else if (key === 'worker.maintenance.recover.stuck.jobs') name = 'Job Recovery'

        return {
          name,
          key,
          counts,
          status: record?.status || 'idle',
          last_run_at: record?.last_run_at || null
        }
      })
    )

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: healthRecords.current,
      history: healthRecords.history,
      live: liveStats
    })
  } catch (error: any) {
    logger.error('Failed to get queue health:', error)
    res.status(500).json({ success: false, error: error.message })
  }
}
