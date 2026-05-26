import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'
import { AIScoringEngine } from '../lib/ai-scoring.js'
import { DEFAULT_SCORING_WEIGHTS, ScoringWeights } from '../lib/scoringWeights.js'

const aiScoring = new AIScoringEngine()

export async function runNightlyTalentPoolScan() {
  logger.info('Starting Nightly Talent Pool Scan...')
  try {
    // 1. Get all active job postings
    const { rows: jobs } = await query(`
      SELECT job_posting_id, company_id, job_title, job_description, responsibilities, required_skills, scoring_config
      FROM job_postings 
      WHERE status = 'ACTIVE'
    `)

    for (const job of jobs) {
      logger.info(`Scanning talent pool for Job: ${job.job_title} (${job.job_posting_id})`)

      // Extract scoring config
      const weights: ScoringWeights = job.scoring_config?.weights || DEFAULT_SCORING_WEIGHTS;

      // 2. Find talent candidates who haven't explicitly applied for this job,
      // but exist in the company's talent pool
      // For simplicity, assuming talent_pool has a company_id link or is global. Let's assume global/company filtered.
      const { rows: candidates } = await query(`
        SELECT t.talent_id, t.name, t.email, t.resume_text, t.skills, t.embedding
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

        const scoringInput = {
          job: {
            title: job.job_title,
            description: job.job_description,
            responsibilities: job.responsibilities,
            required_skills: job.required_skills || []
          },
          cvText: candidate.resume_text || candidate.skills?.join(', ') || ''
        };

        const result = await aiScoring.scoreCandidate(scoringInput, vectorSimilarity, weights);

        // If score is good or strong (e.g. >= 70), insert a match record
        if (result.score >= 70) {
          strongMatchesFound++;
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
            result.status === 'SHORTLIST' ? 'strong' : 'good',
            JSON.stringify(result.audit)
          ]);
        }
      }

      // Log the scan results
      await query(`
        INSERT INTO talent_pool_scan_log (job_id, candidates_evaluated, strong_matches_found)
        VALUES ($1, $2, $3)
      `, [job.job_posting_id, evaluatedCount, strongMatchesFound]);

      logger.info(`Finished scanning for ${job.job_title}. Found ${strongMatchesFound} strong matches out of ${evaluatedCount} candidates.`);
    }

  } catch (error) {
    logger.error('Error during Nightly Talent Pool Scan:', error)
  }
}
