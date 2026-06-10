import type { Request, Response } from 'express'
import { groqService } from '../services/ai/groqService.js'
import { openRouterService } from '../services/ai/openRouterService.js'
import { logger } from '../utils/logger.js'

/**
 * HR Assistant chat endpoint.
 * Uses Groq to answer HR questions about using OptioHire and general recruitment best practices.
 */
export async function hrChat(req: Request, res: Response) {
  try {
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
    
    if (provider === 'openrouter' && !openRouterService.isAvailable()) {
      return res.status(503).json({
        error: 'AI assistant is not available right now. Please check your OpenRouter API configuration and try again later.'
      })
    } else if (provider === 'groq' && !groqService.isAvailable()) {
      return res.status(503).json({
        error: 'AI assistant is not available right now. Please check your Groq API configuration and try again later.'
      })
    }

    const { question, conversationHistory, context } = req.body || {}
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required.' })
    }

    // -------------------------------------------------------------------------
    // STATIC KNOWLEDGE: Site Map & Workflows
    // -------------------------------------------------------------------------
    const siteMap = {
      jobs: { view_all: "/dashboard/jobs", create: "/dashboard/jobs/new", edit: "/dashboard/jobs/:id/edit" },
      candidates: { view_all: "/candidate/profile", details: "/dashboard/job/:jobId/candidate/:candidateId" },
      interviews: { view_all: "/dashboard/interviews" },
      settings: { company: "/dashboard/profile", users: "/admin/users" }
    }

    const workflows = {
      candidate_hiring: ["Applied", "Screening (AI Score)", "Interview", "Offer", "Hired"]
    }

    // -------------------------------------------------------------------------
    // ELITE ANTHROPIC-STYLE SYSTEM PROMPT
    // -------------------------------------------------------------------------
    const systemPrompt = `You are OptioHire AI Agent.
You are not a chatbot.
You are an HR Operations and Recruiting Agent.
Your mission is to help HR teams successfully complete recruiting and hiring workflows.

When responding:
1. Understand user goal.
2. Analyze current application context.
3. Use available workflows.
4. Provide structured answers.
5. Recommend next actions.
6. Detect risks.
7. Explain reasoning clearly.
8. Be concise but actionable.
9. Never provide generic advice when platform-specific guidance is available.
10. Always optimize for task completion.

${context ? `━━━━━━━━━━━━━━━━━━
CURRENT USER CONTEXT
━━━━━━━━━━━━━━━━━━
- Active URL: ${context.url || 'Unknown'}
- Page Title: ${context.title || 'Unknown'}
${context.recentError ? `- RECENT APP ERROR: ${context.recentError} (Help the user troubleshoot this issue!)` : ''}
` : ''}

━━━━━━━━━━━━━━━━━━
OPTIOHIRE KNOWLEDGE
━━━━━━━━━━━━━━━━━━
Site Map: ${JSON.stringify(siteMap)}
Workflows: ${JSON.stringify(workflows)}

━━━━━━━━━━━━━━━━━━
RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━
You MUST use the following structure (using markdown formatting) for EVERY response:

**Summary**
Short answer.

**Analysis**
Detailed explanation.

**Recommended Actions**
Numbered steps mapping to exact OptioHire URLs/buttons.

**Warnings**
Potential issues (or state "None").

**Next Best Action**
Single recommended action.

**Need Help?**
Suggested follow-up tasks.

━━━━━━━━━━━━━━━━━━
TOOL EXECUTION
━━━━━━━━━━━━━━━━━━
If you need to take action on behalf of the user, you MUST append a JSON code block at the very end of your response.
Supported Tools:
- rejectCandidate: {"applicationId": "uuid", "reason": "string"}
- shortlistCandidate: {"applicationId": "uuid", "reason": "string"}
- createJob: {"title": "string", "department": "string", "location": "string", "description": "string"}

Example:
\`\`\`json
{
  "tool": "rejectCandidate",
  "arguments": {
    "applicationId": "123e4567-e89b-12d3-a456-426614174000",
    "reason": "Does not meet minimum requirements."
  }
}
\`\`\`

CRITICAL: If NO action is required, DO NOT include any JSON code block whatsoever. Do NOT invent a "none" tool. Only use the tools explicitly listed above.

If your confidence is low (no matching workflow), state:
Confidence Level: Low
Reason: No matching workflow found.
Recommended Action: Ask the user to click the "Contact Support" tab in this drawer to escalate to OptioHire Admins.
`

    logger.info('HR chat question received', { question, url: context?.url })

    // Build conversation context
    let fullPrompt = question
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10)
      const historyContext = recentHistory
        .map((msg: { role: string; content: string }) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')
      fullPrompt = `Previous conversation:\n${historyContext}\n\nCurrent question: ${question}`
    }

    if (!openRouterService.isAvailable()) {
      throw new Error('OpenRouter API key is missing or invalid')
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // Start streaming
    const stream = await openRouterService.generateStream(fullPrompt, undefined, {
      temperature: 0.5,
      maxTokens: 1200,
      systemPrompt
    })

    const reader = stream.getReader()
    const decoder = new TextDecoder()

    let done = false
    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        // Forward the raw SSE chunks from OpenRouter directly to the client
        const chunk = decoder.decode(value, { stream: true })
        res.write(chunk)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()

  } catch (err: any) {
    logger.error('HR chat stream error', { 
      error: err?.message || String(err),
      question: req.body?.question
    })
    
    // If headers haven't been sent, we can return a normal JSON error
    if (!res.headersSent) {
      return res.status(503).json({ 
        error: 'AI service is currently unavailable or misconfigured. Please try again later.' 
      })
    } else {
      // If we already started streaming, just end the stream
      res.end()
    }
  }
}

