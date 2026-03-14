/**
 * Admin endpoint to check all applications and send missing emails
 */

import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { EmailService } from '../services/emailService.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { logger } from '../utils/logger.js'

/**
 * Check all applications and send missing feedback emails
 * POST /api/admin/check-and-send-emails
 */
export async function checkAndSendMissingEmails(req: Request, res: Response) {
  try {
    logger.info('🔍 [ADMIN] Starting comprehensive email check and send operation')

    const emailService = new EmailService()
    const companyRepo = new CompanyRepository()

    // 1. Get all applications with SHORTLIST or REJECT status
    const { rows: applications } = await query<{
      application_id: string
      email: string
      candidate_name: string | null
      ai_status: string
      ai_score: number | null
      created_at: Date
      job_title: string
      job_posting_id: string
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
        jp.job_posting_id,
        c.company_id,
        c.company_name,
        c.company_email,
        c.company_domain
      FROM applications a
      JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
      JOIN companies c ON jp.company_id = c.company_id
      WHERE a.ai_status IN ('SHORTLIST', 'REJECT')
      ORDER BY a.created_at DESC`
    )

    logger.info(`📊 [ADMIN] Found ${applications.length} application(s) with SHORTLIST or REJECT status`)

    const results = {
      totalApplications: applications.length,
      checked: 0,
      alreadySent: 0,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ applicationId: string; email: string; error: string }>
    }

    // 2. Check each application and send email if missing
    for (const app of applications) {
      results.checked++

      const emailType = app.ai_status === 'SHORTLIST' ? 'shortlist' : 'rejection'

      // Check if email was already sent
      const { rows: emailLogs } = await query<{
        email_id: string
        status: string
        sent_at: Date | null
      }>(
        `SELECT email_id, status, sent_at
         FROM email_logs
         WHERE recipient_email = $1
           AND email_type = $2
           AND created_at >= $3::timestamp - INTERVAL '1 hour'
           AND created_at <= NOW()
           AND status = 'sent'
         ORDER BY created_at DESC
         LIMIT 1`,
        [app.email, emailType, app.created_at]
      )

      if (emailLogs.length > 0 && emailLogs[0].status === 'sent') {
        results.alreadySent++
        logger.info(`✅ [ADMIN] Email already sent: ${app.email} (${app.ai_status})`)
        continue
      }

      // Try to send email
      logger.info(`📧 [ADMIN] Sending ${emailType} email to ${app.email} (Application: ${app.application_id})`)

      try {
        const companyData = await companyRepo.findById(app.company_id)

        if (app.ai_status === 'SHORTLIST') {
          await emailService.sendShortlistEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: app.job_title,
            companyName: companyData?.company_name || app.company_name,
            companyEmail: companyData?.company_email || app.company_email,
            companyDomain: companyData?.company_domain || app.company_domain
          })
          results.sent++
          logger.info(`✅ [ADMIN] Shortlist email sent successfully to ${app.email}`)
        } else if (app.ai_status === 'REJECT') {
          await emailService.sendRejectionEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: app.job_title,
            companyName: companyData?.company_name || app.company_name,
            companyEmail: companyData?.company_email || app.company_email,
            companyDomain: companyData?.company_domain || app.company_domain
          })
          results.sent++
          logger.info(`✅ [ADMIN] Rejection email sent successfully to ${app.email}`)
        }
      } catch (err: any) {
        results.failed++
        const errorMsg = err?.message || String(err)
        results.errors.push({
          applicationId: app.application_id,
          email: app.email,
          error: errorMsg
        })
        logger.error(`❌ [ADMIN] Failed to send ${emailType} email to ${app.email}:`, {
          error: errorMsg,
          applicationId: app.application_id
        })
      }
    }

    logger.info(`✅ [ADMIN] Email check and send operation completed:`, results)

    res.json({
      success: true,
      message: 'Email check and send operation completed',
      results
    })
  } catch (err: any) {
    logger.error('❌ [ADMIN] Error in checkAndSendMissingEmails:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to check and send emails'
    })
  }
}

/**
 * Get statistics about applications and emails
 * GET /api/admin/email-check-stats
 */
export async function getEmailCheckStats(req: Request, res: Response) {
  try {
    // Get total applications
    const { rows: appStats } = await query<{
      total: string
      shortlisted: string
      rejected: string
      flagged: string
      pending: string
    }>(
      `SELECT 
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE ai_status = 'SHORTLIST')::text as shortlisted,
        COUNT(*) FILTER (WHERE ai_status = 'REJECT')::text as rejected,
        COUNT(*) FILTER (WHERE ai_status = 'FLAG')::text as flagged,
        COUNT(*) FILTER (WHERE ai_status IS NULL)::text as pending
      FROM applications`
    )

    // Get total jobs
    const { rows: jobStats } = await query<{
      total: string
      active: string
    }>(
      `SELECT 
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::text as active
      FROM job_postings`
    )

    // Get email stats
    const { rows: emailStats } = await query<{
      total: string
      sent: string
      failed: string
      pending: string
    }>(
      `SELECT 
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status = 'sent')::text as sent,
        COUNT(*) FILTER (WHERE status = 'failed')::text as failed,
        COUNT(*) FILTER (WHERE status = 'pending')::text as pending
      FROM email_logs
      WHERE email_type IN ('shortlist', 'rejection')`
    )

    // Get applications missing emails
    const { rows: missingEmails } = await query<{
      count: string
    }>(
      `SELECT COUNT(*)::text as count
       FROM applications a
       WHERE a.ai_status IN ('SHORTLIST', 'REJECT')
         AND NOT EXISTS (
           SELECT 1 
           FROM email_logs el
           WHERE el.recipient_email = a.email
             AND el.email_type IN ('shortlist', 'rejection')
             AND el.created_at >= a.created_at - INTERVAL '10 minutes'
             AND el.created_at <= NOW()
             AND el.status = 'sent'
         )`
    )

    res.json({
      applications: {
        total: parseInt(appStats[0]?.total || '0'),
        shortlisted: parseInt(appStats[0]?.shortlisted || '0'),
        rejected: parseInt(appStats[0]?.rejected || '0'),
        flagged: parseInt(appStats[0]?.flagged || '0'),
        pending: parseInt(appStats[0]?.pending || '0')
      },
      jobs: {
        total: parseInt(jobStats[0]?.total || '0'),
        active: parseInt(jobStats[0]?.active || '0')
      },
      emails: {
        total: parseInt(emailStats[0]?.total || '0'),
        sent: parseInt(emailStats[0]?.sent || '0'),
        failed: parseInt(emailStats[0]?.failed || '0'),
        pending: parseInt(emailStats[0]?.pending || '0')
      },
      missingEmails: parseInt(missingEmails[0]?.count || '0')
    })
  } catch (err: any) {
    logger.error('❌ [ADMIN] Error getting email check stats:', err)
    res.status(500).json({
      error: err.message || 'Failed to get email check stats'
    })
  }
}
