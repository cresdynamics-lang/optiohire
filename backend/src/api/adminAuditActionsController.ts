import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logAdminAction } from '../utils/adminLogger.js'
import { logger } from '../utils/logger.js'
import { EmailService } from '../services/emailService.js'

// Max applications per bulk-rescore request — keeps AI worker (concurrency 5)
// and batch scoring service (concurrency 3) safe from rate-limit spikes.
const BULK_RESCORE_CAP = 10
// Stagger delay between queue insertions (ms)
const QUEUE_STAGGER_MS = 500

function extractMissingSkills(audit: any): string[] {
  const candidates = [
    audit?.skills?.missing,
    audit?.skill_match?.missing,
    audit?.skillMatch?.missing,
    audit?.breakdown?.skill_match?.missing,
    audit?.breakdown?.skills?.missing,
    audit?.missing_skills,
    audit?.missingSkills
  ]

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value
        .map((skill) => typeof skill === 'string' ? skill : skill?.name || skill?.skill)
        .filter((skill): skill is string => typeof skill === 'string' && skill.trim().length > 0)
    }
  }

  return []
}

// ============================================================================
// SINGLE RESCORE
// ============================================================================

export async function rescoreApplication(req: AuthRequest, res: Response) {
  try {
    const { application_id } = req.body as { application_id?: string }
    if (!application_id) {
      return res.status(400).json({ error: 'application_id is required' })
    }

    // Validate application exists and has a resume
    const { rows } = await query<{
      application_id: string
      resume_url: string | null
      candidate_name: string | null
      email: string
      job_posting_id: string
    }>(
      `SELECT application_id, resume_url, candidate_name, email, job_posting_id
       FROM applications WHERE application_id = $1 LIMIT 1`,
      [application_id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const app = rows[0]
    if (!app.resume_url) {
      return res.status(400).json({ error: 'Application has no resume — cannot rescore' })
    }

    // Mark as PENDING so the UI shows it's re-processing
    await query(
      `UPDATE applications
       SET ai_status = NULL, ai_score = NULL, updated_at = NOW()
       WHERE application_id = $1`,
      [application_id]
    )

    // Queue for AI processing (same flow as the original upload)
    const { aiQueue } = await import('../queues/aiQueue.js')
    await aiQueue.add('profile-application', { applicationId: application_id }, {
      priority: 1, // Higher priority than fresh applications
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    })

    await logAdminAction(req, 'rescore_application', 'application', application_id, {
      candidate: app.candidate_name || app.email,
      job_posting_id: app.job_posting_id
    })

    logger.info(`[Admin Rescore] Queued rescore for application ${application_id}`)

    return res.json({
      success: true,
      message: 'Application queued for rescoring',
      application_id
    })
  } catch (err: any) {
    logger.error('[Admin Rescore] Error:', err)
    return res.status(500).json({ error: 'Failed to queue rescore' })
  }
}

// ============================================================================
// BULK RESCORE
// ============================================================================

export async function bulkRescoreApplications(req: AuthRequest, res: Response) {
  try {
    const { application_ids } = req.body as { application_ids?: string[] }

    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({ error: 'application_ids array is required' })
    }

    if (application_ids.length > BULK_RESCORE_CAP) {
      return res.status(400).json({
        error: `Bulk rescore is capped at ${BULK_RESCORE_CAP} applications per request to respect AI rate limits`,
        cap: BULK_RESCORE_CAP
      })
    }

    const { rows: apps } = await query<{
      application_id: string
      resume_url: string | null
      candidate_name: string | null
      email: string
    }>(
      `SELECT application_id, resume_url, candidate_name, email
       FROM applications
       WHERE application_id = ANY($1::uuid[])`,
      [application_ids]
    )

    const found = new Set(apps.map((a) => a.application_id))
    const notFound = application_ids.filter((id) => !found.has(id))
    const noResume = apps.filter((a) => !a.resume_url).map((a) => a.application_id)
    const eligible = apps.filter((a) => !!a.resume_url)

    if (eligible.length === 0) {
      return res.status(400).json({
        error: 'None of the selected applications have a resume to score',
        not_found: notFound,
        no_resume: noResume
      })
    }

    // Mark all eligible as PENDING
    await query(
      `UPDATE applications
       SET ai_status = NULL, ai_score = NULL, updated_at = NOW()
       WHERE application_id = ANY($1::uuid[])`,
      [eligible.map((a) => a.application_id)]
    )

    // Queue with staggered delays to prevent AI API bursting
    const { aiQueue } = await import('../queues/aiQueue.js')
    const queued: string[] = []

    for (let i = 0; i < eligible.length; i++) {
      const app = eligible[i]
      const delay = i * QUEUE_STAGGER_MS

      await aiQueue.add(
        'profile-application',
        { applicationId: app.application_id },
        {
          delay,
          priority: 1,
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 }
        }
      )
      queued.push(app.application_id)
    }

    await logAdminAction(req, 'bulk_rescore_applications', 'application', undefined, {
      requested: application_ids.length,
      queued: queued.length,
      not_found: notFound,
      no_resume: noResume
    })

    logger.info(`[Admin Bulk Rescore] Queued ${queued.length} applications for rescore`)

    return res.json({
      success: true,
      message: `${queued.length} application(s) queued for rescoring`,
      queued: queued.length,
      skipped_not_found: notFound,
      skipped_no_resume: noResume
    })
  } catch (err: any) {
    logger.error('[Admin Bulk Rescore] Error:', err)
    return res.status(500).json({ error: 'Failed to queue bulk rescore' })
  }
}

// ============================================================================
// OVERRIDE DECISION
// ============================================================================

export async function overrideDecision(req: AuthRequest, res: Response) {
  try {
    const { application_id, new_status, admin_note, send_email } = req.body as {
      application_id?: string
      new_status?: 'SHORTLIST' | 'FLAG' | 'REJECT'
      admin_note?: string
      send_email?: boolean
    }

    if (!application_id) return res.status(400).json({ error: 'application_id is required' })
    if (!new_status || !['SHORTLIST', 'FLAG', 'REJECT'].includes(new_status)) {
      return res.status(400).json({ error: 'new_status must be SHORTLIST, FLAG, or REJECT' })
    }

    // Fetch current application + job + company for context
    const { rows } = await query<{
      application_id: string
      ai_score: number | null
      ai_status: string | null
      reasoning: string | null
      ai_audit_log: any
      candidate_name: string | null
      email: string
      job_posting_id: string
      job_title: string | null
      company_name: string | null
      company_email: string | null
      hr_email: string | null
    }>(
      `SELECT
         a.application_id, a.ai_score, a.ai_status, a.reasoning, a.ai_audit_log,
         a.candidate_name, a.email,
         a.job_posting_id,
         jp.job_title,
         c.company_name, c.company_email, c.hr_email
       FROM applications a
       LEFT JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
       LEFT JOIN companies c ON c.company_id = a.company_id
       WHERE a.application_id = $1
       LIMIT 1`,
      [application_id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const app = rows[0]
    const prevStatus = app.ai_status
    const prevScore = app.ai_score

    // Map SHORTLIST/REJECT/FLAG to DB values (SHORTLIST → SHORTLIST, REJECT → REJECT, FLAG → FLAG)
    const dbStatus = new_status === 'REJECT' ? 'REJECT' : new_status === 'FLAG' ? 'FLAG' : 'SHORTLIST'

    // Build updated audit log preserving the original AI decision
    const existingAudit = app.ai_audit_log || {}
    const updatedAudit = {
      ...existingAudit,
      admin_override: {
        overridden_at: new Date().toISOString(),
        overridden_by: req.userId,
        previous_status: prevStatus,
        previous_score: prevScore,
        new_status: dbStatus,
        admin_note: admin_note || null
      }
    }

    // Append admin note to reasoning
    const noteBlock = admin_note
      ? `\n\n[Admin Override ${new Date().toLocaleString()}]: ${admin_note}`
      : ''
    const newReasoning = (app.reasoning || '') + noteBlock

    await query(
      `UPDATE applications
       SET ai_status = $1,
           reasoning = $2,
           ai_audit_log = $3::jsonb
       WHERE application_id = $4`,
      [dbStatus, newReasoning, JSON.stringify(updatedAudit), application_id]
    )

    await logAdminAction(req, 'override_ai_decision', 'application', application_id, {
      prev_status: prevStatus,
      new_status: dbStatus,
      admin_note: admin_note || null
    })

    // Optionally send candidate the reconsideration email
    if (send_email) {
      try {
        const emailService = new EmailService()
        const candidateLoginUrl = `${process.env.FRONTEND_URL || 'https://optiohire.com'}/auth/signin`

        // Extract missing skills from AI audit log if present
        const missingSkills = extractMissingSkills(existingAudit)

        await emailService.sendReconsiderationEmail({
          candidateEmail: app.email,
          candidateName: app.candidate_name || '',
          jobTitle: app.job_title || 'this position',
          companyName: app.company_name || '',
          companyEmail: app.company_email || app.hr_email || '',
          missingSkills,
          candidateLoginUrl
        })
        logger.info(`[Admin Override] Reconsideration email sent to ${app.email}`)
      } catch (emailErr: any) {
        logger.error('[Admin Override] Failed to send reconsideration email:', emailErr)
        // Don't fail the override if email fails
      }
    }

    return res.json({
      success: true,
      message: `Decision overridden to ${dbStatus}`,
      application_id,
      previous_status: prevStatus,
      new_status: dbStatus,
      email_sent: !!send_email
    })
  } catch (err: any) {
    logger.error('[Admin Override] Error:', err)
    return res.status(500).json({ error: 'Failed to override decision' })
  }
}
