import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

/**
 * GET /api/candidate/interviews
 * Returns all scheduled interviews for the authenticated candidate (by email).
 */
export async function getCandidateInterviews(req: any, res: Response) {
  try {
    const userEmail = req.userEmail

    if (!userEmail) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    const { rows } = await query<{
      application_id: string
      interview_time: string
      interview_link: string | null
      interview_status: string | null
      job_title: string
      company_name: string
    }>(
      `SELECT
        a.application_id,
        a.interview_time,
        a.interview_link,
        a.interview_status,
        j.job_title,
        c.company_name
      FROM applications a
      INNER JOIN job_postings j ON a.job_posting_id = j.job_posting_id
      INNER JOIN companies c ON a.company_id = c.company_id
      WHERE LOWER(a.email) = LOWER($1)
        AND a.interview_time IS NOT NULL
      ORDER BY a.interview_time ASC`,
      [userEmail]
    )

    const interviews = rows.map(row => {
      const isInPerson = row.interview_link?.startsWith('IN-PERSON|')
      let interviewType: 'online' | 'in-person' = 'online'
      let interviewLink: string | null = row.interview_link
      let location: string | null = null

      if (isInPerson && row.interview_link) {
        interviewType = 'in-person'
        location = row.interview_link.replace('IN-PERSON|', '')
        interviewLink = null
      }

      return {
        id: row.application_id,
        jobTitle: row.job_title,
        companyName: row.company_name,
        interviewTime: row.interview_time,
        interviewLink,
        interviewType,
        location,
        status: row.interview_status || 'SCHEDULED'
      }
    })

    logger.info(`Found ${interviews.length} interviews for candidate ${userEmail}`)

    return res.status(200).json({
      success: true,
      interviews,
      total: interviews.length
    })
  } catch (error: any) {
    logger.error('Failed to fetch candidate interviews:', error)
    return res.status(500).json({
      error: 'Failed to fetch interviews',
      details: error.message
    })
  }
}
