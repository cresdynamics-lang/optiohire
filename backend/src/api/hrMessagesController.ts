import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { EmailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'
import openRouterService from '../services/ai/openRouterService.js'

/**
 * POST /api/hr/messages
 * Bulk or single custom email from HR to candidate(s).
 * Body: { candidateIds: string[], subject: string, message: string, jobPostingId: string }
 */
export async function sendCandidateMessages(req: Request, res: Response) {
  try {
    const { candidateIds, subject, message, jobPostingId } = req.body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ error: 'candidateIds array is required and must not be empty' })
    }
    if (!subject || !message) {
      return res.status(400).json({ error: 'subject and message are required' })
    }
    if (!jobPostingId) {
      return res.status(400).json({ error: 'jobPostingId is required' })
    }

    // Get job posting info
    const { rows: jobRows } = await query<{
      job_title: string
      company_id: string
    }>(
      `SELECT job_title, company_id FROM job_postings WHERE job_posting_id = $1`,
      [jobPostingId]
    )

    if (jobRows.length === 0) {
      return res.status(404).json({ error: 'Job posting not found' })
    }

    const jobTitle = jobRows[0].job_title
    const companyId = jobRows[0].company_id

    // Get company info
    const { rows: companyRows } = await query<{
      company_name: string
      company_email: string | null
      hr_email: string | null
    }>(
      `SELECT company_name, company_email, hr_email FROM companies WHERE company_id = $1`,
      [companyId]
    )

    if (companyRows.length === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const companyName = companyRows[0].company_name
    const companyEmail = companyRows[0].company_email || companyRows[0].hr_email || 'jobs@optiohire.com'

    // Get candidate details
    const placeholders = candidateIds.map((_, i) => `$${i + 1}`).join(',')
    const { rows: candidates } = await query<{
      application_id: string
      candidate_name: string | null
      email: string
    }>(
      `SELECT application_id, candidate_name, email FROM applications WHERE application_id IN (${placeholders})`,
      candidateIds
    )

    if (candidates.length === 0) {
      return res.status(404).json({ error: 'No candidates found for the given IDs' })
    }

    const emailService = new EmailService()
    let sentCount = 0
    const errors: string[] = []

    for (const candidate of candidates) {
      try {
        await emailService.sendCustomCandidateMessage({
          candidateEmail: candidate.email,
          candidateName: candidate.candidate_name || 'Candidate',
          jobTitle,
          companyName,
          companyEmail,
          messageBody: message
        })
        sentCount++
      } catch (err: any) {
        logger.error(`Failed to send message to ${candidate.email}:`, err)
        errors.push(`${candidate.email}: ${err.message}`)
      }
    }

    logger.info(`HR sent ${sentCount}/${candidates.length} custom messages for job ${jobPostingId}`)

    return res.status(200).json({
      success: true,
      sent: sentCount,
      total: candidates.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    logger.error('Error sending candidate messages:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

/**
 * POST /api/hr/messages/generate
 * Generate a professional email using AI.
 * Body: { prompt: string, jobTitle: string, companyName: string }
 */
export async function generateMessageWithAI(req: Request, res: Response) {
  try {
    const { prompt, jobTitle, companyName } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const systemPrompt = `You are an expert HR assistant writing professional, polite, and clear emails to candidates.
You are writing on behalf of ${companyName} regarding the ${jobTitle} position.
Follow the user's instructions (the prompt) to draft the email body.
Do NOT include the subject line, just the email body. Use placeholders like [Candidate Name] if needed.`

    const generatedText = await openRouterService.generateText(prompt, undefined, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    return res.status(200).json({
      success: true,
      message: generatedText.trim()
    })
  } catch (error: any) {
    logger.error('Error generating message with AI:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

