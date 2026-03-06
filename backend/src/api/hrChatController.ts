import type { Request, Response } from 'express'
import { groqService } from '../services/ai/groqService.js'
import { logger } from '../utils/logger.js'

/**
 * HR Assistant chat endpoint.
 * Uses Groq to answer HR questions about using OptioHire and general recruitment best practices.
 */
export async function hrChat(req: Request, res: Response) {
  try {
    if (!groqService.isAvailable()) {
      return res.status(503).json({
        error: 'AI assistant is not available right now. Please try again later.'
      })
    }

    const { question } = req.body || {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' })
    }

    const systemPrompt = `
You are OptioHire's HR assistant. Your job:
- Help HR users understand and use the OptioHire platform (job postings, email routing, AI screening, interviews, reports).
- Explain things step-by-step, in clear, concise language.
- When you don't know implementation details, say so and suggest where to look in the UI.
- You do NOT see live company or candidate data – speak in general patterns, not specific records.
- Never invent credentials, API keys, or sensitive data.
`

    logger.info('HR chat question received', { question })

    const reply = await groqService.generateText(question, process.env.GROQ_MODEL || 'llama-3.1-8b-instant', {
      temperature: 0.4,
      maxTokens: 800,
      systemPrompt,
      apiKey: 'secondary'
    })

    return res.json({ reply })
  } catch (err: any) {
    logger.error('HR chat error', { error: err?.message || String(err) })
    return res.status(500).json({ error: 'Failed to process chat request.' })
  }
}

