import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export interface EmailClassificationInput {
  subject: string
  from: string
  body: string
  attachments: File[]
}

export interface EmailClassificationResult {
  job_posting_id: string
  company_id: string
  candidate_email: string
  candidate_name: string
  attachments: File[]
  matched: boolean
}

/**
 * Email Classification Engine
 * Detects company and job from forwarded applicant email
 */
export class EmailClassifier {
  /**
   * Parse subject to extract job title and company name
   * Subject MUST follow: "Application for <JobTitle> at <CompanyName>"
   */
  parseSubject(subject: string): { job_title: string; company_name: string } | null {
    // Primary pattern: "Application for <JobTitle> at <CompanyName>"
    const primaryPattern = /Application for (.+?) at (.+)$/i
    const match = subject.match(primaryPattern)
    
    if (match && match[1] && match[2]) {
      return {
        job_title: match[1].trim(),
        company_name: match[2].trim()
      }
    }

    // Fallback patterns
    const fallbackPatterns = [
      /Apply for (.+?) at (.+)$/i,
      /Application: (.+?) - (.+)$/i,
      /(.+?) at (.+?) - Application/i
    ]

    for (const pattern of fallbackPatterns) {
      const fallbackMatch = subject.match(pattern)
      if (fallbackMatch && fallbackMatch[1] && fallbackMatch[2]) {
        return {
          job_title: fallbackMatch[1].trim(),
          company_name: fallbackMatch[2].trim()
        }
      }
    }

    logger.warn(`Could not parse subject: ${subject}`)
    return null
  }

  /**
   * Match job posting from database
   * Query: SELECT * FROM job_postings
   * JOIN companies ON companies.company_id = job_postings.company_id
   * WHERE LOWER(job_title) = LOWER($1) AND LOWER(company_name) = LOWER($2)
   */
  async matchJobPosting(jobTitle: string, companyName: string): Promise<{
    job_posting_id: string
    company_id: string
  } | null> {
    try {
      const { rows } = await query<{
        job_posting_id: string
        company_id: string
      }>(
        `SELECT jp.job_posting_id, jp.company_id
         FROM job_postings jp
         JOIN companies c ON c.company_id = jp.company_id
         WHERE LOWER(jp.job_title) = LOWER($1)
           AND LOWER(c.company_name) = LOWER($2)
         LIMIT 1`,
        [jobTitle, companyName]
      )

      if (rows.length === 0) {
        logger.warn(`No job posting found for: ${jobTitle} at ${companyName}`)
        return null
      }

      return {
        job_posting_id: rows[0].job_posting_id,
        company_id: rows[0].company_id
      }
    } catch (error) {
      logger.error('Error matching job posting:', error)
      return null
    }
  }

  /**
   * Extract candidate name from email
   */
  extractCandidateName(from: string, body: string): string {
    // Try to extract from "From" field (e.g., "John Doe <john@example.com>")
    const fromMatch = from.match(/^(.+?)\s*<[^>]+>$/i)
    if (fromMatch && fromMatch[1]) {
      return fromMatch[1].trim()
    }

    // Try to extract from email body (common patterns)
    const bodyPatterns = [
      /(?:Hi|Hello|Dear)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:My name is|I am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /(?:Sincerely|Best regards|Regards),?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ]

    for (const pattern of bodyPatterns) {
      const match = body.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return 'Unknown'
  }

  /**
   * Extract candidate email from "from" field
   */
  extractCandidateEmail(from: string): string {
    // Extract email from "John Doe <john@example.com>" or just "john@example.com"
    const emailMatch = from.match(/<([^>]+)>/) || from.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    return emailMatch ? emailMatch[1] : from.trim()
  }

  /**
   * Classify email and return structured result
   */
  async classifyEmail(input: EmailClassificationInput): Promise<EmailClassificationResult | null> {
    try {
      // Parse subject
      const parsed = this.parseSubject(input.subject)
      if (!parsed) {
        logger.warn('Email subject does not match required format')
        return {
          job_posting_id: '',
          company_id: '',
          candidate_email: this.extractCandidateEmail(input.from),
          candidate_name: this.extractCandidateName(input.from, input.body),
          attachments: input.attachments,
          matched: false
        }
      }

      // Match job posting
      const jobMatch = await this.matchJobPosting(parsed.job_title, parsed.company_name)
      if (!jobMatch) {
        logger.warn(`Email marked as UNMATCHED: ${parsed.job_title} at ${parsed.company_name}`)
        return {
          job_posting_id: '',
          company_id: '',
          candidate_email: this.extractCandidateEmail(input.from),
          candidate_name: this.extractCandidateName(input.from, input.body),
          attachments: input.attachments,
          matched: false
        }
      }

      // Extract candidate info
      const candidateEmail = this.extractCandidateEmail(input.from)
      const candidateName = this.extractCandidateName(input.from, input.body)

      return {
        job_posting_id: jobMatch.job_posting_id,
        company_id: jobMatch.company_id,
        candidate_email: candidateEmail,
        candidate_name: candidateName,
        attachments: input.attachments,
        matched: true
      }
    } catch (error) {
      logger.error('Error classifying email:', error)
      return null
    }
  }
}

