import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { verifyCaptcha } from '../utils/captcha.js'
import { cache, cacheKeys } from '../utils/redis.js'
import crypto from 'crypto'

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

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
      interview_meeting_link,
      job_poster_url
    } = req.body || {}

    if (!company_id || !job_title || !job_description || !responsibilities) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const baseSlug = slugify(job_title);
    const shortId = crypto.randomBytes(3).toString('hex');
    const slug = `${baseSlug}-${shortId}`;

    const { rows } = await query<{ job_posting_id: string }>(
      `insert into job_postings (
         company_id, job_title, job_description, responsibilities, skills_required,
         application_deadline, interview_slots, interview_meeting_link, job_poster_url, slug
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning job_posting_id`,
      [
        company_id,
        job_title,
        job_description,
        responsibilities,
        (skills_required ?? []) as string[],
        application_deadline ?? null,
        interview_slots ? JSON.stringify(interview_slots) : null,
        interview_meeting_link ?? null,
        job_poster_url ?? null,
        slug
      ]
    )

    const jobPostingId = rows[0].job_posting_id

    await query(
      `insert into audit_logs (action, company_id, job_posting_id, metadata)
       values ('JOB_CREATED',$1,$2,$3::jsonb)`,
      [company_id, jobPostingId, JSON.stringify({ job_title })]
    )

    // Invalidate public jobs cache
    await cache.del(cacheKeys.publicJobs())

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
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    
    // Verify captcha
    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
    }

    // Try cache first
    const cacheKey = cacheKeys.publicJobs()
    const cached = await cache.get<{ jobs: any[] }>(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const { rows } = await query(
      `SELECT jp.job_posting_id as id, jp.job_posting_id, jp.slug, jp.job_title, jp.job_description, 
              jp.responsibilities, jp.skills_required, jp.application_deadline, 
              jp.status, jp.created_at, jp.custom_questions, jp.job_poster_url, c.company_name, c.company_email, c.company_logo_url, c.website_url, c.linkedin_url, c.twitter_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.status = 'ACTIVE'
       ORDER BY jp.created_at DESC`
    )
    
    const result = { jobs: rows }
    // Cache for 1 hour
    await cache.set(cacheKey, result, 3600)
    
    return res.json(result)
  } catch (err) {
    console.error('Failed to get public jobs:', err)
    return res.status(500).json({ error: 'Failed to fetch jobs' })
  }
}

// GET single public job posting by ID
export async function getPublicJobById(req: Request, res: Response) {
  try {
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    
    // Verify captcha
    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
    }

    const { id } = req.params
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid job ID' })
    }

    // Try cache first
    const cacheKey = cacheKeys.publicJob(id)
    const cached = await cache.get<{ job: any }>(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    const { rows } = await query(
      `SELECT jp.job_posting_id as id, jp.job_posting_id, jp.slug, jp.job_title, jp.job_description, 
              jp.responsibilities, jp.skills_required, jp.application_deadline, 
              jp.status, jp.created_at, jp.custom_questions, jp.job_poster_url, c.company_name, c.company_email, c.company_logo_url, c.website_url, c.linkedin_url, c.twitter_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE (jp.job_posting_id::text = $1 OR jp.slug = $1) AND jp.status = 'ACTIVE'`,
      [id]
    )
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Job not found or inactive' })
    }
    
    const result = { job: rows[0] }
    // Cache for 2 days
    await cache.set(cacheKey, result, 172800)
    
    return res.json(result)
  } catch (err) {
    console.error('Failed to get public job details:', err)
    return res.status(500).json({ error: 'Failed to fetch job details' })
  }
}
