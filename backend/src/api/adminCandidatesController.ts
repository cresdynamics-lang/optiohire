import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export async function getAllCandidates(req: Request, res: Response) {
  try {
    const { rows } = await query(`
      SELECT 
        a.application_id as id,
        a.candidate_name,
        a.email,
        a.ai_status as status,
        a.reasoning,
        a.hr_rejection_reason,
        a.interview_time,
        a.interview_status,
        a.hired_at,
        a.rejected_at,
        a.created_at,
        j.job_title as "jobTitle",
        c.company_name as "companyName"
      FROM applications a
      JOIN job_postings j ON a.job_posting_id = j.job_posting_id
      JOIN companies c ON j.company_id = c.company_id
      ORDER BY a.created_at DESC
    `)
    return res.json({ success: true, candidates: rows })
  } catch (error: any) {
    logger.error('Error fetching all candidates:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function revertCandidate(req: Request, res: Response) {
  try {
    const { id } = req.params

    // Revert to SHORTLIST, clear hired_at and rejected_at
    await query(`
      UPDATE applications 
      SET ai_status = 'SHORTLIST', hired_at = NULL, rejected_at = NULL, hr_rejection_reason = NULL
      WHERE application_id = $1
    `, [id])

    return res.json({ success: true, message: 'Candidate reverted to SHORTLIST' })
  } catch (error: any) {
    logger.error('Error reverting candidate:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getCandidateDecisions(req: Request, res: Response) {
  try {
    const { rows } = await query(`
      SELECT 
        a.application_id as id,
        a.candidate_name,
        a.email,
        a.ai_status as status,
        a.reasoning,
        a.updated_at,
        j.job_title as "jobTitle",
        c.company_name as "companyName"
      FROM applications a
      JOIN job_postings j ON a.job_posting_id = j.job_posting_id
      JOIN companies c ON j.company_id = c.company_id
      WHERE a.ai_status IN ('HIRED', 'REJECTED')
      ORDER BY a.updated_at DESC
    `)

    return res.json({ success: true, decisions: rows })
  } catch (error: any) {
    logger.error('Error fetching candidate decisions:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
