import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { openRouterService } from '../services/ai/openRouterService.js'
import { ResendService } from '../services/resendService.js'

export async function getTalentPool(req: Request, res: Response) {
  try {
    const { rows } = await query(`
      SELECT 
        COALESCE(tp.id, t.talent_id) as id,
        t.talent_id,
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
      FROM talent_pool t
      LEFT JOIN talent_pool_applications tp ON tp.talent_id = t.talent_id
      LEFT JOIN applications a ON tp.application_id = a.application_id
      ORDER BY tp.applied_at DESC NULLS LAST
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

export async function generateHtmlEmail(req: Request, res: Response) {
  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' })
    }

    const aiPrompt = `
Generate a beautiful, responsive HTML email template based on the following instructions:
"${prompt}"

Requirements:
- Output ONLY valid HTML code. No markdown formatting, no \`\`\`html tags, no explanations.
- Use inline CSS for styling to ensure email client compatibility.
- Use a modern, clean, and professional design.
- Include placeholders like {{candidateName}} where appropriate for personalization.
`

    const htmlDraft = await openRouterService.generateText(aiPrompt, undefined, {
      systemPrompt: 'You are an expert HTML email developer and designer.'
    })

    // Clean up potential markdown formatting if the model still includes it
    let cleanedHtml = htmlDraft || ''
    if (cleanedHtml.startsWith('\`\`\`html')) {
      cleanedHtml = cleanedHtml.replace(/^\`\`\`html\s*/, '').replace(/\s*\`\`\`$/, '')
    } else if (cleanedHtml.startsWith('\`\`\`')) {
      cleanedHtml = cleanedHtml.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '')
    }

    return res.json({ success: true, html: cleanedHtml })
  } catch (error: any) {
    logger.error('Error generating HTML email:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export async function bulkCustomHtmlEmail(req: Request, res: Response) {
  try {
    const { candidates, htmlContent, subject } = req.body

    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'Missing candidates array' })
    }
    if (!htmlContent) {
      return res.status(400).json({ error: 'Missing htmlContent' })
    }

    let sentCount = 0
    const resendService = new ResendService()
    const emailSubject = subject || 'Update from OptioHire Talent Pool'

    for (const cand of candidates) {
      try {
        // Personalize the HTML
        let personalizedHtml = htmlContent.replace(/{{candidateName}}/gi, cand.candidateName || 'Candidate')
        
        await resendService.sendEmail({
          to: cand.email,
          subject: emailSubject,
          html: personalizedHtml,
          text: 'Please view this email in an HTML-compatible client.'
        })
        
        sentCount++
      } catch (e) {
        logger.error(`Error processing custom bulk HTML email for ${cand.email}:`, e)
      }
    }

    return res.json({ success: true, sentCount })
  } catch (error: any) {
    logger.error('Error in bulk custom HTML email send:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
