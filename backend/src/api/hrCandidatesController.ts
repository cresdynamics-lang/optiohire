import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { authenticate } from '../middleware/auth.js'
import { EmailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'
import { refreshAnalyticsViews } from './dashboardAnalyticsController.js'
// GET /api/hr/candidates?jobId=...&status=...
export async function getCandidatesByJob(req: Request, res: Response) {
  try {
    const jobId = req.query.jobId as string
    const statusFilter = req.query.status as string

    if (!jobId) {
      return res.status(400).json({ error: 'jobId query parameter is required' })
    }

    // Verify job exists
    const { rows: jobRows } = await query<{ company_id: string }>(
      `SELECT company_id FROM job_postings WHERE job_posting_id = $1`,
      [jobId]
    )

    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const statusCondition = statusFilter ? `AND ai_status = $2` : ''
    const queryParams = statusFilter ? [jobId, statusFilter] : [jobId]

    // Fetch candidates ordered: shortlist first, then flagged, then rejected; within each by score DESC
    const { rows } = await query<{
      application_id: string
      candidate_name: string | null
      email: string
      ai_score: number | null
      ai_status: string | null
      interview_time: string | null
      interview_link: string | null
      interview_status: string | null
      reasoning: string | null
    }>(
      `SELECT 
        application_id,
        candidate_name,
        email,
        ai_score,
        ai_status,
        interview_time,
        interview_link,
        COALESCE(interview_status, 'PENDING') as interview_status,
        reasoning
      FROM applications 
      WHERE job_posting_id = $1 ${statusCondition}
      ORDER BY 
        CASE COALESCE(UPPER(TRIM(ai_status::text)), '')
          WHEN 'SHORTLIST' THEN 1
          WHEN 'FLAG' THEN 2
          WHEN 'REJECT' THEN 3
          ELSE 4
        END,
        ai_score DESC NULLS LAST,
        created_at ASC`,
      queryParams
    )

    // Map to response format with ranking
    const candidates = rows.map((row, index) => ({
      id: row.application_id,
      rank: index + 1,
      candidate_name: row.candidate_name || 'Unknown',
      email: row.email,
      score: row.ai_score ?? null,
      status: row.ai_status || 'PENDING',
      interview_time: row.interview_time,
      interview_link: row.interview_link,
      interview_status: row.interview_status,
      reasoning: row.reasoning || null,
    }))

    return res.json(candidates)
  } catch (error: any) {
    console.error('Error fetching candidates:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/hr/candidates/:id
export async function getCandidateById(req: Request, res: Response) {
  try {
    const applicantId = req.params.id

    // Fetch candidate detail
    const { rows } = await query<{
      application_id: string
      candidate_name: string | null
      email: string
      ai_score: number | null
      ai_status: string | null
      interview_time: string | null
      interview_link: string | null
      parsed_resume_json: any
      reasoning: string | null
      resume_url: string | null
      job_posting_id: string
    }>(
      `SELECT 
        application_id,
        candidate_name,
        email,
        ai_score,
        ai_status,
        interview_time,
        interview_link,
        parsed_resume_json,
        reasoning,
        resume_url,
        job_posting_id
      FROM applications 
      WHERE application_id = $1`,
      [applicantId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' })
    }

    const app = rows[0]

    return res.json({
      id: app.application_id,
      candidate_name: app.candidate_name || 'Unknown',
      email: app.email,
      score: app.ai_score ?? null,
      status: app.ai_status || 'PENDING',
      interview_time: app.interview_time,
      interview_link: app.interview_link,
      parsed_resume: app.parsed_resume_json || {},
      reasoning: app.reasoning || '',
      resume_url: app.resume_url || '',
    })
  } catch (error: any) {
    console.error('Error fetching candidate detail:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// PATCH /api/hr/candidates/:id/status
export async function updateCandidateStatus(req: Request, res: Response) {
  try {
    const candidateId = req.params.id
    const { status, reason } = req.body

    if (!['HIRED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: "status must be 'HIRED' or 'REJECTED'" })
    }

    // Get current candidate details for the email and logging
    const { rows } = await query<{
      application_id: string
      candidate_name: string | null
      email: string
      job_title: string
      company_name: string
      reasoning: string | null
    }>(
      `SELECT a.application_id, a.candidate_name, a.email, a.reasoning,
              j.job_title, c.company_name
       FROM applications a
       JOIN job_postings j ON a.job_posting_id = j.job_posting_id
       JOIN companies c ON j.company_id = c.company_id
       WHERE a.application_id = $1`,
      [candidateId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' })
    }

    const candidate = rows[0]
    let newReasoning = candidate.reasoning || ''

    if (status === 'REJECTED' && reason) {
      // Append the HR reason
      newReasoning = newReasoning ? `${newReasoning}\n\n[HR Rejected]: ${reason}` : `[HR Rejected]: ${reason}`
    }

    await query(
      `UPDATE applications SET ai_status = $1, reasoning = $2, updated_at = NOW() WHERE application_id = $3`,
      [status, newReasoning, candidateId]
    )

    if (status === 'REJECTED') {
      const emailService = new EmailService()
      await emailService.sendTalentPoolNotification({
        candidateEmail: candidate.email,
        candidateName: candidate.candidate_name || 'Candidate',
        jobTitle: candidate.job_title,
        companyName: candidate.company_name
      }).catch(err => logger.error('Failed to send talent pool email:', err))
    }

    return res.json({ success: true, status, reasoning: newReasoning })
  } catch (error: any) {
    logger.error('Error updating candidate status:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/hr/candidates/:id/view
export async function recordCandidateView(req: Request, res: Response) {
  try {
    const candidateId = req.params.id
    const hrUserId = (req as any).userId

    if (!hrUserId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // 1. Get user_id from applications table
    const { rows: appRows } = await query<{ user_id: string }>(
      `SELECT user_id FROM applications WHERE application_id = $1`,
      [candidateId]
    )
    if (appRows.length === 0 || !appRows[0].user_id) {
      return res.status(404).json({ error: 'Candidate or user not found' })
    }

    // 2. Get profile_id from candidate_profiles
    const { rows: profRows } = await query<{ profile_id: string }>(
      `SELECT profile_id FROM candidate_profiles WHERE user_id = $1`,
      [appRows[0].user_id]
    )
    if (profRows.length === 0) {
      return res.status(404).json({ error: 'Candidate profile not found' })
    }

    // 3. Insert view
    await query(
      `INSERT INTO recruiter_profile_views (profile_id, hr_user_id) VALUES ($1, $2)`,
      [profRows[0].profile_id, hrUserId]
    )

    return res.json({ success: true })
  } catch (error: any) {
    logger.error('Error recording candidate view:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/hr/candidates/leaderboard
export async function getTalentPoolLeaderboard(req: Request, res: Response) {
  try {
    const { rows } = await query(`
      SELECT 
        u.user_id, 
        u.name, 
        u.email, 
        cp.total_score,
        cp.profile_id,
        (SELECT COUNT(*) FROM candidate_skills cs WHERE cs.profile_id = cp.profile_id AND (cs.is_verified = true OR cs.certificate_status = 'APPROVED')) as verified_skills_count
      FROM users u
      JOIN candidate_profiles cp ON u.user_id = cp.user_id
      WHERE u.role = 'CANDIDATE'
      ORDER BY cp.total_score DESC NULLS LAST
      LIMIT 100
    `)
    return res.json({ success: true, data: rows })
  } catch (error: any) {
    logger.error('Error fetching talent pool leaderboard:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
