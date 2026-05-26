import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';

export class EmailParserService {
  /**
   * Attempts to match an email subject to a specific job posting.
   * Looks for exact job IDs, exact titles, or fuzzy matched titles.
   */
  async matchSubjectToJob(subject: string): Promise<string | null> {
    if (!subject) return null;

    // 1. Try to extract an explicit ID (e.g. "Application for JOB-1234")
    const idMatch = subject.match(/\b([0-9a-fA-F-]{36})\b/);
    if (idMatch) {
      const { rows } = await query('SELECT job_posting_id FROM job_postings WHERE job_posting_id = $1 LIMIT 1', [idMatch[1]]);
      if (rows.length > 0) return rows[0].job_posting_id;
    }

    // 2. Fuzzy match against job titles
    // E.g. "Application for Frontend Developer" -> "Frontend Developer"
    const cleanedSubject = subject.toLowerCase().replace(/application for|cv for|resume for/g, '').trim();
    
    // Fetch all active jobs to match against
    const { rows: jobs } = await query('SELECT job_posting_id, job_title FROM job_postings WHERE status = \'ACTIVE\'');
    
    for (const job of jobs) {
      const title = job.job_title.toLowerCase();
      // Simple includes check, could be enhanced with Levenshtein distance
      if (cleanedSubject.includes(title) || title.includes(cleanedSubject)) {
        return job.job_posting_id;
      }
    }

    logger.warn(`Could not match email subject "${subject}" to any active job.`);
    return null;
  }
}

export const emailParserService = new EmailParserService();
