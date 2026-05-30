import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger.js'
import { groqService } from '../services/ai/groqService.js'
import { openRouterService } from '../services/ai/openRouterService.js'
import { getCompactSkillTaxonomy } from './skillTaxonomy.js'
import { computeScores, ExtractedData, DEFAULT_SCORING_WEIGHTS, ScoringWeights } from './scoringWeights.js'

export interface ScoringResult {
  score: number 
  status: 'SHORTLIST' | 'FLAGGED' | 'REJECTED'
  reasoning: string 
  embedding?: number[]
  audit?: any
}

export interface ScoringInput {
  job: {
    title: string
    description: string
    responsibilities?: string
    required_skills: string[]
    experience_years?: number
    education_required?: string
  }
  company?: any
  cvText: string
  candidateEvidence?: any
}

export class AIScoringEngine {
  private geminiClient: GoogleGenerativeAI | null = null
  private useGemini: boolean = false
  private useGroq: boolean = false
  private useOpenRouter: boolean = false

  constructor() {
    const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

    if (provider === 'openrouter' && openRouterService.isAvailable()) {
      this.useOpenRouter = true
      logger.info('OpenRouter API initialized successfully for AI scoring')
    } else if (provider === 'groq' && groqService.isAvailable()) {
      this.useGroq = true
      logger.info('Groq API initialized successfully for AI scoring')
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiKey)
      this.useGemini = true
      logger.info('Gemini API initialized successfully for AI scoring (embeddings)')
    } else if (!this.useGroq && !this.useOpenRouter) {
      logger.warn('No AI API key found (OpenRouter, Groq, or Gemini), will use fallback rule-based scoring')
    }
  }

  // Helper to truncate text to approx tokens
  private truncateToTokens(text: string, maxTokens: number = 1200): string {
    const charsPerToken = 4;
    return text.substring(0, maxTokens * charsPerToken);
  }

  async scoreCandidate(input: ScoringInput, vectorSimilarity: number = 0, weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS): Promise<ScoringResult> {
    const model = process.env.SCORING_MODEL || 'llama-3.1-8b-instant'

    // Generate Embedding using Gemini if configured (from track 1/2)
    let embedding: number[] | undefined;
    if (this.useGemini && this.geminiClient) {
      try {
        const embModel = this.geminiClient.getGenerativeModel({ model: "text-embedding-004" });
        const embRes = await embModel.embedContent(this.truncateToTokens(input.cvText, 2000));
        embedding = embRes.embedding.values;
      } catch (embErr) {
        logger.warn('Failed to generate embedding with Gemini:', embErr);
      }
    }

    // Call 1: Fast Extraction
    const extractionPrompt = `
JOB:
Title: ${input.job.title}
Required Skills: ${input.job.required_skills.join(', ')}
Required Experience: ${input.job.experience_years || 0} years
Education Required: ${input.job.education_required || 'None'}

CANDIDATE CV (truncated):
${this.truncateToTokens(input.cvText, 1200)}

TECHNICAL CONTRIBUTIONS (GitHub/Portfolio):
${JSON.stringify(input.candidateEvidence?.link_insights || [], null, 2)}

Return this exact JSON:
{
  "is_developer": boolean,
  "found_skills": [],
  "missing_skills": [],
  "partial_skills": [],
  "experience_years_found": 0,
  "education_found": "",
  "education_meets_requirement": false,
  "links": {
    "linkedin": null,
    "github": null,
    "portfolio": null,
    "other": []
  },
  "contribution_verification": {
    "verified_skills": [],
    "claimed_but_not_found": [],
    "summary": "..."
  }
}`;

    const extractionSystemPrompt = `You are a recruiting analysis engine. Extract and score ONLY what is asked.
Return ONLY valid JSON. No explanation outside the JSON object.

DETERMINE IF DEVELOPER:
Look at the CV and TECHNICAL CONTRIBUTIONS. Set "is_developer" to true if they have repos, code projects, or a clear dev background.

VERIFY SKILLS:
Compare the Required Skills with their TECHNICAL CONTRIBUTIONS. 
- "verified_skills": Skills mentioned in the CV that you can actually see proof of in their GitHub repos or technical links.
- "claimed_but_not_found": Skills mentioned in the CV as "expert" or "primary" but have zero evidence in their contributions.

Skill taxonomy categories:
${getCompactSkillTaxonomy()}`;

    let extracted: ExtractedData;

    try {
      if (this.useOpenRouter) {
        extracted = await openRouterService.generateJSON<ExtractedData>(extractionPrompt, undefined, { systemPrompt: extractionSystemPrompt });
      } else if (this.useGroq) {
        extracted = await groqService.generateJSON<ExtractedData>(extractionPrompt, model, { systemPrompt: extractionSystemPrompt });
      } else if (this.useGemini && this.geminiClient) {
        const m = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: extractionSystemPrompt });
        const res = await m.generateContent(extractionPrompt);
        extracted = JSON.parse(res.response.text().replace(/```json|```/g, '')) as ExtractedData;
      } else {
        throw new Error('No AI provider available');
      }
    } catch (err) {
      logger.error('Extraction failed, using fallback', err);
      // Fallback dummy
      extracted = {
        found_skills: [], missing_skills: input.job.required_skills, partial_skills: [],
        experience_years_found: 0, education_found: 'Unknown', education_meets_requirement: false,
        links: { linkedin: null, github: null, portfolio: null, other: [] },
        is_developer: false,
        contribution_verification: { verified_skills: [], claimed_but_not_found: [], summary: 'Extraction failed' }
      };
    }

    // Merge AI-extracted links with regex-extracted ones from candidateEvidence
    if (extracted.links) {
      input.candidateEvidence = {
        ...input.candidateEvidence,
        linkedin: input.candidateEvidence?.linkedin || extracted.links.linkedin,
        github: input.candidateEvidence?.github || extracted.links.github,
        portfolio: extracted.links.portfolio || (input.candidateEvidence?.other_links?.[0] || null),
        other_links: [...new Set([...(input.candidateEvidence?.other_links || []), ...(extracted.links.other || [])])]
      };
    }

    // Compute Scores using our mathematical weights
    const scores = computeScores(
      extracted, 
      input.job.experience_years || 0, 
      input.job.required_skills, 
      vectorSimilarity, 
      weights
    );

    // Call 2: Reasoning
    const reasoningPrompt = `
Based on this data:
Job: ${input.job.title}
Extracted: ${JSON.stringify(extracted)}
Scores: ${JSON.stringify(scores)}

Provide a 1-3 sentence human-readable summary explaining the score. Focus on WHY they got ${Math.round(scores.final_score)}%, highlighting any waived education or missing key skills.
Return ONLY valid JSON: { "final_reasoning": "..." }`;

    let reasoningStr = "Candidate evaluated based on mathematical scoring model.";
    try {
      if (this.useOpenRouter) {
        const r = await openRouterService.generateJSON<{final_reasoning: string}>(reasoningPrompt, undefined, { systemPrompt: "You return only JSON." });
        if (r.final_reasoning) reasoningStr = r.final_reasoning;
      } else if (this.useGroq) {
        const r = await groqService.generateJSON<{final_reasoning: string}>(reasoningPrompt, model, { systemPrompt: "You return only JSON." });
        if (r.final_reasoning) reasoningStr = r.final_reasoning;
      } else if (this.useGemini && this.geminiClient) {
        const m = this.geminiClient.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await m.generateContent(reasoningPrompt);
        const r = JSON.parse(res.response.text().replace(/```json|```/g, ''));
        if (r.final_reasoning) reasoningStr = r.final_reasoning;
      }
    } catch (err) {
      logger.warn('Reasoning generation failed, using fallback string', err);
    }

    // Build the Audit Log structure
    const auditLog = {
      scored_at: new Date().toISOString(),
      model_used: model,
      weights_used: weights,
      developer_verification: {
        is_developer: extracted.is_developer,
        contribution_analysis: extracted.contribution_verification
      },
      skill_match: {
        score: Math.round(scores.skill_score),
        found: extracted.found_skills,
        missing: extracted.missing_skills,
        partial: extracted.partial_skills,
        bonus_skills: scores.bonus_skills
      },
      experience: {
        score: Math.round(scores.experience_score),
        years_found: extracted.experience_years_found,
        years_required: input.job.experience_years || 0,
        over_qualified: extracted.experience_years_found > ((input.job.experience_years || 0) * 1.5)
      },
      education: {
        score: Math.round(scores.education_score),
        found: extracted.education_found,
        meets_requirement: extracted.education_meets_requirement,
        waived: scores.waived,
        waiver_reason: scores.waiver_reason
      },
      vector_similarity: {
        score: Math.round(scores.vector_score),
        method: "pgvector"
      },
      final_score: Math.round(scores.final_score),
      tier: scores.tier,
      final_reasoning: reasoningStr,
      candidate_links: input.candidateEvidence
    };

    return {
      score: Math.round(scores.final_score),
      status: scores.tier === 'weak' ? 'REJECTED' : (scores.tier === 'strong' ? 'SHORTLIST' : 'FLAGGED'),
      reasoning: reasoningStr,
      embedding,
      audit: auditLog
    };
  }
}
