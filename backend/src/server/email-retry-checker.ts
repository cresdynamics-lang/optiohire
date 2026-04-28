/**
 * Background checker for unsent feedback emails
 * Runs every 10 seconds to find and send any missed emails immediately
 */

import { query } from '../db/index.js'
import { EmailService } from '../services/emailService.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { logger } from '../utils/logger.js'

export class EmailRetryChecker {
  private emailService: EmailService
  private companyRepo: CompanyRepository
  private isRunning = false
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL_MS = 5000 // Check every 5 seconds for faster retry

  constructor() {
    this.emailService = new EmailService()
    this.companyRepo = new CompanyRepository()
  }

  start() {
    if (this.isRunning) {
      logger.warn('Email retry checker is already running')
      return
    }

    this.isRunning = true
    logger.info('🔄 Email retry checker started - checking for unsent emails every 10 seconds')

    // Run immediately on start, then every 10 seconds
    this.checkAndSendMissingEmails()
    this.checkInterval = setInterval(() => {
      this.checkAndSendMissingEmails()
    }, this.CHECK_INTERVAL_MS)
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    logger.info('Email retry checker stopped')
  }

  private async checkAndSendMissingEmails() {
    try {
      await this.retryFailedEmailLogs()

      // Find applications with SHORTLIST or REJECT status that don't have sent emails
      // Check applications from last 1 hour
      const { rows: missingEmails } = await query<{
        application_id: string
        email: string
        candidate_name: string | null
        ai_status: string
        ai_score: number | null
        created_at: Date
        job_title: string
        company_id: string
        company_name: string
        company_email: string | null
        company_domain: string | null
      }>(
        `SELECT 
          a.application_id,
          a.email,
          a.candidate_name,
          a.ai_status,
          a.ai_score,
          a.created_at,
          jp.job_title,
          c.company_id,
          c.company_name,
          c.company_email,
          c.company_domain
        FROM applications a
        JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
        JOIN companies c ON jp.company_id = c.company_id
        WHERE a.created_at >= NOW() - INTERVAL '1 hour'
          AND a.ai_status IN ('SHORTLIST', 'REJECT')
          AND NOT EXISTS (
            SELECT 1 
            FROM email_logs el
            WHERE el.recipient_email = a.email
              AND el.email_type IN ('shortlist', 'rejection')
              AND el.created_at >= a.created_at - INTERVAL '10 minutes'
              AND el.created_at <= NOW()
              AND el.status = 'sent'
          )
        ORDER BY a.created_at DESC
        LIMIT 10`
      )

      if (missingEmails.length === 0) {
        return // No missing emails
      }

      logger.info(`🔍 [EMAIL RETRY CHECKER] Found ${missingEmails.length} application(s) with missing feedback emails`)

      for (const app of missingEmails) {
        const emailType = app.ai_status === 'SHORTLIST' ? 'shortlist' : 'rejection'
        
        logger.info(`📧 [EMAIL RETRY CHECKER] Sending ${emailType} email immediately to ${app.email} (Application: ${app.application_id})`)

        try {
          const companyData = await this.companyRepo.findById(app.company_id)

          if (app.ai_status === 'SHORTLIST') {
            await this.emailService.sendShortlistEmail({
              candidateEmail: app.email,
              candidateName: app.candidate_name || 'Candidate',
              jobTitle: app.job_title,
              companyName: companyData?.company_name || app.company_name,
              companyEmail: companyData?.company_email || app.company_email,
              companyDomain: companyData?.company_domain || app.company_domain
            })
            logger.info(`✅ [EMAIL RETRY CHECKER] Shortlist email sent successfully to ${app.email}`)
          } else if (app.ai_status === 'REJECT') {
            await this.emailService.sendRejectionEmail({
              candidateEmail: app.email,
              candidateName: app.candidate_name || 'Candidate',
              jobTitle: app.job_title,
              companyName: companyData?.company_name || app.company_name,
              companyEmail: companyData?.company_email || app.company_email,
              companyDomain: companyData?.company_domain || app.company_domain
            })
            logger.info(`✅ [EMAIL RETRY CHECKER] Rejection email sent successfully to ${app.email}`)
          }
        } catch (err: any) {
          const errorMsg = err?.message || String(err)
          logger.error(`❌ [EMAIL RETRY CHECKER] Failed to send ${emailType} email to ${app.email}:`, {
            error: errorMsg,
            applicationId: app.application_id,
            candidateEmail: app.email,
            status: app.ai_status
          })
        }
      }
    } catch (err: any) {
      logger.error('Error in email retry checker:', err)
    }
  }

  private async retryFailedEmailLogs() {
    const { rows: retryRows } = await query<{
      email_id: string
      recipient_email: string
      subject: string
      email_type: string
      metadata: any
    }>(
      `SELECT email_id, recipient_email, subject, email_type, metadata
       FROM email_logs
       WHERE status = 'failed'
         AND COALESCE((metadata->>'is_retry_eligible')::boolean, true) = true
         AND (
           metadata->>'next_retry_at' IS NULL
           OR (metadata->>'next_retry_at')::timestamptz <= now()
         )
       ORDER BY created_at ASC
       LIMIT 20`
    )

    if (retryRows.length === 0) {
      return
    }

    logger.info(`🔁 [EMAIL RETRY CHECKER] Replaying ${retryRows.length} failed email log(s)`)

    for (const row of retryRows) {
      const metadata = row.metadata || {}
      const html = typeof metadata.html === 'string' ? metadata.html : ''
      const text = typeof metadata.text === 'string' ? metadata.text : ''

      if (!html || !text) {
        logger.warn(`Skipping replay for email log ${row.email_id}: missing html/text payload in metadata`)
        continue
      }

      try {
        await this.emailService.sendEmail({
          to: row.recipient_email,
          subject: row.subject,
          html,
          text,
          from: typeof metadata.from === 'string' ? metadata.from : undefined,
          fromName: typeof metadata.fromName === 'string' ? metadata.fromName : undefined,
          replyTo: typeof metadata.replyTo === 'string' ? metadata.replyTo : undefined,
          emailType: row.email_type || 'general',
          skipLogInsert: true,
          existingEmailLogId: row.email_id
        })
        logger.info(`✅ [EMAIL RETRY CHECKER] Replayed email log ${row.email_id} -> ${row.recipient_email}`)
      } catch (err: any) {
        logger.warn(`❌ [EMAIL RETRY CHECKER] Replay failed for email log ${row.email_id}: ${err?.message || String(err)}`)
      }
    }
  }
}

// Export singleton instance
export const emailRetryChecker = new EmailRetryChecker()
