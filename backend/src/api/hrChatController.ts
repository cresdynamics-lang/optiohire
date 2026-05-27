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
        error: 'AI assistant is not available right now. Please check your Groq API configuration and try again later.'
      })
    }

    const { question, conversationHistory } = req.body || {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' })
    }

    // Enhanced system prompt with comprehensive OptioHire context
    const systemPrompt = `
You are OptioHire's intelligent HR assistant, powered by Groq AI. Your role is to help HR professionals effectively use the OptioHire recruitment platform.

OPTIOHIRE PLATFORM FEATURES:
1. Job Postings: Create, manage, and publish job postings with descriptions, requirements, skills, deadlines, and locations
2. Email Routing: Automatic email watcher that monitors jobs@optiohire.com inbox for CV attachments
3. AI CV Screening: Groq AI automatically scores CVs (0-100) and assigns status:
   - SHORTLIST (80-100): Sends shortlist email to candidate
   - FLAG (51-79): Sends “under review” email; HR should review on the dashboard
   - REJECT (0-50): Sends rejection email to candidate
4. Application Management: View, filter, and manage candidate applications
5. Interview Scheduling: Schedule interviews with candidates and send calendar invites
6. Reports & Analytics: Generate recruitment reports and view statistics
7. Company Management: Manage company profiles, hiring managers, and settings

HOW TO HELP USERS:
- Provide step-by-step guidance on using OptioHire features
- Explain how the AI screening process works (CV parsing, scoring, email automation)
- Help troubleshoot common issues (email watcher, CV processing, email sending)
- Guide users to the correct sections in the dashboard
- Answer questions about recruitment best practices
- Explain pricing tiers (Starter: KSH 2,500, Professional: KSH 5,000, Enterprise: KSH 10,000)

IMPORTANT LIMITATIONS:
- You do NOT have access to live company or candidate data
- You cannot see specific job postings, applications, or user accounts
- You cannot perform actions on behalf of users
- Never invent credentials, API keys, or sensitive information
- If asked about specific data, guide users to check the dashboard

RESPONSE STYLE:
- Be friendly, professional, and concise
- Use clear, simple language
- Provide actionable steps when possible
- If you don't know something, admit it and suggest where to find the answer
- Format responses with clear structure (bullet points, numbered steps when helpful)
`

    logger.info('HR chat question received', { question, hasHistory: !!conversationHistory })

    // Build conversation context if history is provided
    let fullPrompt = question
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // Include recent conversation history for context (last 5 exchanges)
      const recentHistory = conversationHistory.slice(-10) // Last 10 messages (5 exchanges)
      const historyContext = recentHistory
        .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')
      fullPrompt = `Previous conversation:\n${historyContext}\n\nCurrent question: ${question}`
    }

    // Use a better model for chat if available, fallback to default
    const chatModel = process.env.GROQ_CHAT_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
    
    const reply = await groqService.generateText(fullPrompt, chatModel, {
      temperature: 0.7, // Slightly higher for more natural conversation
      maxTokens: 1200, // Increased for more detailed responses
      systemPrompt,
      apiKey: 'secondary' // Use secondary key for chat, fallback to primary/tertiary
    })

    logger.info('HR chat response generated successfully', { questionLength: question.length, replyLength: reply.length })

    return res.json({ reply })
  } catch (err: any) {
    logger.error('HR chat error', { 
      error: err?.message || String(err),
      stack: err?.stack,
      question: req.body?.question
    })
    
    // Provide more helpful error messages
    if (err?.message?.includes('API key') || err?.message?.includes('No Groq')) {
      return res.status(503).json({ 
        error: 'Groq AI service is not configured. Please check your GROQ_API_KEY environment variables.' 
      })
    }
    
    return res.status(500).json({ 
      error: 'Failed to process chat request. Please try again in a moment.' 
    })
  }
}

