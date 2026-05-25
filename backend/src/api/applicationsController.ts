import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { startImapIngestion } from '../utils/imap.js'
import { parseResumeText } from '../services/ai/resumeParser.js'
import { scoreCandidate as scoreCandidateScreening } from '../services/ai/screening.js'
import { AIScoringEngine } from '../lib/ai-scoring.js'
import { EmailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'

async function scanCandidateLinks(links: string[]): Promise<string[]> {
  const uniqueLinks = Array.from(new Set(links.filter(Boolean))).slice(0, 5)
  const timeoutMs = Number(process.env.CANDIDATE_LINK_SCAN_TIMEOUT_MS || 4500)
  const insights: string[] = []

  await Promise.all(
    uniqueLinks.map(async (link) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const response = await fetch(link, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'OptioHire/1.0 (+candidate-portal-scanner)' }
        })
        const contentType = response.headers.get('content-type') || 'unknown'
        if (!response.ok) {
          insights.push(`${link} -> ${response.status} ${response.statusText}`)
          return
        }
        const raw = await response.text()
        const preview = raw
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 240)
        insights.push(`${link} -> ${contentType}; preview: ${preview || 'No readable content'}`)
      } catch (error: any) {
        const reason = error?.name === 'AbortError' ? 'timeout' : (error?.message || 'failed to fetch')
        insights.push(`${link} -> ${reason}`)
      } finally {
        clearTimeout(timeout)
      }
    })
  )

  return insights
}

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
    const { application_id, job_posting_id } = req.body || {}
    if (!application_id || !job_posting_id) {
      return res.status(400).json({ error: 'Missing application_id or job_posting_id' })
    }

    const { rows: existingRows } = await query<{ ai_status: string | null }>(
      `select ai_status from applications where application_id = $1`,
      [application_id]
    )
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Application not found' })
    }
    if (existingRows[0].ai_status) {
      return res.status(409).json({ error: 'Already scored' })
    }

    const { rows: jobRows } = await query(
      `select job_title, job_description, responsibilities, skills_required
       from job_postings where job_posting_id = $1`,
      [job_posting_id]
    )
    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job not found' })
    }
    const job = jobRows[0] as {
      job_title: string
      job_description: string
      responsibilities: string
      skills_required: string[]
    }

    const { rows: appRows } = await query(
      `select email, candidate_name, resume_url, parsed_resume_json
       from applications where application_id = $1`,
      [application_id]
    )
    const app = appRows[0] as any

    const parsed = app.parsed_resume_json || (await parseResumeText(''))
    const candidateLinks = [
      parsed?.links?.resumeUrl,
      parsed?.links?.linkedinUrl,
      parsed?.links?.githubUrl,
      parsed?.links?.otherUrl,
      ...(Array.isArray(parsed?.links?.other_links) ? parsed.links.other_links : []),
    ].filter((value): value is string => Boolean(value && typeof value === 'string'))
    const linkInsights = await scanCandidateLinks(candidateLinks)
    const fallbackCvText = [
      parsed?.note ? `Candidate note: ${String(parsed.note)}` : '',
      candidateLinks.length ? `Submitted links: ${candidateLinks.join(', ')}` : '',
      linkInsights.length ? `Link insights: ${linkInsights.join(' | ')}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const cvText =
      (typeof parsed?.textContent === 'string' && parsed.textContent.trim())
        ? parsed.textContent.trim()
        : fallbackCvText

    // Get company for Groq scoring and for emails
    const { rows: companyRows } = await query(
      `SELECT c.company_id, c.company_name, c.company_email, c.company_domain, c.hr_email, c.hiring_manager_email, c.settings, jp.meeting_link
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       JOIN companies c ON jp.company_id = c.company_id
       WHERE a.application_id = $1`,
      [application_id]
    )
    const company = companyRows[0] as Record<string, unknown> | undefined

    let score: number
    let reasoning: string
    let dbStatus: 'SHORTLIST' | 'FLAG' | 'REJECT'

    if (cvText && company) {
      const aiScoring = new AIScoringEngine()
      const scoringResult = await aiScoring.scoreCandidate({
        job: {
          title: job.job_title,
          description: job.job_description,
          responsibilities: job.responsibilities || '',
          required_skills: Array.isArray(job.skills_required) ? job.skills_required : []
        },
        company: {
          company_name: (company.company_name as string) || '',
          company_domain: (company.company_domain as string) ?? null,
          company_email: (company.company_email as string) ?? null,
          hr_email: (company.hr_email as string) ?? null,
          hiring_manager_email: (company.hiring_manager_email as string) ?? null,
          settings: company.settings ?? null
        },
        cvText
        ,
        candidateEvidence: {
          linkedin: parsed?.links?.linkedinUrl || null,
          github: parsed?.links?.githubUrl || null,
          other_links: candidateLinks,
          link_insights: linkInsights,
        }
      })
      score = scoringResult.score
      reasoning = scoringResult.reasoning
      dbStatus = scoringResult.status === 'FLAGGED' ? 'FLAG' : scoringResult.status === 'REJECTED' ? 'REJECT' : 'SHORTLIST'
      if (scoringResult.audit) {
        logger.info('AI fairness audit (manual scoreApplication)', {
          applicationId: application_id,
          jobPostingId: job_posting_id,
          ...scoringResult.audit,
        })
      }
    } else {
      const result = await scoreCandidateScreening(parsed, {
        jobTitle: job.job_title,
        description: job.job_description,
        responsibilities: job.responsibilities,
        skills: job.skills_required || []
      })
      score = result.score
      reasoning = result.reasoning
      dbStatus = result.status
    }

    await query(
      `update applications
       set ai_score = $1, ai_status = $2, reasoning = $3, parsed_resume_json = coalesce(parsed_resume_json, $4::jsonb)
       where application_id = $5`,
      [score, dbStatus, reasoning, JSON.stringify(parsed), application_id]
    )

    // Send email notification to candidate
    try {
      const emailService = new EmailService()
      if (company) {
        if (dbStatus === 'SHORTLIST') {
          logger.info(`📧 Sending shortlist email to ${app.email} for application ${application_id}`)
          await emailService.sendShortlistEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: job.job_title,
            companyName: (company.company_name as string) || '',
            companyEmail: (company.company_email as string) ?? undefined,
            companyDomain: (company.company_domain as string) ?? undefined
            // No interview link/date/time: HR sends those when they use the Schedule button
          })
          logger.info(`✅ Shortlist email sent successfully to ${app.email}`)
        } else if (dbStatus === 'REJECT') {
          logger.info(`📧 Sending rejection email to ${app.email} for application ${application_id}`)
          await emailService.sendRejectionEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: job.job_title,
            companyName: (company.company_name as string) || '',
            companyEmail: (company.company_email as string) ?? undefined,
            companyDomain: (company.company_domain as string) ?? undefined
          })
          logger.info(`✅ Rejection email sent successfully to ${app.email}`)
        } else if (dbStatus === 'FLAG') {
          logger.info(`📧 Sending flag review email to ${app.email} for application ${application_id}`)
          await emailService.sendFlagReviewEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: job.job_title,
            companyName: (company.company_name as string) || '',
            companyEmail: (company.company_email as string) ?? undefined,
            companyDomain: (company.company_domain as string) ?? undefined
          })
          logger.info(`✅ Flag review email sent successfully to ${app.email}`)
        }
      }
    } catch (emailError: any) {
      const errorMsg = emailError?.message || String(emailError)
      logger.error(`❌ Failed to send candidate decision email for application ${application_id}:`, errorMsg)
      // Continue - don't fail the request if email fails
    }

    return res.status(200).json({ score, status: dbStatus, reasoning })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to score application' })
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



