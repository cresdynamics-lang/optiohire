import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { openRouterService } from '../services/ai/openRouterService.js'
import { ResendService } from '../services/resendService.js'

export async function getTalentPool(req: Request, res: Response) {
  try {
    const { rows } = await query(`
      SELECT 
        tp.id,
        tp.talent_id,
        tp.job_posting_id,
        tp.application_id,
        tp.applied_at,
        t.candidate_name,
        t.email,
        t.phone,
        t.skills_summary,
        t.experience_years,
        t.ai_score_avg,
        a.reasoning
      FROM talent_pool_applications tp
      JOIN talent_pool t ON tp.talent_id = t.talent_id
      JOIN applications a ON tp.application_id = a.application_id
      ORDER BY tp.applied_at DESC
    `)
    return res.json({ success: true, talentPool: rows })
  } catch (error: any) {
    logger.error('Error fetching talent pool:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function generatePersonalisedEmail(req: Request, res: Response) {
  try {
    const { candidateName, email, jobTitle, companyName, skillsSummary, reasoning } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Missing email' })
    }

    const prompt = `
Candidate: ${candidateName || 'Candidate'}
Email: ${email}
Previous Application: ${jobTitle || 'Role'} at ${companyName || 'our company'}
Skills: ${skillsSummary || 'Various'}
AI Feedback: ${reasoning || 'Not selected at this time'}

Write a warm, professional, personalised email from OptioHire encouraging this candidate to keep their profile updated and apply for future roles. 
Reference their specific skills if any are listed. Do NOT explicitly say they were rejected, instead focus on adding them to our exclusive talent pool. 
Keep it under 3 short paragraphs.
Sign off as: OptioHire Talent Team
`

    const draft = await openRouterService.generateText(prompt, undefined, {
      systemPrompt: 'You are an expert HR recruiter writing warm follow-up emails.'
    })

    return res.json({ success: true, draft: draft || 'Thank you for your interest. We will keep your profile in our talent pool for future opportunities.' })
  } catch (error: any) {
    logger.error('Error generating personalised email:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function bulkGenerateAndSend(req: Request, res: Response) {
  try {
    const { candidates } = req.body

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Missing candidates array' })
    }

    let sentCount = 0
    const resendService = new ResendService()

    for (const cand of candidates) {
      try {
        const prompt = `
Candidate: ${cand.candidateName || 'Candidate'}
Previous Application: ${cand.jobTitle || 'Role'} at ${cand.companyName || 'our company'}
Skills: ${cand.skillsSummary || 'Various'}

Write a warm, professional, short, personalised email from OptioHire encouraging this candidate to keep their profile updated for future roles. 
Keep it under 3 short paragraphs. Sign off as: OptioHire Talent Team
`
        const draft = await openRouterService.generateText(prompt, undefined, {
          systemPrompt: 'You are an expert HR recruiter writing warm follow-up emails.'
        })

        const emailText = draft || 'Thank you for your interest. We will keep your profile in our talent pool for future opportunities.'

        await resendService.sendEmail({
          to: cand.email,
          subject: 'Your profile has been added to our Talent Pool',
          html: emailText.replace(/\n/g, '<br/>'),
          text: emailText
        })
        
        sentCount++
      } catch (e) {
        logger.error(`Error processing bulk email for ${cand.email}:`, e)
      }
    }

    return res.json({ success: true, sentCount })
  } catch (error: any) {
    logger.error('Error in bulk generate and send:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
