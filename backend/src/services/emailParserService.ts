import { query as defaultQuery } from '../db/index.js';
import { logger } from '../utils/logger.js';

export class EmailParserService {
  private query: typeof defaultQuery;

  constructor(queryFn = defaultQuery) {
    this.query = queryFn;
  }

  /**
   * Attempts to match an email subject to a specific job posting.
   * Enforces a literal exact match after stripping extra whitespace.
   * If the candidate includes extra text like "Application for", it will NOT match.
   */
  async matchSubjectToJob(subject: string): Promise<string | null> {
    if (!subject) return null;

    // Strip common email prefixes (Re:, Fwd:, Fw:) and collapse whitespace
    const cleanPrefixes = subject.replace(/^(?:(?:re|fwd|fw|fwd?)\s*:\s*)+/i, '');
    const processedSubject = cleanPrefixes.replace(/\s+/g, ' ').trim().toLowerCase();
    
    // Execute high-speed exact match in the database using "Job Title - Company Name" format
    const { rows } = await this.query(`
      SELECT j.job_posting_id 
      FROM job_postings j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.status = 'ACTIVE' 
        AND LOWER(TRIM(REGEXP_REPLACE(j.job_title || ' - ' || c.company_name, '\\s+', ' ', 'g'))) = $1
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
