import { GoogleGenerativeAI } from '@google/generative-ai'
import { groqService } from './groqService.js'
import { openRouterService } from './openRouterService.js'
import { scanForInjections } from './injectionScanner.js'
import { buildSecureSystemPrompt, sandboxCvText } from './promptBuilder.js'
import { saveAuditLog } from './auditLogger.js'

type ParsedResume = {
  personal?: { name?: string; email?: string; phone?: string }
  education?: Array<{ school?: string; degree?: string; year?: string }>
  experience?: Array<{ company?: string; role?: string; start?: string; end?: string; summary?: string }>
  skills?: string[]
  links?: { github?: string; linkedin?: string; portfolio?: string[] }
  awards?: string[]
  projects?: Array<{ name?: string; description?: string; link?: string }>
}

function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null
}

const emptyResume = (): ParsedResume => ({
  personal: {},
  skills: [],
  links: {},
  education: [],
  experience: [],
  awards: [],
  projects: []
})

export async function parseResumeText(text: string): Promise<ParsedResume> {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

  // --- SECURITY LAYER 1: PATTERN SCANNING ---
  const scanResult = scanForInjections(text)
  if (scanResult.severity === 'CRITICAL') {
    console.warn('[SECURITY] Critical prompt injection detected, blocking request.')
    await saveAuditLog({
      severity: 'CRITICAL',
      actionTaken: 'AUTO_REJECTED',
      detectedPatterns: scanResult.detectedPatterns
    })
    return emptyResume()
  }

  // Log non-critical findings
  if (!scanResult.isClean) {
    await saveAuditLog({
      severity: scanResult.severity,
      actionTaken: 'FLAGGED',
      detectedPatterns: scanResult.detectedPatterns
    })
  }

  // --- SECURITY LAYER 2: PROMPT SANDBOXING ---
  const rawSystemPrompt = `You are a resume parsing engine. Extract JSON with keys:
personal{name,email,phone}, education[{school,degree,year}], experience[{company,role,start,end,summary}],
skills[string[]], links{github,linkedin,portfolio[string[]]}, awards[string[]], projects[{name,description,link}].
Return ONLY strict JSON, no markdown formatting.`
  
  const systemPrompt = buildSecureSystemPrompt(rawSystemPrompt)
  const prompt = sandboxCvText(text)

  // Use OpenRouter when AI_PROVIDER=openrouter
  if (provider === 'openrouter' && openRouterService.isAvailable()) {
    try {
      const parsed = await openRouterService.generateJSON<ParsedResume>(prompt, undefined, { systemPrompt })
      return parsed || emptyResume()
    } catch (error) {
      console.error('OpenRouter resume parsing failed:', error)
      return emptyResume()
    }
  }

  // Use Groq when AI_PROVIDER=groq
  if (provider === 'groq' && groqService.isAvailable()) {
    try {
      const model = process.env.RESUME_PARSER_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      const parsed = await groqService.generateJSON<ParsedResume>(prompt, model, { systemPrompt, apiKey: 'primary' })
      return parsed || emptyResume()
    } catch (error) {
      console.error('Groq resume parsing failed:', error)
      return emptyResume()
    }
  }

  const apiKey = getGeminiApiKey()
  if (!apiKey) return emptyResume()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = process.env.RESUME_PARSER_MODEL || 'gemini-2.0-flash'
    const geminiModel = genAI.getGenerativeModel({ model, systemInstruction: systemPrompt })
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    let content = response.text() || '{}'
    content = content.trim()
    if (content.startsWith('```json')) content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    else if (content.startsWith('```')) content = content.replace(/^```\s*/, '').replace(/\s*```$/, '')
    return JSON.parse(content) as ParsedResume
  } catch (error) {
    console.error('Gemini resume parsing failed:', error)
    return emptyResume()
  }
}


