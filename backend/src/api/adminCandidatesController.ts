import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

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
