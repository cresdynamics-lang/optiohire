import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';

export class EmailParserService {
  /**
   * Attempts to match an email subject to a specific job posting.
   * Enforces a literal exact match after stripping extra whitespace.
   * If the candidate includes extra text like "Application for", it will NOT match.
   */
  async matchSubjectToJob(subject: string): Promise<string | null> {
    if (!subject) return null;

    // Collapse all whitespace and trim. No prefix removal.
    const processedSubject = subject.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Execute high-speed exact match in the database
    const { rows } = await query(`
      SELECT job_posting_id 
      FROM job_postings 
      WHERE status = 'ACTIVE' 
        AND TRIM(REGEXP_REPLACE(LOWER(job_title), '\\s+', ' ', 'g')) = $1
      LIMIT 1
    `, [processedSubject]);

    if (rows.length > 0) {
      logger.info(`[PARSER] Found exact match: ${rows[0].job_posting_id} for subject: "${processedSubject}"`);
      return rows[0].job_posting_id;
    }

    logger.warn(`[PARSER] Subject mismatch (poor title) - ignoring email: "${subject}"`);
    return null;
  }
}

export const emailParserService = new EmailParserService();
