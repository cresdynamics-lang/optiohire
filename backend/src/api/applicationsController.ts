import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { startImapIngestion } from '../utils/imap.js'
import { logger } from '../utils/logger.js'
import { aiQueue } from '../queues/aiQueue.js'

export async function parseEmailApplications(req: Request, res: Response) {
  try {
    startImapIngestion().catch(() => {})
    return res.status(202).json({ message: 'IMAP parsing triggered' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger email parsing' })
  }
}

export async function scoreApplication(req: Request, res: Response) {
  try {
    const { application_id } = req.body || {}
    if (!application_id) {
      return res.status(400).json({ error: 'Missing application_id' })
    }

    const { rows } = await query<{ ai_status: string | null }>(
      'SELECT ai_status FROM applications WHERE application_id = $1',
      [application_id]
    )
    
    if (rows.length === 0) return res.status(404).json({ error: 'Application not found' })
    if (rows[0].ai_status) return res.status(409).json({ error: 'Already scored' })

    await aiQueue.add('profile-application', { applicationId: application_id })
    
    return res.status(202).json({ message: 'Scoring task queued' })
  } catch (err) {
    logger.error('Error queuing application score:', err)
    return res.status(500).json({ error: 'Failed to queue scoring task' })
  }
}

export async function submitPublicApplication(req: Request, res: Response) {
  try {
    const { job_posting_id, candidate_name, email, resume_url, cover_letter, phone } = req.body || {}

    if (!job_posting_id || !candidate_name || !email || !resume_url) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { rows: jobRows } = await query(
      'SELECT company_id, status FROM job_postings WHERE job_posting_id = $1',
      [job_posting_id]
    )

    if (jobRows.length === 0) return res.status(404).json({ error: 'Job posting not found' })
    if (jobRows[0].status !== 'ACTIVE') return res.status(400).json({ error: 'Job is no longer active' })

    const { rows: existing } = await query(
      'SELECT application_id FROM applications WHERE job_posting_id = $1 AND email = $2',
      [job_posting_id, email.toLowerCase()]
    )
    if (existing.length > 0) return res.status(409).json({ error: 'Already applied' })

    const { rows: newApp } = await query<{ application_id: string }>(
      `INSERT INTO applications (job_posting_id, company_id, candidate_name, email, resume_url, phone, parsed_resume_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING application_id`,
      [job_posting_id, jobRows[0].company_id, candidate_name, email.toLowerCase(), resume_url, phone || null, JSON.stringify({ cover_letter: cover_letter || null })]
    )

    const applicationId = newApp[0].application_id
    await aiQueue.add('profile-application', { applicationId })

    return res.status(201).json({ 
      success: true, 
      message: 'Application submitted and queued for AI profiling',
      application_id: applicationId
    })
  } catch (err: any) {
    logger.error('Error submitting public application:', err)
    return res.status(500).json({ error: 'Failed to submit application' })
  }
}

// Submit a direct candidate application from the web portal
export async function submitWebApplication(req: Request, res: Response) {
  try {
    const { job_posting_id, candidate_name, email, phone, resume_url } = req.body || {}
    
    if (!job_posting_id || !email || !candidate_name) {
      return res.status(400).json({ error: 'Job ID, name, and email are required' })
    }

    // Get company_id from job_postings
    const { rows: jobs } = await query<{ company_id: string; job_title: string }>(
      `SELECT company_id, job_title FROM job_postings WHERE job_posting_id = $1`,
      [job_posting_id]
    )

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job posting not found' })
    }

    const { company_id } = jobs[0]

    // Create candidate application row
    const { rows: ins } = await query<{ application_id: string }>(
      `INSERT INTO applications (job_posting_id, company_id, candidate_name, email, phone, resume_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING application_id`,
      [job_posting_id, company_id, candidate_name, email.toLowerCase(), phone || null, resume_url || null]
    )

    const applicationId = ins[0].application_id

    // Asynchronously trigger AI scoring and notification emails
    setTimeout(async () => {
      try {
        console.log(`[Background AI Scoring] Starting scoring for application ${applicationId}...`)
        // Create a mock req and res to reuse the existing scoreApplication logic
        const mockReq = {
          body: {
            application_id: applicationId,
            job_posting_id: job_posting_id
          }
        } as Request;
        const mockRes = {
          status: () => ({
            json: (data: any) => {
              console.log(`[Background AI Scoring] Completed for ${applicationId}:`, data)
            }
          }),
          json: (data: any) => {
            console.log(`[Background AI Scoring] Completed for ${applicationId}:`, data)
          }
        } as unknown as Response;

        await scoreApplication(mockReq, mockRes)
      } catch (err) {
        console.error(`[Background AI Scoring] Error scoring application ${applicationId}:`, err)
      }
    }, 1000)

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application_id: applicationId
    })
  } catch (err: any) {
    console.error('Failed to submit application:', err)
    return res.status(500).json({ error: 'Failed to submit application', details: err?.message })
  }
}




