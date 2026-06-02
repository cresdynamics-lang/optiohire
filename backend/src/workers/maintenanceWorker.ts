import { Worker, Job } from 'bullmq'
import { redisConnection } from '../queues/connection.js'
import { MAINTENANCE_QUEUE_NAME } from '../queues/maintenanceQueue.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { generatePostDeadlineReport } from '../services/reports/reportService.js'
import { EmailService } from '../services/emailService.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { resendWebhookPoller } from '../services/resendWebhookPoller.js'
import { healthMonitor } from '../utils/healthMonitor.js'

const emailService = new EmailService()
const companyRepo = new CompanyRepository()

export class MaintenanceWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      MAINTENANCE_QUEUE_NAME,
      async (job: Job) => {
        const taskKey = `worker.maintenance.${job.name.replace(/-/g, '.')}`;
        logger.info(`🛠️ [MAINTENANCE] Picking up job: ${job.name} (${taskKey})`)
        try {
          await healthMonitor.updateStatus(taskKey, 'running', null, { jobId: job.id });
          
          if (job.name === 'check-deadlines') await this.checkDeadlines()
          else if (job.name === 'generate-reports') await this.generateReports()
          else if (job.name === 'retry-emails') await this.retryEmails()
          else if (job.name === 'poll-emails') await this.pollEmails()
          else if (job.name === 'recover-stuck-jobs') await this.recoverStuckJobs()
          
          await healthMonitor.updateStatus(taskKey, 'idle', null, { lastCompletedJobId: job.id });
        } catch (error: any) {
          logger.error(`❌ Maintenance Job Failed (#${job.id}):`, error)
          await healthMonitor.updateStatus(taskKey, 'error', error.message, { lastFailedJobId: job.id });
          throw error
        }
      },
      { connection: redisConnection, concurrency: 1 }
    )

    this.worker.on('failed', async (job, err) => {
      const taskKey = job ? `worker.maintenance.${job.name.replace(/-/g, '.')}` : 'worker.maintenance.unknown';
      logger.error(`❌ Maintenance task #${job?.id} failed:`, { message: err.message })
      await healthMonitor.updateStatus(taskKey, 'error', err.message, { lastFailedJobId: job?.id });
    })
  }

  private async pollEmails() {
    await resendWebhookPoller.poll()
  }

  private async recoverStuckJobs() {
    const { rows } = await query<{ application_id: string }>(
      `SELECT application_id FROM applications 
       WHERE ai_status IS NULL 
       AND created_at >= NOW() - INTERVAL '24 hours' LIMIT 50`
    )

    if (rows.length === 0) return

    const { aiQueue } = await import('../queues/aiQueue.js')
    for (const app of rows) {
      await aiQueue.add('profile-application', { applicationId: app.application_id }, {
        jobId: `recovery-${app.application_id}` // Avoid duplicates
      })
    }
    logger.info(`🩹 [RECOVERY] Re-enqueued ${rows.length} stuck applications`)
  }

  private async checkDeadlines() {
    const { rows: jobs } = await query<{ job_posting_id: string; job_title: string; status: string }>(
      `SELECT job_posting_id, job_title, status FROM job_postings 
       WHERE application_deadline IS NOT NULL AND application_deadline <= NOW() AND status IN ('ACTIVE', 'DRAFT') LIMIT 100`
    )

    if (jobs.length === 0) return

    for (const job of jobs) {
      const res = await query(
        `UPDATE job_postings SET status = 'CLOSED', updated_at = NOW() 
         WHERE job_posting_id = $1 AND status IN ('ACTIVE', 'DRAFT')`,
        [job.job_posting_id]
      )

      if (res.rowCount === 0) continue

      logger.info(`🚫 Closed job: ${job.job_title} (${job.job_posting_id})`)
      await query(
        `INSERT INTO audit_logs (action, job_posting_id, metadata) VALUES ('job_posting.status_closed', $1, $2::jsonb)`,
        [job.job_posting_id, JSON.stringify({ reason: 'deadline_passed', automated: true })]
      )
    }
  }

  private async generateReports() {
    const { rows: jobs } = await query<{ job_posting_id: string }>(
      `SELECT jp.job_posting_id FROM job_postings jp 
       LEFT JOIN reports r ON r.job_posting_id = jp.job_posting_id
       WHERE (jp.application_deadline < NOW() OR jp.status = 'CLOSED') AND r.id IS NULL LIMIT 20`
    )

    if (jobs.length === 0) return

    for (const job of jobs) {
      try {
        const res = await generatePostDeadlineReport(job.job_posting_id)
        logger.info(`📊 Generated report: ${res.reportId} for job ${job.job_posting_id}`)
      } catch (err) {
        logger.error(`❌ Report generation failed: ${job.job_posting_id}`, err)
      }
    }
  }

  private async retryEmails() {
    await this.retryFailedLogs()
    await this.sendMissingFeedback()
  }

  private async retryFailedLogs() {
    const { rows } = await query<{ email_id: string; recipient_email: string; subject: string; email_type: string; metadata: any }>(
      `SELECT email_id, recipient_email, subject, email_type, metadata FROM email_logs 
       WHERE status = 'failed' AND (metadata->>'is_retry_eligible' IS NULL OR (metadata->>'is_retry_eligible')::boolean = true) AND (metadata->>'next_retry_at' IS NULL OR (metadata->>'next_retry_at')::timestamptz <= NOW()) LIMIT 20`
    )

    for (const row of rows) {
      const { html, text } = row.metadata || {}
      if (!html || !text) continue

      try {
        await emailService.sendEmail({
          to: row.recipient_email, subject: row.subject, html, text,
          emailType: row.email_type, skipLogInsert: true, existingEmailLogId: row.email_id
        })
        logger.info(`📨 Retried email: ${row.email_id}`)
      } catch (err) {
        logger.warn(`❌ Retry failed: ${row.email_id}`)
      }
    }
  }

  private async sendMissingFeedback() {
    const { rows } = await query<any>(
      `SELECT a.*, jp.job_title, c.company_name, c.company_email, c.company_domain 
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       JOIN companies c ON jp.company_id = c.company_id
       WHERE a.created_at >= NOW() - INTERVAL '1 hour' AND a.ai_status IN ('SHORTLIST', 'REJECT', 'FLAG')
       AND NOT EXISTS (
         SELECT 1 FROM email_logs el WHERE el.recipient_email = a.email AND el.status = 'sent'
         AND el.created_at >= a.created_at - INTERVAL '10 minutes'
       ) LIMIT 10`
    )

    for (const app of rows) {
      try {
        const args = { candidateEmail: app.email, candidateName: app.candidate_name, jobTitle: app.job_title, companyName: app.company_name, companyEmail: app.company_email, companyDomain: app.company_domain }
        if (app.ai_status === 'SHORTLIST') await emailService.sendShortlistEmail(args)
        else if (app.ai_status === 'REJECT') await emailService.sendRejectionEmail(args)
        else if (app.ai_status === 'FLAG') await emailService.sendFlagReviewEmail(args)
        logger.info(`📨 Sent missing ${app.ai_status} email to ${app.email}`)
      } catch (err) {
        logger.error(`❌ Failed missing email: ${app.email}`, err)
      }
    }
  }
}
