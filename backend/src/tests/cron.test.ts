import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- MOCKS ---
vi.mock('../db/index.js', () => ({
  query: vi.fn(),
}))

vi.mock('../utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))

vi.mock('../services/reports/reportService.js', () => ({
  generatePostDeadlineReport: vi.fn().mockResolvedValue({ reportId: 'rep123' })
}))

vi.mock('../queues/connection.js', () => ({
  redisConnection: {}
}))

vi.mock('bullmq', () => {
  return {
    Queue: class {
      add = vi.fn()
      addBulk = vi.fn()
      on = vi.fn()
    },
    Worker: class {
      on = vi.fn()
      close = vi.fn()
    }
  }
})

import { query } from '../db/index.js'
import { generatePostDeadlineReport } from '../services/reports/reportService.js'
import { MaintenanceWorker } from '../workers/maintenanceWorker.js'

describe('MaintenanceWorker (Cron Tasks)', () => {
  let worker: any

  beforeEach(() => {
    vi.clearAllMocks()
    worker = new MaintenanceWorker()
  })

  describe('checkDeadlines', () => {
    it('should close jobs that have passed their deadline', async () => {
      // Mock finding expired jobs
      (query as any).mockImplementation((sql: string) => {
        if (sql.includes('SELECT job_posting_id')) {
          return Promise.resolve({ rows: [{ job_posting_id: 'job1', job_title: 'Expired Job' }] })
        }
        if (sql.includes('UPDATE job_postings')) {
          return Promise.resolve({ rowCount: 1 })
        }
        if (sql.includes('INSERT INTO audit_logs')) {
          return Promise.resolve({ rowCount: 1 })
        }
        return Promise.resolve({ rows: [] })
      })

      // We need to access private method for testing, or use casting
      await (worker as any).checkDeadlines()

      expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE job_postings SET status = \'CLOSED\''), expect.any(Array))
    })

    it('should do nothing if no expired jobs are found', async () => {
      (query as any).mockResolvedValue({ rows: [] })
      await (worker as any).checkDeadlines()
      expect(query).toHaveBeenCalledTimes(1) // Only the select
    })
  })

  describe('generateReports', () => {
    it('should generate reports for closed jobs without reports', async () => {
      (query as any).mockImplementation((sql: string) => {
        if (sql.includes('SELECT jp.job_posting_id')) {
          return Promise.resolve({ rows: [{ job_posting_id: 'job1' }] })
        }
        return Promise.resolve({ rows: [] })
      })

      await (worker as any).generateReports()

      expect(generatePostDeadlineReport).toHaveBeenCalledWith('job1')
    })
  })
})
