import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger.js'
import { groqService } from '../services/ai/groqService.js'

/** Applications with only a short note + URLs produce little text; rule-based anchors must not dominate. */
const THIN_EVIDENCE_MAX_CHARS = Math.max(
  300,
  parseInt(process.env.SCORING_THIN_EVIDENCE_CHARS || '900', 10) || 900
)

function clampScore(n: unknown): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Model JSON: holistic score plus optional rubric dimensions (all 0–100). */
interface AiScoringJson {
  score: number
  status?: string
  reasoning: string
  must_have_score?: number
  nice_to_have_score?: number
  experience_relevance_score?: number
  application_quality_score?: number
  strengths?: string[]
  gaps?: string[]
}

export interface ScoringResult {
  score: number // 0-100
  status: 'SHORTLIST' | 'FLAGGED' | 'REJECTED'
  reasoning: string // transparent explanation
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
    /** Role responsibilities / duties — used for fuller job fit analysis */
    responsibilities?: string
    required_skills: string[]
  }
  company: {
    company_name: string
    company_domain?: string | null
    company_email?: string | null
    hr_email?: string | null
    hiring_manager_email?: string | null
    settings?: any // jsonb settings
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

    const geminiKey = this.getGeminiApiKey()
    if (geminiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiKey)
      this.useGemini = true
      logger.info('Gemini API initialized successfully for AI scoring')
    } else {
      this.useGemini = false
      logger.warn('No AI API key found (Groq or Gemini), will use fallback rule-based scoring')
    }
  }

  private redactSensitiveIdentifiers(rawCvText: string): { text: string; emailRedactions: number; phoneRedactions: number } {
    const emailMatches = rawCvText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []
    const phoneMatches = rawCvText.match(/(\+?\d[\d\s().-]{7,}\d)/g) || []
    const text = rawCvText
      // email
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
      // phone-like patterns
      .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[REDACTED_PHONE]')
    return {
      text,
      emailRedactions: emailMatches.length,
      phoneRedactions: phoneMatches.length,
    }
  }

  private removeSensitiveAttributes(rawCvText: string): { text: string; sensitiveLinesRemoved: number } {
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
    return {
      text: filtered.join('\n'),
      sensitiveLinesRemoved: Math.max(0, lines.length - filtered.length),
    }
  }

  private buildBlindCvText(cvText: string): { text: string; redactionSummary: { emailRedactions: number; phoneRedactions: number; sensitiveLinesRemoved: number } } {
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

  /** All candidate-facing text + links (for fuzzy skill / signal matching). */
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
    return s
      .split(/[/,]+|\s+/)
      .map((t) => t.replace(/\.(js|ts|tsx|jsx|mjs|cjs)$/i, '').trim())
      .filter((t) => t.length >= 2)
  }

  private expandSkillToken(token: string): string[] {
    const aliases: Record<string, string[]> = {
      js: ['javascript', 'ecmascript'],
      ts: ['typescript'],
      node: ['nodejs', 'node.js', 'nodejs'],
      react: ['reactjs', 'react.js', 'reactjs'],
      vue: ['vuejs', 'vue.js'],
      angular: ['angularjs'],
      postgres: ['postgresql', 'psql'],
      mongo: ['mongodb'],
      k8s: ['kubernetes'],
      aws: ['amazon web services', 'amazon aws'],
      gcp: ['google cloud'],
      azure: ['microsoft azure'],
      ml: ['machine learning'],
      ai: ['artificial intelligence'],
      cicd: ['ci/cd', 'continuous integration'],
      docker: ['container', 'containers'],
    }
    const out = new Set<string>([token])
    if (aliases[token]) aliases[token].forEach((x) => out.add(x))
    for (const [k, list] of Object.entries(aliases)) {
      if (list.some((x) => x === token || token.includes(x) || x.includes(token))) {
        out.add(k)
        list.forEach((x) => out.add(x))
      }
    }
    return [...out]
  }

  private tokenMatchesHaystack(haystack: string, token: string): boolean {
    if (token.length < 2) return false
    if (haystack.includes(token)) return true
    for (const alt of this.expandSkillToken(token)) {
      if (alt.length > 2 && haystack.includes(alt)) return true
    }
    return false
  }

  /** 0 = no match, (0,1) = partial, 1 = strong match for this requirement line */
  private skillMatchStrength(haystack: string, skillPhrase: string): number {
    const phrase = skillPhrase.toLowerCase().trim()
    if (!phrase) return 0
    if (haystack.includes(phrase)) return 1
    const tokens = this.normalizeSkillTokens(skillPhrase)
    if (tokens.length === 0) return haystack.includes(phrase) ? 1 : 0
    let hits = 0
    for (const t of tokens) {
      if (this.tokenMatchesHaystack(haystack, t)) hits++
    }
    if (hits === tokens.length) return 1
    if (hits > 0) return 0.5 + (0.5 * hits) / tokens.length
    return 0
  }

  /**
   * Fuzzy anchor: overlaps partial skills (e.g. "React" vs "React.js"), uses links in haystack.
   * Returns 0–100. If no skills listed, returns neutral 50 so calibration does not punish.
   */
  private getEvidenceBasedAnchorScore(input: ScoringInput): number {
    const haystack = this.buildEvidenceHaystack(input)
    const required = (input.job.required_skills || []).map((s) => (typeof s === 'string' ? s : String(s)))
    if (required.length === 0) return 50
    let sum = 0
    for (const skill of required) {
      sum += this.skillMatchStrength(haystack, skill)
    }
    return Math.round((sum / required.length) * 100)
  }

  private isThinEvidence(cvText: string): boolean {
    return (cvText || '').trim().length < THIN_EVIDENCE_MAX_CHARS
  }

  private calibrateScore(aiScore: number, input: ScoringInput, anchor: number, thinEvidence: boolean): number {
    // Thin applications (portal note + links): trust model more — substring anchors are noisy.
    const wAi = thinEvidence ? 0.84 : 0.72
    const wAnchor = 1 - wAi
    let blended = Math.round(aiScore * wAi + anchor * wAnchor)
    // Avoid dragging down a strong model score solely because a keyword was phrased differently.
    if (thinEvidence && aiScore >= 60 && anchor <= 30) {
      blended = Math.max(blended, Math.min(100, Math.round(aiScore * 0.9 + anchor * 0.1)))
    }
    return Math.max(0, Math.min(100, blended))
  }

  private deriveStatus(
    calibrated: number,
    _rawModelScore: number,
    _thinEvidence: boolean
  ): 'SHORTLIST' | 'FLAGGED' | 'REJECTED' {
    // Product bands: REJECT 0–50, FLAG 51–79, SHORTLIST 80–100 (calibrated score)
    if (calibrated >= 80) return 'SHORTLIST'
    if (calibrated >= 51) return 'FLAGGED'
    return 'REJECTED'
  }

  private deriveRawScoreFromModel(parsed: AiScoringJson): { raw: number; usedDimensions: boolean } {
    const dims = [
      parsed.must_have_score,
      parsed.nice_to_have_score,
      parsed.experience_relevance_score,
      parsed.application_quality_score,
    ]
    const hasAll = dims.every((d) => typeof d === 'number' && !Number.isNaN(d))
    if (!hasAll) {
      if (typeof parsed.score === 'number' && !Number.isNaN(parsed.score)) {
        return { raw: clampScore(parsed.score), usedDimensions: false }
      }
      const partialDims = dims.filter((d): d is number => typeof d === 'number' && !Number.isNaN(d))
      if (partialDims.length > 0) {
        const avg = partialDims.reduce((a, b) => a + b, 0) / partialDims.length
        return { raw: clampScore(avg), usedDimensions: false }
      }
      return { raw: 48, usedDimensions: false }
    }
    const m = clampScore(parsed.must_have_score)
    const n = clampScore(parsed.nice_to_have_score)
    const e = clampScore(parsed.experience_relevance_score)
    const q = clampScore(parsed.application_quality_score)
    const composite = Math.round(m * 0.38 + n * 0.22 + e * 0.28 + q * 0.12)
    const modelOverall = clampScore(parsed.score !== undefined ? parsed.score : composite)
    const raw = Math.round(composite * 0.48 + modelOverall * 0.52)
    return { raw, usedDimensions: true }
  }

  private enrichReasoning(parsed: AiScoringJson, base: string): string {
    let out = this.sanitizeReasoning(base)
    const extra: string[] = []
    if (parsed.strengths?.length) {
      extra.push(`Strengths: ${parsed.strengths.slice(0, 4).join('; ')}`)
    }
    if (parsed.gaps?.length) {
      extra.push(`Gaps / risks: ${parsed.gaps.slice(0, 3).join('; ')}`)
    }
    if (extra.length) {
      out = `${out}\n\n${extra.join('. ')}`.trim()
    }
    return out
  }

  private sanitizeReasoning(reasoning: string): string {
    const blocked = [
      /\b(age|date of birth|dob|birth date)\b/gi,
      /\b(gender|male|female|non-binary|nonbinary)\b/gi,
      /\b(nationality|ethnicity|race|religion|citizenship)\b/gi,
      /\bmarital status\b/gi,
      /\bdisability\b/gi,
      /\bphoto(graph)?\b/gi,
      /\baddress\b/gi,
    ]
    let sanitized = reasoning || 'No reasoning provided'
    for (const pattern of blocked) {
      sanitized = sanitized.replace(pattern, '[non-job-relevant attribute removed]')
    }
    return sanitized
  }

  private finalizeFromModelJson(
    parsed: AiScoringJson,
    blindInput: ScoringInput,
    blindRedaction: {
      emailRedactions: number
      phoneRedactions: number
      sensitiveLinesRemoved: number
    },
    modelProvider: 'groq' | 'gemini'
  ): ScoringResult {
    const { raw, usedDimensions } = this.deriveRawScoreFromModel(parsed)
    const rawScore = Math.max(0, Math.min(100, raw))
    const thin = this.isThinEvidence(blindInput.cvText)
    const skillAnchorScore = this.getEvidenceBasedAnchorScore(blindInput)
    const score = this.calibrateScore(rawScore, blindInput, skillAnchorScore, thin)
    const status = this.deriveStatus(score, rawScore, thin)
    logger.info(
      `Scoring successful (${modelProvider}), score: ${score}, status: ${status}, thinEvidence: ${thin}, rubric: ${usedDimensions}`
    )
    return {
      score,
      status,
      reasoning: this.enrichReasoning(parsed, parsed.reasoning || 'No reasoning provided'),
      audit: {
        modelProvider,
        blindReviewApplied: true,
        redactionSummary: blindRedaction,
        aiScoreRaw: rawScore,
        skillAnchorScore,
        calibratedScore: score,
        thinEvidence: thin,
        usedDimensionRubric: usedDimensions,
      },
    }
  }

  /**
   * Get Gemini API key
   */
  private getGeminiApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null
  }

  /**
   * Build comprehensive system instruction with company context
   * Based on production AI recruitment assistant framework with 35+ years domain knowledge
   */
  private buildSystemInstruction(input: ScoringInput): string {
    const company = input.company
    const companyContext = company.company_name 
      ? `You are an expert AI recruitment assistant with 35+ years of domain knowledge in candidate evaluation, talent acquisition, and fair hiring practices. You are working for ${company.company_name}${company.company_domain ? ` (${company.company_domain})` : ''}. `
      : 'You are an expert AI recruitment assistant with 35+ years of domain knowledge in candidate evaluation, talent acquisition, and fair hiring practices. '
    
    return `${companyContext}Your role is to provide objective, comprehensive candidate assessments that support data-driven hiring decisions while ensuring fairness, consistency, and compliance.

COMPANY CONTEXT:
- Company Name: ${company.company_name || 'Not specified'}
${company.company_domain ? `- Company Domain: ${company.company_domain}` : ''}
${company.company_email ? `- Company Email: ${company.company_email}` : ''}

PRIMARY OBJECTIVES:
1. Evaluate each candidate's qualifications against specific job requirements (description, responsibilities, title, required skills)
2. Provide actionable recommendations (SHORTLIST, FLAGGED, REJECTED) with clear reasoning
3. Identify both obvious matches and hidden potential through transferable skills analysis
4. Flag edge cases for human review rather than making uncertain rejections
5. Maintain fairness by focusing solely on job-relevant qualifications
6. Use a four-part rubric (must-have fit, nice-to-have fit, experience relevance, application/evidence quality) — never reduce the assessment to a single keyword or one missing phrase

SCORING FRAMEWORK (0-100 Points):
- MUST-HAVE REQUIREMENTS (~60 points): Core technical skills, experience level, education/certifications
- NICE-TO-HAVE REQUIREMENTS (~25 points): Preferred skills, bonus certifications, industry experience
- OVERALL FIT (~15 points): Career trajectory, cultural alignment, communication quality

CATEGORIZATION:
- SHORTLIST (80-100): Meets 100% of must-haves, ≥50% nice-to-haves, clear progression, strong communication
- FLAGGED (51-79): Meets ≥79% of must-haves with compensating strengths, transferable skills, addressable gaps, borderline scores
- REJECTED (0-50): Missing multiple critical must-haves, significant misalignment, lacks foundational skills, irrelevant application

FAIRNESS & BIAS MITIGATION:
- Focus exclusively on job-relevant qualifications (ignore name, age indicators, education prestige, location, pictures)
- Value diverse paths: career changers, self-taught developers, bootcamp graduates, alternative credentials
- Don't penalize employment gaps <12 months or those explained by caregiving, education, health, layoffs
- Consider skills-based equivalents: 5 years hands-on experience may equal a formal degree
- Recognize cultural differences in resume formats and communication styles

MODERN HIRING REALITIES (2025):
- Remote work normalization: Geographic location often irrelevant; focus on skills
- AI-assisted applications: Distinguish between AI enhancement (good) vs. generic AI generation (red flag)
- Skills-based hiring: Prioritize demonstrable skills over credentials where appropriate
- Continuous learning: Value recent upskilling more than outdated degrees
- Portfolio over pedigree: Strong GitHub/portfolio may outweigh prestigious education

RED FLAGS (Auto-flag for human review):
- Employment gaps >12 months without explanation
- 3+ jobs in 24 months without clear progression (unless contract work)
- Declining responsibility over time
- Inconsistent timelines or conflicting information
- Generic, unmodified template applications
- Exaggerated claims unsupported by context
- AI-generated content with zero personalization
- Overqualification by 5+ years for role level
- Missing critical information (no contact details, vague dates)

QUALITY INDICATORS (Enhance scores):
- Specific, quantifiable achievements with metrics (%, $, scale)
- Clear career progression with strategic moves
- Continuous learning (certifications, courses, self-study)
- Personalized application showing company/role research
- Relevant side projects, open-source contributions, portfolio
- Leadership examples and initiative-taking
- Problem-solving demonstrations with context and outcome

SPECIAL CASES:
- Career Changers: Focus on transferable skills, recent training, project work, motivation
- Recent Graduates (<2 years): Weight coursework, internships, academic projects, GPA if >3.5
- Senior/Executive: Prioritize strategic thinking, business impact, leadership scope
- Overqualified: Auto-flag if experience exceeds role by 5+ years; assess motivation and retention risk

CORE PRINCIPLES:
- When uncertain, flag for review - false negatives (rejecting good candidates) are worse than false positives
- Default to generosity - if candidate is 60/40 good fit, round up and flag for review
- Be thorough but concise - reasoning should be 3-4 sentences (50-100 words), hitting key points
- Output valid JSON only - no additional text outside JSON structure
- Objectivity above all - consistent, accurate, concise, unbiased analysis

Remember: You are evaluating candidates for ${company.company_name || 'this company'}. Your goal is to identify talent fairly and accurately while ensuring no strong candidate slips through due to rigid criteria.`
  }

  /**
   * Score a candidate using AI
   * Input: { job: { title, description, required_skills }, company: { company_name, ... }, cvText }
   * Output: { score: 0-100, status: "SHORTLIST" | "FLAGGED" | "REJECTED", reasoning: string }
   */
  async scoreCandidate(input: ScoringInput): Promise<ScoringResult> {
    const blindCv = this.buildBlindCvText(input.cvText)
    const blindInput: ScoringInput = {
      ...input,
      cvText: blindCv.text,
    }
    const modelName = process.env.SCORING_MODEL || process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

    // Use Groq for scoring when AI_PROVIDER=groq
    if (this.useGroq) {
      try {
        logger.info(`Using Groq model ${modelName} for scoring`)
        const prompt = this.buildScoringPrompt(blindInput)
        const systemInstruction = this.buildSystemInstruction(blindInput)
        const parsed = await groqService.generateJSON<AiScoringJson>(prompt, modelName, {
          systemPrompt: systemInstruction,
          apiKey: 'primary',
          maxTokens: 2048,
        })
        return this.finalizeFromModelJson(parsed, blindInput, blindCv.redactionSummary, 'groq')
      } catch (error: any) {
        logger.error(`Groq scoring failed: ${error?.message || String(error)}, falling back to rule-based scoring`)
        return this.fallbackScoring(input)
      }
    }

    // Use Gemini for scoring
    if (this.useGemini && this.geminiClient) {
      try {
        logger.info(`Using Gemini model ${modelName} for scoring`)
        const prompt = this.buildScoringPrompt(blindInput)
        const systemInstruction = this.buildSystemInstruction(blindInput)
        
        const model = this.geminiClient.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemInstruction
        })
        
        const result = await model.generateContent(prompt)
        const response = await result.response
        const content = response.text() || '{}'
        
        // Extract JSON from response (handle markdown code blocks if present)
        let jsonContent = content.trim()
        if (jsonContent.startsWith('```json')) {
          jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (jsonContent.startsWith('```')) {
          jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }
        
        const parsed = JSON.parse(jsonContent) as AiScoringJson
        return this.finalizeFromModelJson(parsed, blindInput, blindCv.redactionSummary, 'gemini')
      } catch (error: any) {
        logger.error(`Gemini scoring failed: ${error?.message || String(error)}, falling back to rule-based scoring`)
      }
    }

    // Fallback to rule-based scoring
    logger.warn('Gemini API not available, using rule-based fallback scoring')
    const fallbackResult = this.fallbackScoring(blindInput)
    const skillAnchorScore = this.getEvidenceBasedAnchorScore(blindInput)
    const thin = this.isThinEvidence(blindInput.cvText)
    return {
      ...fallbackResult,
      audit: {
        modelProvider: 'fallback',
        blindReviewApplied: true,
        redactionSummary: blindCv.redactionSummary,
        aiScoreRaw: fallbackResult.score,
        skillAnchorScore,
        calibratedScore: fallbackResult.score,
        thinEvidence: thin,
        usedDimensionRubric: false,
      },
    }
  }

  private buildScoringPrompt(input: ScoringInput): string {
    // Extract FULL CV text - Gemini models support large context windows
    // Using 50,000 characters as a safe limit (approximately 12,500 tokens) to leave room for prompt
    const maxCvLength = 50000
    const cvText = input.cvText.length > maxCvLength 
      ? input.cvText.substring(0, maxCvLength) 
      : input.cvText
    const isTruncated = input.cvText.length > maxCvLength
    const thin = this.isThinEvidence(input.cvText)
    
    const company = input.company
    const skillsList = (input.job.required_skills || []).join(', ') || 'None explicitly listed — infer from job title and description'
    const responsibilities = (input.job.responsibilities || '').trim() || 'Not separately listed — use job description'

    return `Evaluate this candidate for ${company.company_name || 'the company'} using the comprehensive framework provided.

JOB DETAILS:
- Job Title: ${input.job.title}
- Job Description: ${input.job.description}
- Key Responsibilities / Duties: ${responsibilities}
- Required Skills: ${skillsList}

${thin ? `THIN / LIMITED APPLICATION PACKAGE (IMPORTANT):
The text below may be short (e.g. candidate portal: cover note + profile links + link previews only). This is common and is NOT the same as "unqualified."
- You MUST still output all four dimension scores (0-100 each) and a holistic "score" — infer carefully from the note, URLs (GitHub/LinkedIn imply technical/professional context), and any previews.
- Do NOT conclude the candidate lacks skills solely because a full resume PDF was not parsed into text.
- application_quality_score = depth/clarity of evidence provided (short form = lower here), but experience_relevance_score and must_have_score can still be strong if links/note support the role.
- When evidence is incomplete but the profile is plausibly relevant, prefer FLAGGED over REJECTED and keep must_have_score honest but not punitive.
` : ''}

CANDIDATE LINKS (if provided in CV):
- LinkedIn: ${input.candidateEvidence?.linkedin || 'Not provided'}
- GitHub: ${input.candidateEvidence?.github || 'Not provided'}
- Other links: ${(input.candidateEvidence?.other_links || []).slice(0, 6).join(', ') || 'None'}
- Link insights: ${(input.candidateEvidence?.link_insights || []).slice(0, 6).join(' | ') || 'None'}

CANDIDATE CV TEXT (${isTruncated ? `First ${maxCvLength.toLocaleString()} characters - CV was truncated` : 'Complete CV'}):
${cvText}${isTruncated ? `\n\n[Note: CV text was truncated at ${maxCvLength.toLocaleString()} characters. Analyze based on the content provided above.]` : ''}

EVALUATION METHODOLOGY:

STEP 1: INFORMATION EXTRACTION
Extract and structure from the CV:
- Full name, contact information (email, phone)
- Current role, company, employment dates
- Total years of relevant experience (calculate precisely from dates)
- Education (degrees, institutions, graduation years)
- Technical skills with proficiency indicators
- Certifications with issue/expiry dates
- Quantifiable achievements (metrics, impact, scope)
- Career progression pattern and trajectory

STEP 2: REQUIREMENT MATCHING
- Hard Skills: Match technical skills against required/preferred lists, assess proficiency levels, consider recency (skills unused 8+ years may be outdated)
- Experience: Calculate relevant experience (not just total years), assess complexity and scope of past roles, evaluate industry relevance and transferability
- Soft Skills: Infer from achievements (leadership, collaboration, problem-solving), assess communication through application quality, look for indicators in project descriptions

STEP 3: GAP ANALYSIS
Identify:
- Critical gaps: Missing must-have skills that cannot be easily trained
- Bridgeable gaps: Missing skills that are learnable or have transferable equivalents
- Overqualification risks: 5+ years of experience beyond role requirements
- Transferable strengths: Adjacent skills from different contexts
- Growth trajectory: Evidence of continuous learning and skill acquisition

STEP 4: MULTI-DIMENSIONAL SCORING (REQUIRED — do not collapse to a single gut feeling)
You must evaluate FOUR separate dimensions (each 0-100), then align holistic "score" with them:
- must_have_score: Alignment with non-negotiable skills, experience level, and education/training for THIS job (use job description + responsibilities + required skills).
- nice_to_have_score: Bonus skills, domain familiarity, certifications, tools beyond the minimum.
- experience_relevance_score: Depth and relevance of past roles, projects, or portfolios to the work described (transferable experience counts).
- application_quality_score: Clarity and completeness of evidence (full CV vs short form). A short form should lower THIS dimension only — not automatically every other dimension.

STEP 5: HOLISTIC SCORE
- "score" (0-100) must reflect the dimensions together, not only application length or a single keyword.
- If the candidate is strong on must-haves and experience but the package is thin, keep must_have_score and experience_relevance_score fair; lower application_quality_score.

STEP 6: CATEGORIZATION (for your "status" field — final routing is also computed server-side)
- SHORTLIST: Strong multi-dimensional fit
- FLAGGED: Mixed / incomplete evidence / borderline — human review
- REJECTED: Clear misalignment with the role or missing foundational requirements (use sparingly when data is incomplete)

REASONING GUIDELINES:
- SPECIFIC: Cite evidence from the CV, note, or links (e.g. GitHub, LinkedIn) for matches AND gaps.
- MULTI-FACTOR: Reference at least two dimensions (e.g. skills + experience, or experience + portfolio).
- Avoid rejecting solely because one keyword was missing if transferable skills apply.

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no code blocks) with ALL of the following keys:
{
  "score": <number 0-100, holistic fit>,
  "must_have_score": <number 0-100>,
  "nice_to_have_score": <number 0-100>,
  "experience_relevance_score": <number 0-100>,
  "application_quality_score": <number 0-100>,
  "status": "SHORTLIST" | "FLAGGED" | "REJECTED",
  "reasoning": "<4-6 sentences: summarize dimension highlights; mention concrete evidence; note uncertainties>",
  "strengths": ["<bullet>", "<bullet>"],
  "gaps": ["<bullet>", "<bullet>"]
}

QUALITY ASSURANCE:
- All four *_score fields must be numbers (not null).
- "score" should be consistent with the dimensions (not arbitrary).
- When evidence is limited, still output dimensions — infer cautiously and flag uncertainty in "gaps".

Remember: Incomplete application data is common. False negatives hurt more than false positives — when unsure, FLAG for human review.`
  }


  private fallbackScoring(input: ScoringInput): ScoringResult {
    const haystack = this.buildEvidenceHaystack(input)
    const required = (input.job.required_skills || []).map((s) => (typeof s === 'string' ? s : String(s)))
    let strongMatches = 0
    let partialMatches = 0
    for (const skill of required) {
      const st = this.skillMatchStrength(haystack, skill)
      if (st >= 0.85) strongMatches++
      else if (st >= 0.35) partialMatches++
    }

    const anchor = this.getEvidenceBasedAnchorScore(input)
    const jobBlob = `${input.job.description || ''}\n${input.job.responsibilities || ''}`.toLowerCase()
    const jobTokens = Array.from(new Set(jobBlob.split(/[^a-z0-9+]+/i).filter((t) => t.length > 5))).slice(0, 50)
    let domainOverlap = 0
    for (const t of jobTokens) {
      if (haystack.includes(t)) domainOverlap++
    }
    const domainBoost = Math.min(10, Math.floor(domainOverlap / 4))
    const thin = this.isThinEvidence(input.cvText)
    const thinBoost = thin && haystack.length > 40 ? 6 : 0

    let score = Math.round(anchor * 0.88 + domainBoost + thinBoost)
    score = Math.max(0, Math.min(100, score))

    const rawForStatus = score
    const status = this.deriveStatus(score, rawForStatus, thin)

    const reqN = required.length || 1
    const reasoning = `Rule-based screening (AI unavailable): fuzzy skill alignment ~${anchor}/100 vs listed requirements (${strongMatches} strong / ${partialMatches} partial of ${required.length} skills). Job-description overlap signals: ${domainOverlap} terms. ${thin ? 'Limited application text — recommend human review rather than automatic rejection.' : ''}`

    return { score, status, reasoning: this.sanitizeReasoning(reasoning.trim()) }
  }
}

