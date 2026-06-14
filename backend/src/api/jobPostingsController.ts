import type { Request, Response } from 'express'
import { z } from 'zod'
import { pool, query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { verifyCaptcha } from '../utils/captcha.js'
import { APPLICATION_INBOX_EMAIL, getRecommendedApplicationSubject } from '../config/applicationInbox.js'
import { cache, cacheKeys } from '../utils/redis.js'

const createJobSchema = z.object({
  company_name: z.string().min(2).max(255),
  company_email: z.string().email(),
  hr_email: z.string().email(),
  job_title: z.string().min(3).max(255),
  job_description: z.string().min(50),
  required_skills: z.array(z.string().min(1)).nonempty(),
  application_deadline: z.string().refine(val => !isNaN(Date.parse(val)) && new Date(val) > new Date(), {
    message: 'deadline must be a future datetime'
  }),
  meeting_link: z.string().url().optional(),
  job_poster_url: z.string().url().optional(),
})

function domainFromEmail(email: string): string | null {
  const at = email.indexOf('@')
  if (at === -1) return null
  return email.slice(at + 1).toLowerCase()
}

export async function getJobPostings(req: Request, res: Response) {
  try {
    const authReq = req as any
    const userId = authReq.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Find company by user_id
    let companyId: string | null = null
    
    // Check if user_id column exists
    const checkClient = await pool.connect()
    let hasUserIdColumn = false
    try {
      const checkResult = await checkClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'user_id'
      `)
      hasUserIdColumn = checkResult.rows.length > 0
    } catch (err) {
      console.log('⚠️ Could not check for user_id column')
    } finally {
      checkClient.release()
    }

    // Get company_id
    if (hasUserIdColumn) {
      const { rows: companyRows } = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`,
        [userId]
      )
      if (companyRows.length > 0) {
        companyId = companyRows[0].company_id
      }
    }

    if (!companyId) {
      // Fallback: get user email and find company by email
      const { rows: userRows } = await query<{ email: string; role: string }>(
        `SELECT email, role FROM users WHERE user_id = $1`,
        [userId]
      )
      if (userRows.length > 0) {
        // If admin, allow access to all jobs
        if (userRows[0].role === 'admin') {
          companyId = null // Will show all jobs
        } else {
          const { rows: companyRows } = await query<{ company_id: string }>(
            `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
            [userRows[0].email]
          )
          if (companyRows.length > 0) {
            companyId = companyRows[0].company_id
          }
        }
      }
    }

    // Get all job postings from database
    // Include user's company jobs and also jobs from "strive" company
    let companyIds: string[] = []
    if (companyId) {
      companyIds.push(companyId)
    }
    
    // Also find "strive" company if it exists (for demo/testing)
    try {
      const { rows: striveCompany } = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE LOWER(company_name) LIKE '%strive%' LIMIT 1`
      )
      if (striveCompany.length > 0 && !companyIds.includes(striveCompany[0].company_id)) {
        companyIds.push(striveCompany[0].company_id)
      }
    } catch (err) {
      // Ignore strive company lookup errors
      console.log('Could not find strive company:', err)
    }

    // Get all job postings - show all jobs if no specific company filter
    const { rows: jobs } = await query<{
      job_posting_id: string
      company_id: string
      job_title: string
      job_description: string
      responsibilities: string
      skills_required: string[]
      application_deadline: string | null
      interview_start_time: string | null
      status: string
      created_at: string
      updated_at: string
      meeting_link: string | null
      interview_meeting_link: string | null
      job_poster_url: string | null
    }>(
      companyIds.length > 0
        ? `SELECT 
            job_posting_id,
            company_id,
            job_title,
            job_description,
            responsibilities,
            skills_required,
            application_deadline,
            interview_start_time,
            status,
            created_at,
            updated_at,
            meeting_link,
            interview_meeting_link,
            job_poster_url
          FROM job_postings
          WHERE company_id = ANY($1)
          ORDER BY created_at DESC`
        : `SELECT 
            job_posting_id,
            company_id,
            job_title,
            job_description,
            responsibilities,
            skills_required,
            application_deadline,
            interview_start_time,
            status,
            created_at,
            updated_at,
            meeting_link,
            interview_meeting_link,
            job_poster_url
          FROM job_postings
          ORDER BY created_at DESC`,
      companyIds.length > 0 ? [companyIds] : []
    )

    // Get applicant counts for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        try {
          const { rows: stats } = await query<{
            total: string
            shortlisted: string
            rejected: string
            flagged: string
          }>(
            `SELECT 
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE ai_status = 'SHORTLIST') as shortlisted,
              COUNT(*) FILTER (WHERE ai_status = 'REJECT') as rejected,
              COUNT(*) FILTER (WHERE ai_status = 'FLAG') as flagged
            FROM applications
            WHERE job_posting_id = $1`,
            [job.job_posting_id]
          )

          return {
            ...job,
            id: job.job_posting_id,
            job_posting_id: job.job_posting_id,
            required_skills: Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []),
            meeting_link: job.meeting_link || job.interview_meeting_link || null,
            interview_meeting_link: job.interview_meeting_link || job.meeting_link || null,
            job_poster_url: job.job_poster_url || null,
            interview_start_time: job.interview_start_time || null,
            applicant_count: Number(stats[0]?.total || 0),
            shortlisted_count: Number(stats[0]?.shortlisted || 0),
            rejected_count: Number(stats[0]?.rejected || 0),
            flagged_count: Number(stats[0]?.flagged || 0),
          }
        } catch (statErr) {
          console.error('Error fetching stats for job:', job.job_posting_id, statErr)
          return {
            ...job,
            id: job.job_posting_id,
            job_posting_id: job.job_posting_id,
            required_skills: Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []),
            meeting_link: job.meeting_link || job.interview_meeting_link || null,
            interview_meeting_link: job.interview_meeting_link || job.meeting_link || null,
            job_poster_url: job.job_poster_url || null,
            interview_start_time: job.interview_start_time || null,
            applicant_count: 0,
            shortlisted_count: 0,
            rejected_count: 0,
            flagged_count: 0,
          }
        }
      })
    )

    // Get reports counts for the user's companies (best effort)
    let reportsCounts: { total_reports: string; ready_reports: string } = { total_reports: '0', ready_reports: '0' }
    try {
      if (companyIds.length > 0) {
        const { rows: reportCountRows } = await query<{ total_reports: string; ready_reports: string }>(
          `SELECT 
            COUNT(*)::int as total_reports,
            COUNT(*) FILTER (WHERE status = 'completed')::int as ready_reports
           FROM reports
           WHERE company_id = ANY($1)`,
          [companyIds]
        )
        reportsCounts = reportCountRows[0] || reportsCounts
      }
    } catch (reportErr) {
      console.warn('Failed to load report counts for job-postings response:', reportErr)
    }

    const totalReports = Number(reportsCounts.total_reports || 0)
    const readyReports = Number(reportsCounts.ready_reports || 0)

    return res.json({ 
      jobs: jobsWithStats,
      reports: {
        totalReports,
        readyReports
      }
    })
  } catch (err) {
    console.error('Error fetching job postings:', err)
    return res.json({ jobs: [] })
  }
}

export async function createJobPosting(req: Request, res: Response) {
  const parse = createJobSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.flatten() })
  }

  const payload = parse.data
  const cleanSkills = Array.from(new Set((payload.required_skills || []).map(s => s.trim().toLowerCase()).filter(s => s.length > 0)))
  const applicationDeadline = new Date(payload.application_deadline)
  
  if (isNaN(applicationDeadline.getTime())) {
    return res.status(400).json({ 
      success: false, 
      error: { message: 'Invalid application_deadline format' } 
    })
  }

  let hasUserIdColumn = false
  try {
    const checkResult = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'companies' AND column_name = 'user_id'
    `)
    hasUserIdColumn = checkResult.rows.length > 0
  } catch (err) {
    console.log('⚠️ Could not check for user_id column')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const companyDomain = domainFromEmail(payload.company_email) || domainFromEmail(payload.hr_email) || null
    let companyRow: { company_id: string } | null = null

    if (companyDomain) {
      const c1 = await client.query<{ company_id: string }>(
        `select company_id from companies where company_domain = $1 limit 1`,
        [companyDomain]
      )
      companyRow = c1.rows[0] || null
    }
    if (!companyRow) {
      const c2 = await client.query<{ company_id: string }>(
        `select company_id from companies where company_email = $1 limit 1`,
        [payload.company_email]
      )
      companyRow = c2.rows[0] || null
    }

    if (!companyRow) {
      const userId = (req as any).userId || null
      let ins
      if (hasUserIdColumn && userId) {
        ins = await client.query<{ company_id: string }>(
          `insert into companies (user_id, company_name, hr_email, hiring_manager_email, company_domain, company_email)
           values ($1,$2,$3,$4,$5,$6)
           returning company_id`,
          [userId, payload.company_name, payload.hr_email, payload.hr_email, companyDomain ?? payload.company_email.split('@')[1], payload.company_email]
        )
      } else {
        ins = await client.query<{ company_id: string }>(
          `insert into companies (company_name, hr_email, hiring_manager_email, company_domain, company_email)
           values ($1,$2,$3,$4,$5)
           returning company_id`,
          [payload.company_name, payload.hr_email, payload.hr_email, companyDomain ?? payload.company_email.split('@')[1], payload.company_email]
        )
      }
      companyRow = ins.rows[0]
    } else {
      const userId = (req as any).userId || null
      if (hasUserIdColumn && userId) {
        await client.query(
          `update companies set user_id = coalesce($2, user_id), company_name = coalesce($3, company_name), hr_email = $4, company_email = $5, updated_at = now() where company_id = $1`,
          [companyRow.company_id, userId, payload.company_name, payload.hr_email, payload.company_email]
        )
      } else {
        await client.query(
          `update companies set company_name = coalesce($2, company_name), hr_email = $3, company_email = $4, updated_at = now() where company_id = $1`,
          [companyRow.company_id, payload.company_name, payload.hr_email, payload.company_email]
        )
      }
    }

    const companyId = companyRow.company_id
    const meetingLink = payload.meeting_link ?? null

    const { rows: jobIns } = await client.query<{ job_posting_id: string }>(
      `INSERT INTO job_postings 
       (company_id, job_title, job_description, responsibilities, skills_required, application_deadline, interview_slots, interview_meeting_link, meeting_link, job_poster_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'OPEN')
       RETURNING job_posting_id`,
      [companyId, payload.job_title, payload.job_description, payload.job_description, cleanSkills, applicationDeadline.toISOString(), null, meetingLink, meetingLink, payload.job_poster_url || null]
    )

    const jobPostingId = jobIns[0].job_posting_id
    const secret = (await import('crypto')).randomBytes(32).toString('hex')
    const base = process.env.PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`
    const webhookUrl = `${base}/inbound/applications/${jobPostingId}`

    await client.query(
      `update job_postings set webhook_receiver_url = $2, webhook_secret = $3, updated_at = now() where job_posting_id = $1`,
      [jobPostingId, webhookUrl, secret]
    )

    await client.query(
      `insert into audit_logs (action, company_id, job_posting_id, metadata)
       values ('job_posting.created', $1, $2, $3::jsonb)`,
      [companyId, jobPostingId, JSON.stringify({ job_title: payload.job_title })]
    )

    await client.query('COMMIT')

    // Invalidate public jobs cache
    await cache.del(cacheKeys.publicJobs())

    const recipients = [payload.hr_email, payload.company_email].filter((email): email is string => Boolean(email && email.includes('@')))
    if (recipients.length > 0) {
      try {
        const emailService = new (await import('../services/emailService.js')).EmailService()
        await emailService.sendJobPostingCreatedEmail({
          recipients,
          jobTitle: payload.job_title,
          companyName: payload.company_name,
          applicationDeadline: applicationDeadline.toISOString()
        })
      } catch (emailErr) {
        logger.error('Failed to send job posting created email:', emailErr)
      }
    }

    // Trigger Talent Pool Matching logic via aiWorker
    try {
      const { aiQueue } = await import('../queues/aiQueue.js');
      await aiQueue.add('talent-pool-match', { jobPostingId });
      logger.info(`Queued talent pool matching for job: ${jobPostingId}`);
    } catch (queueErr) {
      logger.error('Failed to queue talent pool matching:', queueErr);
    }

    return res.status(201).json({
      success: true,
      job_posting_id: jobPostingId,
      company_id: companyId,
      message: 'Job posted successfully',
      applicationInboxEmail: APPLICATION_INBOX_EMAIL,
      recommendedApplicationSubject: getRecommendedApplicationSubject(payload.job_title, payload.company_name)
    })
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    logger.error('Job posting creation error:', err)
    return res.status(500).json({ success: false, error: { message: 'Failed to create job posting' } })
  } finally {
    client.release()
  }
}

async function getAccessibleCompanyIds(userId: string, userEmail: string): Promise<string[]> {
  const normalizedEmail = userEmail.toLowerCase()
  const { rows } = await query<{ company_id: string }>(
    `SELECT DISTINCT company_id
     FROM companies
     WHERE user_id = $1
        OR LOWER(company_email) = $2
        OR LOWER(hr_email) = $2
        OR LOWER(hiring_manager_email) = $2`,
    [userId, normalizedEmail]
  )
  return rows.map((row) => row.company_id)
}

export async function getJobPostingById(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { rows } = await query<{
      job_posting_id: string
      interview_meeting_link: string | null
      meeting_link: string | null
    }>(
      `SELECT job_posting_id, interview_meeting_link, meeting_link
       FROM job_postings 
       WHERE job_posting_id = $1
       LIMIT 1`,
      [id]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' })

    const job = rows[0]
    return res.json({
      id: job.job_posting_id,
      meeting_link: job.meeting_link || job.interview_meeting_link || '',
    })
  } catch (err) {
    logger.error('Error fetching job posting:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateJobPosting(req: Request, res: Response) {
  try {
    const { id } = req.params
    const authReq = req as any
    const userId = authReq.userId
    const email = authReq.userEmail

    const companyIds = await getAccessibleCompanyIds(userId, email)
    if (companyIds.length === 0) return res.status(403).json({ error: 'Access denied' })

    const body = req.body
    const updates: string[] = []
    const values: any[] = []
    let param = 1

    if (typeof body.job_title === 'string' && body.job_title.trim()) {
      updates.push(`job_title = $${param++}`)
      values.push(body.job_title.trim())
    }
    if (typeof body.job_description === 'string') {
      updates.push(`job_description = $${param++}`)
      values.push(body.job_description)
    }
    if (Array.isArray(body.required_skills)) {
      updates.push(`skills_required = $${param++}`)
      values.push(body.required_skills)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'application_deadline')) {
      updates.push(`application_deadline = $${param++}`)
      values.push(body.application_deadline || null)
    }
    if (Object.prototype.hasOwnProperty.call(body, 'meeting_link')) {
      updates.push(`meeting_link = $${param++}`)
      values.push(body.meeting_link || null)
      updates.push(`interview_meeting_link = $${param++}`)
      values.push(body.meeting_link || null)
    }
    if (typeof body.status === 'string') {
      const normalizedStatus = body.status.trim().toUpperCase()
      const allowedStatuses = new Set(['ACTIVE', 'DRAFT', 'CLOSED', 'PAUSED'])
      if (allowedStatuses.has(normalizedStatus)) {
        updates.push(`status = $${param++}`)
        values.push(normalizedStatus)
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields provided' })

    values.push(id)
    values.push(companyIds)

    const { rows } = await query(
      `UPDATE job_postings
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE job_posting_id = $${param++}
         AND company_id = ANY($${param}::uuid[])
       RETURNING job_posting_id`,
      values
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' })

    await cache.del(cacheKeys.publicJobs())
    return res.json({ success: true })
  } catch (err) {
    logger.error('Error updating job posting:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteJobPosting(req: Request, res: Response) {
  try {
    const { id } = req.params
    const authReq = req as any
    const userId = authReq.userId
    const email = authReq.userEmail

    const companyIds = await getAccessibleCompanyIds(userId, email)
    if (companyIds.length === 0) return res.status(403).json({ error: 'Access denied' })

    const { rows } = await query(
      `DELETE FROM job_postings
       WHERE job_posting_id = $1
         AND company_id = ANY($2::uuid[])
       RETURNING job_posting_id`,
      [id, companyIds]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'Job not found' })

    await cache.del(cacheKeys.publicJobs())
    return res.json({ success: true })
  } catch (err) {
    logger.error('Error deleting job posting:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// GET all public active job postings
export async function getPublicJobPostings(req: Request, res: Response) {
  try {
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
    }

    const cacheKey = cacheKeys.publicJobs()
    const cached = await cache.get<{ jobs: any[] }>(cacheKey)
    if (cached) return res.json(cached)

    const { rows: jobs } = await query(
      `SELECT jp.job_posting_id, jp.company_id, jp.job_title, jp.job_description, jp.skills_required, jp.application_deadline, jp.status, jp.created_at, jp.job_poster_url, c.company_name, c.company_logo_url, c.website_url, c.linkedin_url, c.twitter_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.status = 'ACTIVE'
       ORDER BY jp.created_at DESC`
    )
    
    const result = { jobs }
    await cache.set(cacheKey, result, 3600)
    return res.json(result)
  } catch (err) {
    logger.error('Error fetching public job postings:', err)
    return res.json({ jobs: [] })
  }
}

export async function getPublicJobPostingById(req: Request, res: Response) {
  try {
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
    }

    const { id } = req.params
    const cacheKey = cacheKeys.publicJob(id)
    const cached = await cache.get<{ job: any }>(cacheKey)
    if (cached) return res.json(cached)

    const { rows: jobs } = await query(
      `SELECT jp.job_posting_id, jp.company_id, jp.job_title, jp.job_description, jp.responsibilities, jp.skills_required, jp.application_deadline, jp.status, jp.created_at, jp.job_poster_url, c.company_name, c.company_logo_url, c.company_domain, c.website_url, c.linkedin_url, c.twitter_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.job_posting_id = $1 AND jp.status = 'ACTIVE'
       LIMIT 1`,
      [id]
    )

    if (jobs.length === 0) return res.status(404).json({ error: 'Job posting not found' })

    const result = { job: jobs[0] }
    await cache.set(cacheKey, result, 172800)
    return res.json(result)
  } catch (err) {
    logger.error('Error fetching public job posting by id:', err)
    return res.status(404).json({ error: 'Job posting not found' })
  }
}

export async function getPublicCompanyJobPostings(req: Request, res: Response) {
  try {
    const captchaToken = req.headers['x-captcha-token'] as string | undefined
    const isCaptchaValid = await verifyCaptcha(captchaToken)
    if (!isCaptchaValid) {
      return res.status(400).json({ error: 'Invalid captcha. Please try again.' })
    }

    const { companyId } = req.params
    const { rows: jobs } = await query(
      `SELECT jp.job_posting_id, jp.company_id, jp.job_title, jp.job_description, jp.skills_required, jp.application_deadline, jp.status, jp.created_at, jp.job_poster_url, c.company_name, c.company_logo_url, c.website_url, c.linkedin_url, c.twitter_url
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE jp.company_id = $1 AND jp.status = 'ACTIVE'
       ORDER BY jp.created_at DESC`,
      [companyId]
    )

    const { rows: companyRows } = await query(
      `SELECT company_name, company_logo_url, website_url, linkedin_url, twitter_url FROM companies WHERE company_id = $1 LIMIT 1`,
      [companyId]
    )

    return res.json({ jobs, company: companyRows[0] || null })
  } catch (err) {
    logger.error('Error fetching public company job postings:', err)
    return res.json({ jobs: [], company: null })
  }
}
