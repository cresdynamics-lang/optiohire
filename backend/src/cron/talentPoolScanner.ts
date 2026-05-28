import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { AIScoringEngine } from '../lib/ai-scoring.js'
import { DEFAULT_SCORING_WEIGHTS, ScoringWeights } from '../lib/scoringWeights.js'
import { EmailService } from '../services/emailService.js'

const aiScoring = new AIScoringEngine()

export async function runNightlyTalentPoolScan() {
  const emailService = new EmailService()

  logger.info('Starting Nightly Talent Pool Scan...')
  try {
    // 1. Get all active job postings
    const { rows: jobs } = await query(`
      SELECT j.job_posting_id, j.company_id, j.job_title, j.job_description, j.responsibilities, j.skills_required AS required_skills, j.scoring_config,
             c.company_name
      FROM job_postings j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.status = 'ACTIVE'
    `)

    const notifyCandidates: Record<string, {
      candidateId: string
      candidateName: string | null
      candidateEmail: string
      matches: Array<{
        jobTitle: string
        companyName: string
        overview: string
        requiredSkills: string[]
      }>
    }> = {}

    for (const job of jobs) {
      logger.info(`Scanning talent pool for Job: ${job.job_title} (${job.job_posting_id})`)

      // Extract scoring config
      const weights: ScoringWeights = job.scoring_config?.weights || DEFAULT_SCORING_WEIGHTS;

      // 2. Find talent candidates who haven't explicitly applied for this job,
      // but exist in the company's talent pool
      // For simplicity, assuming talent_pool has a company_id link or is global. Let's assume global/company filtered.
      const { rows: candidates } = await query(`
        SELECT t.talent_id, t.candidate_name, t.email, t.parsed_resume_json, t.experience_summary, t.skills, NULL::real[] AS embedding
        FROM talent_pool t
        WHERE NOT EXISTS (
          SELECT 1 FROM applications a WHERE a.job_posting_id = $1 AND a.email = t.email
        )
      `, [job.job_posting_id])

      let evaluatedCount = 0;
      let strongMatchesFound = 0;

      for (const candidate of candidates) {
        evaluatedCount++;

        // Calculate vector similarity (assuming pgvector uses <=> for cosine distance, similarity is 1 - distance)
        let vectorSimilarity = 0.5; // fallback
        if (candidate.embedding) {
          try {
            // Recompute similarity using the DB or a local library
            const { rows: distRow } = await query(`
              SELECT 1 - (embedding <=> $2::vector) as similarity
              FROM talent_pool
              WHERE talent_id = $1
            `, [candidate.talent_id, `[${candidate.embedding.join(',')}]`])
            if (distRow.length > 0) {
              vectorSimilarity = distRow[0].similarity;
            }
          } catch (e) {
            // Ignore vector errors during batch
          }
        }

        const cvText = candidate.experience_summary
          || (candidate.parsed_resume_json ? JSON.stringify(candidate.parsed_resume_json) : '')
          || candidate.skills?.join(', ') || ''

        const scoringInput = {
          job: {
            title: job.job_title,
            description: job.job_description,
            responsibilities: job.responsibilities,
            required_skills: job.required_skills || []
          },
          cvText
        };

        const result = await aiScoring.scoreCandidate(scoringInput, vectorSimilarity, weights);

        // If score is good or strong (e.g. >= 70), insert a match record
        if (result.score >= 70) {
          strongMatchesFound++;

          const { rows: existingRows } = await query<{ final_score: string; tier: string }>(
            `SELECT final_score, tier FROM talent_pool_matches WHERE job_id = $1 AND candidate_id = $2`,
            [job.job_posting_id, candidate.talent_id]
          )
          const existingMatch = existingRows[0]
          const matchTier = result.status === 'SHORTLIST' ? 'strong' : 'good'
          const shouldNotify = !existingMatch || matchTier !== existingMatch.tier

          await query(`
            INSERT INTO talent_pool_matches 
              (job_id, candidate_id, final_score, tier, ai_audit_log)
            VALUES ($1, $2, $3, $4, $5::jsonb)
            ON CONFLICT (job_id, candidate_id) 
            DO UPDATE SET 
              final_score = EXCLUDED.final_score,
              tier = EXCLUDED.tier,
              ai_audit_log = EXCLUDED.ai_audit_log,
              matched_at = NOW()
          `, [
            job.job_posting_id,
            candidate.talent_id,
            result.score,
            matchTier,
            JSON.stringify(result.audit)
          ]);

          if (shouldNotify) {
            const overview = (job.job_description || job.responsibilities || '').trim().substring(0, 380) || 'This role looks like a strong fit based on your current talent pool profile.'
            const requiredSkills = Array.isArray(job.required_skills) ? job.required_skills : []
            const candidateKey = candidate.email.toLowerCase()

            if (!notifyCandidates[candidateKey]) {
              notifyCandidates[candidateKey] = {
                candidateId: candidate.talent_id,
                candidateName: candidate.candidate_name,
                candidateEmail: candidate.email,
                matches: []
              }
            }

            notifyCandidates[candidateKey].matches.push({
              jobTitle: job.job_title,
              companyName: job.company_name || 'Company',
              overview,
              requiredSkills
            })
          }
        }
      }

      // Log the scan results
      await query(`
        INSERT INTO talent_pool_scan_log (job_id, candidates_evaluated, strong_matches_found)
        VALUES ($1, $2, $3)
      `, [job.job_posting_id, evaluatedCount, strongMatchesFound]);

      logger.info(`Finished scanning for ${job.job_title}. Found ${strongMatchesFound} strong matches out of ${evaluatedCount} candidates.`);
    }

    // Send candidate notification emails for new or upgraded talent pool matches
    for (const candidateEmail of Object.keys(notifyCandidates)) {
      const candidate = notifyCandidates[candidateEmail]
      try {
        await emailService.sendTalentPoolMatchNotification({
          candidateEmail: candidate.candidateEmail,
          candidateName: candidate.candidateName,
          matches: candidate.matches
        })
      } catch (emailError) {
        logger.error(`Failed to send talent pool match notification to ${candidate.candidateEmail}:`, emailError)
      }
    }

  } catch (error) {
    logger.error('Error during Nightly Talent Pool Scan:', error)
    throw error
  }
}
