import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

/**
 * Sync institution roster matched_to / row_status from real applications
 * (email match). Does not require ALTER TABLE permissions.
 */
export async function syncInstitutionPlacementsFromApplications(institutionId: string): Promise<void> {
  try {
    await query(
      `WITH hired AS (
         SELECT DISTINCT ON (lower(a.email))
           lower(a.email) AS email_key,
           COALESCE(c.company_name, 'Employer') AS employer,
           jp.job_title AS role_title,
           COALESCE(a.updated_at, a.created_at) AS placed_at,
           CASE
             WHEN upper(coalesce(a.interview_status::text,'')) = 'HIRED'
               OR upper(coalesce(a.ai_status::text,'')) = 'HIRED'
               THEN 'placed'
             ELSE 'interning'
           END AS row_status
         FROM applications a
         JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
         LEFT JOIN companies c ON c.company_id = COALESCE(a.company_id, jp.company_id)
         WHERE upper(coalesce(a.interview_status::text,'')) = 'HIRED'
            OR upper(coalesce(a.ai_status::text,'')) IN ('HIRED','OFFER')
         ORDER BY lower(a.email), COALESCE(a.updated_at, a.created_at) DESC NULLS LAST
       )
       UPDATE cohort_candidates cc
       SET row_status = h.row_status,
           matched_to = h.employer || ' — ' || h.role_title,
           last_activity = COALESCE(h.placed_at, NOW())
       FROM hired h, cohorts co
       WHERE co.id = cc.cohort_id
         AND co.institution_id = $1
         AND lower(cc.email) = h.email_key`,
      [institutionId]
    )

    await query(
      `WITH engaged AS (
         SELECT DISTINCT ON (lower(a.email))
           lower(a.email) AS email_key,
           COALESCE(c.company_name, 'Employer') AS employer,
           jp.job_title AS role_title,
           COALESCE(a.updated_at, a.created_at) AS activity_at,
           CASE
             WHEN upper(coalesce(a.interview_status::text,'')) IN ('SCHEDULED','COMPLETED','INTERVIEWING')
               OR a.interview_time IS NOT NULL
               THEN 'interviewing'
             ELSE 'shortlisted'
           END AS row_status
         FROM applications a
         JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
         LEFT JOIN companies c ON c.company_id = COALESCE(a.company_id, jp.company_id)
         WHERE (
             upper(coalesce(a.ai_status::text,'')) IN ('SHORTLIST','SHORTLISTED','FLAG')
             OR upper(coalesce(a.interview_status::text,'')) IN ('SCHEDULED','COMPLETED','INTERVIEWING')
             OR a.interview_time IS NOT NULL
           )
           AND NOT (
             upper(coalesce(a.interview_status::text,'')) = 'HIRED'
             OR upper(coalesce(a.ai_status::text,'')) IN ('HIRED','OFFER')
           )
         ORDER BY lower(a.email), COALESCE(a.updated_at, a.created_at) DESC NULLS LAST
       )
       UPDATE cohort_candidates cc
       SET row_status = CASE
             WHEN cc.row_status IN ('placed','interning') THEN cc.row_status
             ELSE e.row_status
           END,
           matched_to = COALESCE(NULLIF(cc.matched_to,''), e.employer || ' — ' || e.role_title),
           last_activity = GREATEST(COALESCE(cc.last_activity, 'epoch'::timestamptz), e.activity_at)
       FROM engaged e, cohorts co
       WHERE co.id = cc.cohort_id
         AND co.institution_id = $1
         AND lower(cc.email) = e.email_key
         AND cc.row_status NOT IN ('placed','interning')`,
      [institutionId]
    )
  } catch (err) {
    logger.warn('syncInstitutionPlacementsFromApplications failed', { err, institutionId })
  }
}
