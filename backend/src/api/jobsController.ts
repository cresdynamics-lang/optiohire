import type { Request, Response } from 'express'
import { query } from '../db/index.js'

export async function createJob(req: Request, res: Response) {
  try {
    const {
      company_id,
      job_title,
      job_description,
      responsibilities,
      skills_required,
      application_deadline,
      interview_slots,
      interview_meeting_link
    } = req.body || {}

    if (!company_id || !job_title || !job_description || !responsibilities) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { rows } = await query<{ job_posting_id: string }>(
      `insert into job_postings (
         company_id, job_title, job_description, responsibilities, skills_required,
         application_deadline, interview_slots, interview_meeting_link
       ) values ($1,$2,$3,$4,$5,$6,$7,$8)
       returning job_posting_id`,
      [
        company_id,
        job_title,
        job_description,
        responsibilities,
        (skills_required ?? []) as string[],
        application_deadline ?? null,
        interview_slots ? JSON.stringify(interview_slots) : null,
        interview_meeting_link ?? null
      ]
    )

    const jobPostingId = rows[0].job_posting_id

    await query(
      `insert into audit_logs (action, company_id, job_posting_id, metadata)
       values ('JOB_CREATED',$1,$2,$3::jsonb)`,
      [company_id, jobPostingId, JSON.stringify({ job_title })]
    )

    return res.status(201).json({ job_posting_id: jobPostingId })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create job' })
  }
}

export async function getApplicantsByJob(req: Request, res: Response) {
  try {
    const jobId = req.params.id
    const { rows } = await query(
      `select application_id, candidate_name, email, ai_score, ai_status, created_at
       from applications
       where job_posting_id = $1
       order by created_at desc`,
      [jobId]
    )
    return res.status(200).json({ applicants: rows })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch applicants' })
  }
}

// GET all public active job postings
export async function getPublicJobs(req: Request, res: Response) {
  try {
    const { rows } = await query(
      `SELECT jp.job_posting_id as id, jp.job_posting_id, jp.job_title, jp.job_description, 
              jp.responsibilities, jp.skills_required, jp.application_deadline, 
              jp.status, jp.created_at, c.company_name, c.company_email, c.company_logo_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.status = 'ACTIVE'
       ORDER BY jp.created_at DESC`
    )
    return res.status(200).json({ jobs: rows })
  } catch (err) {
    console.error('Failed to get public jobs:', err)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
}

// GET single public job posting by ID
export async function getPublicJobById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { rows } = await query(
      `SELECT jp.job_posting_id as id, jp.job_posting_id, jp.job_title, jp.job_description, 
              jp.responsibilities, jp.skills_required, jp.application_deadline, 
              jp.status, jp.created_at, c.company_name, c.company_email, c.company_logo_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.job_posting_id = $1 AND jp.status = 'ACTIVE'`,
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or inactive' })
    }
    
    return res.status(200).json({ job: rows[0] })
  } catch (err) {
    console.error('Failed to get public job details:', err)
    return res.status(500).json({ error: 'Failed to fetch job details' })
  }
}



