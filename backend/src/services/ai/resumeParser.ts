import { GoogleGenerativeAI } from '@google/generative-ai'
import { groqService } from './groqService.js'

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

  // Use Groq when AI_PROVIDER=groq
  if (provider === 'groq' && groqService.isAvailable()) {
    try {
      const model = process.env.RESUME_PARSER_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant'
      const systemPrompt = `You are a resume parsing engine. Extract JSON with keys:
personal{name,email,phone}, education[{school,degree,year}], experience[{company,role,start,end,summary}],
skills[string[]], links{github,linkedin,portfolio[string[]]}, awards[string[]], projects[{name,description,link}].
Return ONLY strict JSON, no markdown formatting.`
      const prompt = `Resume Text:\n${text}\n---\nExtract the structured JSON now.`
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
    const systemInstruction = `You are a resume parsing engine. Extract JSON with keys:
personal{name,email,phone}, education[{school,degree,year}], experience[{company,role,start,end,summary}],
skills[string[]], links{github,linkedin,portfolio[string[]]}, awards[string[]], projects[{name,description,link}].
Return ONLY strict JSON, no markdown formatting.`
    const prompt = `Resume Text:\n${text}\n---\nExtract the structured JSON now.`
    const geminiModel = genAI.getGenerativeModel({ model, systemInstruction })
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


