import type { Request, Response } from 'express'
import { ApplicationRepository } from '../repositories/applicationRepository.js'
import { JobPostingRepository } from '../repositories/jobPostingRepository.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export async function getScheduledInterviews(req: any, res: Response) {
  try {
    const userId = req.userId
    const userEmail = req.userEmail

    if (!userId && !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's company
    let companyId: string | null = null
    
    // Check if user_id column exists in companies table
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' AND column_name = 'user_id'
    `)
    
    if (checkColumn.rows.length > 0) {
      // Find company by user_id
      const companyResult = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`,
        [userId]
      )
      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].company_id
      }
    }
    
    // Fallback: find by email
    if (!companyId && userEmail) {
      const companyResult = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
        [userEmail.toLowerCase()]
      )
      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].company_id
      }
    }

    if (!companyId) {
      return res.status(404).json({ error: 'Company not found' })
    }

    // Get all scheduled interviews for this company (including past ones)
    const { rows } = await query<{
      application_id: string
      candidate_name: string
      email: string
      interview_time: string
      interview_link: string
      job_posting_id: string
      job_title: string
      company_name: string
    }>(
      `SELECT 
        a.application_id,
        a.candidate_name,
        a.email,
        a.interview_time,
        a.interview_link,
        a.job_posting_id,
        j.job_title,
        c.company_name
      FROM applications a
      INNER JOIN job_postings j ON a.job_posting_id = j.job_posting_id
      INNER JOIN companies c ON a.company_id = c.company_id
      WHERE a.company_id = $1 
        AND a.interview_time IS NOT NULL
        AND (a.interview_status = 'SCHEDULED' OR a.interview_status IS NULL)
      ORDER BY a.interview_time ASC`,
      [companyId]
    )

    logger.info(`Found ${rows.length} scheduled interviews for company ${companyId}`, {
      companyId,
      userId,
      userEmail,
      interviews: rows.map(r => ({
        id: r.application_id,
        candidate: r.candidate_name,
        time: r.interview_time,
        job: r.job_title
      }))
    })

    // Get rejected candidates
    const { rows: rejectedRows } = await query<{
      application_id: string
      candidate_name: string
      job_title: string
      reasoning: string
    }>(
      `SELECT 
        a.application_id,
        a.candidate_name,
        j.job_title,
        COALESCE(a.reasoning, 'No reason provided') as reasoning
      FROM applications a
      INNER JOIN job_postings j ON a.job_posting_id = j.job_posting_id
      WHERE a.company_id = $1 
        AND a.ai_status = 'REJECT'`,
      [companyId]
    )

    // Calculate stats
    const now = new Date()
    const upcoming = rows.filter(r => new Date(r.interview_time) > now).length
    const past = rows.filter(r => new Date(r.interview_time) <= now).length
    
    return res.status(200).json({
      success: true,
      stats: {
        total: rows.length,
        upcoming,
        past,
        rejected: rejectedRows.length
      },
      interviews: rows.map(row => ({
        id: row.application_id,
        candidateName: row.candidate_name,
        candidateEmail: row.email,
        jobTitle: row.job_title,
        interviewTime: row.interview_time,
        interviewLink: row.interview_link,
        googleCalendarLink: row.interview_link // For now, mapping both since we only store one link
      })),
      rejectedCandidates: rejectedRows
    })
  } catch (error: any) {
    logger.error('Error fetching scheduled interviews:', error)
    return res.status(500).json({ 
      error: 'Failed to fetch scheduled interviews',
      details: error.message 
    })
  }
}
