import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger.js'
import { groqService } from '../services/ai/groqService.js'

const THIN_EVIDENCE_MAX_CHARS = Math.max(
  300,
  parseInt(process.env.SCORING_THIN_EVIDENCE_CHARS || '900', 10) || 900
)

function clampScore(n: unknown): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

interface AiScoringJson {
  score: number
  status?: string
  reasoning: string
  must_have_score?: number
  nice_to_have_score?: number
  experience_relevance_score?: number
  application_quality_score?: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

export interface ScoringResult {
  score: number 
  status: 'SHORTLIST' | 'FLAGGED' | 'REJECTED'
  reasoning: string 
  audit?: {
    modelProvider: 'groq' | 'gemini' | 'fallback'
    blindReviewApplied: boolean
    redactionSummary: {
      emailRedactions: number
      phoneRedactions: number
      sensitiveLinesRemoved: number
    }
    aiScoreRaw: number
    skillAnchorScore: number
    calibratedScore: number
    thinEvidence?: boolean
    usedDimensionRubric?: boolean
  }
}

export interface ScoringInput {
  job: {
    title: string
    description: string
    responsibilities?: string
    required_skills: string[]
  }
  company: {
    company_name: string
    company_domain?: string | null
    company_email?: string | null
    hr_email?: string | null
    hiring_manager_email?: string | null
    settings?: any 
  }
  cvText: string
  candidateEvidence?: {
    linkedin?: string | null
    github?: string | null
    other_links?: string[]
    link_insights?: string[]
  }
}

export class AIScoringEngine {
  private geminiClient: GoogleGenerativeAI | null = null
  private useGemini: boolean = false
  private useGroq: boolean = false

  constructor() {
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

    if (provider === 'groq' && groqService.isAvailable()) {
      this.useGroq = true
      logger.info('Groq API initialized successfully for AI scoring')
      return
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiKey)
      this.useGemini = true
      logger.info('Gemini API initialized successfully for AI scoring')
    } else {
      logger.warn('No AI API key found (Groq or Gemini), will use fallback rule-based scoring')
    }
  }

  private buildStructuredReasoning(parsed: AiScoringJson): string {
    return JSON.stringify({
      overview: this.sanitizeReasoning(parsed.reasoning || 'No overview provided'),
      strengths: (parsed.strengths || []).slice(0, 5),
      weaknesses: (parsed.weaknesses || []).slice(0, 5),
      recommendation: this.sanitizeReasoning(parsed.recommendation || 'No recommendation provided')
    })
  }

  private redactSensitiveIdentifiers(rawCvText: string) {
    const emailMatches = rawCvText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []
    const phoneMatches = rawCvText.match(/(\+?\d[\d\s().-]{7,}\d)/g) || []
    const text = rawCvText
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
      .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[REDACTED_PHONE]')
    return { text, emailRedactions: emailMatches.length, phoneRedactions: phoneMatches.length }
  }

  private removeSensitiveAttributes(rawCvText: string) {
    const lines = rawCvText.split('\n')
    const sensitivePatterns = [
      /\b(age|date of birth|dob|birth date)\b/i,
      /\b(gender|male|female|non-binary|nonbinary)\b/i,
      /\b(marital status|single|married|divorced)\b/i,
      /\b(nationality|citizenship|ethnicity|race|religion)\b/i,
      /\b(pregnant|pregnancy)\b/i,
      /\b(disability|disabled)\b/i,
      /\b(photo|photograph)\b/i,
      /\b(home address|address)\b/i,
    ]
    const filtered = lines.filter((line) => !sensitivePatterns.some((pattern) => pattern.test(line)))
    return { text: filtered.join('\n'), sensitiveLinesRemoved: Math.max(0, lines.length - filtered.length) }
  }

  private buildBlindCvText(cvText: string) {
    const redacted = this.redactSensitiveIdentifiers(cvText)
    const filtered = this.removeSensitiveAttributes(redacted.text)
    return {
      text: filtered.text,
      redactionSummary: {
        emailRedactions: redacted.emailRedactions,
        phoneRedactions: redacted.phoneRedactions,
        sensitiveLinesRemoved: filtered.sensitiveLinesRemoved,
      },
    }
  }

  private buildEvidenceHaystack(input: ScoringInput): string {
    const parts = [
      input.cvText,
      input.candidateEvidence?.linkedin || '',
      input.candidateEvidence?.github || '',
      ...(input.candidateEvidence?.other_links || []),
      (input.candidateEvidence?.link_insights || []).join('\n'),
    ]
    return parts.filter(Boolean).join('\n').toLowerCase()
  }

  private normalizeSkillTokens(skillPhrase: string): string[] {
    const s = skillPhrase.toLowerCase().trim()
    if (!s) return []
    return s.split(/[/,]+|\s+/).map((t) => t.replace(/\.(js|ts|tsx|jsx|mjs|cjs)$/i, '').trim()).filter((t) => t.length >= 2)
  }

  private expandSkillToken(token: string): string[] {
    const aliases: Record<string, string[]> = {
      js: ['javascript', 'ecmascript'], ts: ['typescript'], node: ['nodejs', 'node.js'], react: ['reactjs', 'react.js'],
      vue: ['vuejs', 'vue.js'], postgres: ['postgresql', 'psql'], aws: ['amazon web services'], docker: ['container']
    }
    const out = new Set<string>([token])
    if (aliases[token]) aliases[token].forEach((x) => out.add(x))
    return [...out]
  }

  private skillMatchStrength(haystack: string, skillPhrase: string): number {
    const phrase = skillPhrase.toLowerCase().trim()
    if (!phrase) return 0
    if (haystack.includes(phrase)) return 1
    const tokens = this.normalizeSkillTokens(skillPhrase)
    if (tokens.length === 0) return 0
    let hits = 0
    for (const t of tokens) {
      if (haystack.includes(t)) hits++
    }
    return hits / tokens.length
  }

  private getEvidenceBasedAnchorScore(input: ScoringInput): number {
    const haystack = this.buildEvidenceHaystack(input)
    const required = input.job.required_skills || []
    if (required.length === 0) return 50
    let sum = 0
    for (const skill of required) sum += this.skillMatchStrength(haystack, skill)
    return Math.round((sum / required.length) * 100)
  }

  private calibrateScore(aiScore: number, input: ScoringInput, anchor: number, thin: boolean): number {
    const wAi = thin ? 0.85 : 0.75
    return Math.round(aiScore * wAi + anchor * (1 - wAi))
  }

  private deriveStatus(score: number): 'SHORTLIST' | 'FLAGGED' | 'REJECTED' {
    if (score >= 80) return 'SHORTLIST'
    if (score >= 51) return 'FLAGGED'
    return 'REJECTED'
  }

  private deriveRawScoreFromModel(parsed: AiScoringJson) {
    const dims = [parsed.must_have_score, parsed.nice_to_have_score, parsed.experience_relevance_score, parsed.application_quality_score]
    if (dims.every((d) => typeof d === 'number')) {
      const composite = Math.round((dims[0]||0) * 0.4 + (dims[1]||0) * 0.2 + (dims[2]||0) * 0.3 + (dims[3]||0) * 0.1)
      return { raw: Math.round(composite * 0.5 + (parsed.score || composite) * 0.5), usedDimensions: true }
    }
    return { raw: clampScore(parsed.score || 45), usedDimensions: false }
  }

  private sanitizeReasoning(reasoning: string): string {
    return (reasoning || 'No reasoning provided').replace(/\b(age|gender|race|religion|disability|address)\b/gi, '[redacted]')
  }

  private finalizeFromModelJson(parsed: AiScoringJson, blindInput: ScoringInput, redaction: any, provider: 'groq' | 'gemini'): ScoringResult {
    const { raw, usedDimensions } = this.deriveRawScoreFromModel(parsed)
    const anchor = this.getEvidenceBasedAnchorScore(blindInput)
    const thin = (blindInput.cvText || '').length < THIN_EVIDENCE_MAX_CHARS
    const score = this.calibrateScore(raw, blindInput, anchor, thin)
    const status = this.deriveStatus(score)

    return {
      score, status, reasoning: this.buildStructuredReasoning(parsed),
      audit: {
        modelProvider: provider, blindReviewApplied: true, redactionSummary: redaction,
        aiScoreRaw: raw, skillAnchorScore: anchor, calibratedScore: score, thinEvidence: thin, usedDimensionRubric: usedDimensions
      }
    }
  }

  private buildSystemInstruction(input: ScoringInput): string {
    const company = input.company.company_name || 'the company'
    return `You are an expert AI recruitment assistant for ${company}. 
Your role is to provide objective candidate assessments.

SCORING (0-100):
- SHORTLIST (80-100): Strong fit.
- FLAGGED (51-79): Potential fit, needs review.
- REJECTED (0-50): Poor fit.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "score": <0-100>,
  "must_have_score": <0-100>,
  "nice_to_have_score": <0-100>,
  "experience_relevance_score": <0-100>,
  "application_quality_score": <0-100>,
  "status": "SHORTLIST" | "FLAGGED" | "REJECTED",
  "reasoning": "2-3 sentence overview of candidate fit",
  "strengths": ["bullet point 1", "bullet point 2"],
  "weaknesses": ["bullet point 1", "bullet point 2"],
  "recommendation": "Specific next steps or interview focus"
}`
  }

  private buildScoringPrompt(input: ScoringInput): string {
    return `Evaluate this candidate for ${input.job.title}.
JOB: ${input.job.description}
SKILLS: ${input.job.required_skills.join(', ')}
CV: ${input.cvText.substring(0, 40000)}`
  }

  async scoreCandidate(input: ScoringInput): Promise<ScoringResult> {
    const blind = this.buildBlindCvText(input.cvText)
    const model = process.env.SCORING_MODEL || 'llama-3.1-8b-instant'

    if (this.useGroq) {
      try {
        const parsed = await groqService.generateJSON<AiScoringJson>(this.buildScoringPrompt(input), model, { systemPrompt: this.buildSystemInstruction(input) })
        return this.finalizeFromModelJson(parsed, input, blind.redactionSummary, 'groq')
      } catch (e) {
        return this.fallbackScoring(input)
      }
    }

    if (this.useGemini && this.geminiClient) {
      try {
        const m = this.geminiClient.getGenerativeModel({ model, systemInstruction: this.buildSystemInstruction(input) })
        const res = await m.generateContent(this.buildScoringPrompt(input))
        const json = JSON.parse(res.response.text().replace(/```json|```/g, '')) as AiScoringJson
        return this.finalizeFromModelJson(json, input, blind.redactionSummary, 'gemini')
      } catch (e) {
        return this.fallbackScoring(input)
      }
    }

    return this.fallbackScoring(input)
  }

  private fallbackScoring(input: ScoringInput): ScoringResult {
    const anchor = this.getEvidenceBasedAnchorScore(input)
    const score = Math.max(0, Math.min(100, anchor))
    return {
      score, status: this.deriveStatus(score),
      reasoning: JSON.stringify({
        overview: `Rule-based alignment: ${anchor}/100 based on keyword matching.`,
        strengths: ['Keyword overlap detected'],
        weaknesses: ['AI scoring unavailable'],
        recommendation: 'Manual review recommended.'
      })
    }
  }
}
