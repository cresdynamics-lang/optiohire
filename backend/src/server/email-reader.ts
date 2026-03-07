import '../utils/env.js'

import { ImapFlow } from 'imapflow'
import { simpleParser } from 'mailparser'
import { query } from '../db/index.js'
import { JobPostingRepository } from '../repositories/jobPostingRepository.js'
import { CompanyRepository } from '../repositories/companyRepository.js'
import { ApplicationRepository } from '../repositories/applicationRepository.js'
import { CVParser } from '../lib/cv-parser.js'
import { AIScoringEngine } from '../lib/ai-scoring.js'
import { EmailClassifier } from '../lib/email-classifier.js'
import { saveFile } from '../utils/storage.js'
import { EmailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'

type EmailReaderStatus = {
  enabled: boolean
  running: boolean
  disabledReason: string | null
  lastProcessedAt: string | null
  lastError: string | null
}

export const emailReaderStatus: EmailReaderStatus = {
  enabled: process.env.ENABLE_EMAIL_READER !== 'false',
  running: false,
  disabledReason: null,
  lastProcessedAt: null,
  lastError: null
}

export class EmailReader {
  private client: ImapFlow | null = null
  private isRunning = false
  private jobPostingRepo: JobPostingRepository
  private companyRepo: CompanyRepository
  private applicationRepo: ApplicationRepository
  private cvParser: CVParser
  private aiScoring: AIScoringEngine
  private emailClassifier: EmailClassifier
  private emailService: EmailService

  constructor() {
    this.jobPostingRepo = new JobPostingRepository()
    this.companyRepo = new CompanyRepository()
    this.applicationRepo = new ApplicationRepository()
    this.cvParser = new CVParser()
    this.aiScoring = new AIScoringEngine()
    this.emailClassifier = new EmailClassifier()
    this.emailService = new EmailService()
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Email reader is already running')
      return
    }

    emailReaderStatus.enabled = process.env.ENABLE_EMAIL_READER !== 'false'
    emailReaderStatus.disabledReason = null
    emailReaderStatus.lastError = null

    // IMAP config from .env
    const imapHost = process.env.IMAP_HOST
    const imapPort = parseInt(process.env.IMAP_PORT || '993', 10)
    const imapUser = process.env.IMAP_USER
    const imapPass = process.env.IMAP_PASS
    const imapSecure = process.env.IMAP_SECURE !== 'false' // Default to true
    const imapPollMs = parseInt(process.env.IMAP_POLL_MS || '1000', 10) // Default 1 second for real-time processing

    if (!imapHost || !imapUser || !imapPass) {
      const missing = [
        !imapHost ? 'IMAP_HOST' : null,
        !imapUser ? 'IMAP_USER' : null,
        !imapPass ? 'IMAP_PASS' : null
      ].filter(Boolean)
      const reason = `IMAP credentials not configured (${missing.join(', ')}), email reader disabled`
      emailReaderStatus.disabledReason = reason
      logger.warn(reason)
      return
    }

    try {
      this.client = new ImapFlow({
        host: imapHost,
        port: imapPort,
        secure: imapSecure,
        auth: {
          user: imapUser,
          pass: imapPass
        },
        // Add connection timeout and retry options
        logger: false // Disable imapflow's internal logging to avoid spam
      })

      await this.client.connect()
      logger.info(`✅ IMAP email reader connected to ${imapHost}:${imapPort}`)

      // Ensure folders exist
      await this.ensureFolders()

      this.isRunning = true
      emailReaderStatus.running = true

      // Start monitoring inbox (this runs indefinitely)
      // Don't await - let it run in background, but catch errors
      this.monitorInbox(imapPollMs).catch(async (error) => {
        logger.error('❌ Email reader monitoring stopped due to error:', error)
        emailReaderStatus.lastError = (error as any)?.message || String(error)
        emailReaderStatus.running = false
        this.isRunning = false
        
        // Attempt to reconnect after 30 seconds
        logger.info('⏳ Attempting to reconnect email reader in 30 seconds...')
        await new Promise(resolve => setTimeout(resolve, 30000))
        
        if (emailReaderStatus.enabled && process.env.ENABLE_EMAIL_READER !== 'false') {
          logger.info('🔄 Reconnecting email reader...')
          this.start().catch(err => {
            logger.error('❌ Failed to reconnect email reader:', err)
          })
        }
      })
    } catch (error) {
      logger.error('❌ Failed to start email reader:', error)
      this.isRunning = false
      emailReaderStatus.running = false
      emailReaderStatus.lastError = (error as any)?.message || String(error)
      
      // Attempt to reconnect after 30 seconds
      logger.info('⏳ Attempting to reconnect email reader in 30 seconds...')
      setTimeout(() => {
        if (emailReaderStatus.enabled && process.env.ENABLE_EMAIL_READER !== 'false') {
          logger.info('🔄 Reconnecting email reader...')
          this.start().catch(err => {
            logger.error('❌ Failed to reconnect email reader:', err)
          })
        }
      }, 30000)
    }
  }

  /**
   * Ensure Processed and Failed folders exist
   */
  private async ensureFolders() {
    if (!this.client) return

    try {
      const folders = ['Processed', 'Failed']
      for (const folderName of folders) {
        try {
          await this.client.mailboxOpen(folderName)
        } catch {
          // Folder doesn't exist, create it
          await this.client.mailboxCreate(folderName)
          logger.info(`Created IMAP folder: ${folderName}`)
        }
      }
    } catch (error) {
      logger.warn('Could not ensure folders exist:', error)
    }
  }

  async stop() {
    this.isRunning = false
    emailReaderStatus.running = false
    if (this.client) {
      await this.client.logout()
      this.client = null
    }
    logger.info('Email reader stopped')
  }

  private async monitorInbox(pollInterval: number) {
    if (!this.client) return

    logger.info(`📧 Email reader started monitoring inbox (checking every ${pollInterval}ms)`)
    
    while (this.isRunning) {
      try {
        // Log periodic check (every 60 checks to avoid spam - approximately once per minute if polling every second)
        const checkCount = Math.floor(Date.now() / 60000) % 60
        if (checkCount === 0) {
          logger.info(`📧 Email reader monitoring inbox... (last processed: ${emailReaderStatus.lastProcessedAt || 'never'})`)
        }
        
        await this.processNewEmails()
        emailReaderStatus.lastProcessedAt = new Date().toISOString()
        emailReaderStatus.lastError = null // Clear error on success
      } catch (error) {
        const errorMsg = (error as any)?.message || String(error)
        logger.error('❌ Error processing emails:', error)
        emailReaderStatus.lastError = errorMsg
        
        // Don't stop monitoring on error - continue trying
        // If IMAP connection is lost, it will be caught in processNewEmails
      }

      // Wait before next check - use smaller delay to ensure responsiveness
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
    
    logger.warn('📧 Email reader stopped monitoring inbox')
  }

  /**
   * Reconnect IMAP client if connection is lost
   */
  private async reconnect(): Promise<boolean> {
    try {
      logger.info('🔄 Attempting to reconnect IMAP client...')
      
      // Close existing connection if any
      if (this.client) {
        try {
          await this.client.logout()
        } catch (e) {
          // Ignore logout errors
        }
        this.client = null
      }
      
      // Get IMAP config
      const imapHost = process.env.IMAP_HOST
      const imapPort = parseInt(process.env.IMAP_PORT || '993', 10)
      const imapUser = process.env.IMAP_USER
      const imapPass = process.env.IMAP_PASS
      const imapSecure = process.env.IMAP_SECURE !== 'false'
      
      if (!imapHost || !imapUser || !imapPass) {
        logger.error('❌ IMAP credentials missing, cannot reconnect')
        return false
      }
      
      // Create new connection
      this.client = new ImapFlow({
        host: imapHost,
        port: imapPort,
        secure: imapSecure,
        auth: {
          user: imapUser,
          pass: imapPass
        },
        logger: false // Disable IMAP library logging
      })
      
      // Connect
      await this.client.connect()
      logger.info('✅ IMAP client reconnected successfully')
      
      // Ensure folders exist
      await this.ensureFolders()
      
      return true
    } catch (error: any) {
      logger.error('❌ Failed to reconnect IMAP client:', error?.message || String(error))
      this.client = null
      return false
    }
  }

  private async processNewEmails() {
    // Check if client exists and is connected
    if (!this.client) {
      logger.warn('⚠️ IMAP client not connected, attempting to reconnect...')
      const reconnected = await this.reconnect()
      if (!reconnected) {
        return
      }
    }
    
    // Verify connection is still alive
    try {
      // Try a simple operation to verify connection
      if (!this.client || !this.client.authenticated) {
        logger.warn('⚠️ IMAP client not authenticated, reconnecting...')
        const reconnected = await this.reconnect()
        if (!reconnected) {
          return
        }
      }
    } catch (error) {
      logger.warn('⚠️ IMAP connection check failed, reconnecting...')
      const reconnected = await this.reconnect()
      if (!reconnected) {
        return
      }
    }

    try {
      const lock = await this.client!.getMailboxLock('INBOX')
      try {
        // Search for unseen emails (unread)
        const messages = await this.client!.search({
          seen: false
        })

        if (!messages || !Array.isArray(messages)) {
          return
        }

        if (messages.length > 0) {
          logger.info(`✅ Found ${messages.length} unread email(s) in inbox - processing...`)
        } else {
          // Log periodically that we're checking (every 10 checks = ~10 seconds)
          const checkCount = (this as any).checkCount || 0
          ;(this as any).checkCount = checkCount + 1
          if (checkCount % 10 === 0) {
            logger.debug(`📧 Checking inbox... (no unread emails found)`)
          }
        }

        for (const seq of messages) {
          try {
            const message = await this.client!.fetchOne(seq, {
              source: true,
              envelope: true
            })

            if (message && message.source && message.envelope) {
              const subject = message.envelope.subject || ''
              const sender = message.envelope.from?.[0]?.address || 'unknown'
              
              logger.info(`Processing email #${seq}: Subject="${subject}", From="${sender}"`)
              
              // Check if email subject matches any job posting
              const match = await this.findJobByExactSubject(subject)
              
              if (Array.isArray(match) && match.length > 0) {
                // Ambiguous title-only match: same role across multiple companies.
                // Create applications for ALL matching jobs so no company misses this candidate.
                logger.info(
                  `📥 Processing email for ${match.length} job(s) sharing this role (title-only match).`
                )
                let anyExtracted = false
                for (const job of match) {
                  try {
                    const extracted = await this.processEmailForJob(message.source, message.envelope, seq, job)
                    if (extracted) {
                      anyExtracted = true
                    }
                  } catch (error) {
                    logger.error(
                      `❌ Error processing email ${seq} for job ${job.job_posting_id} (${job.job_title} at ${job.company_name}):`,
                      error
                    )
                  }
                }
                
                if (anyExtracted) {
                  await this.client!.messageFlagsAdd(seq, ['\\Seen'])
                  await this.moveToFolder(seq, 'Processed')
                  logger.info(
                    `✅ Successfully processed email (CV extracted) for ${match.length} job(s): ${subject}`
                  )
                } else {
                  logger.warn(
                    `⚠️ Email processed for multiple jobs but CV not extracted for any - keeping unread: ${subject}`
                  )
                  await this.moveToFolder(seq, 'Failed')
                }
              } else if (match) {
                const matchingJob = match
                logger.info(
                  `✅ MATCH FOUND: Email subject matches job posting: "${subject}" -> Job: "${matchingJob.job_title}" (ID: ${matchingJob.job_posting_id})`
                )
                try {
                  // Process email and check if CV was extracted
                  const cvExtracted = await this.processEmailForJob(message.source, message.envelope, seq, matchingJob)
                  
                  // Only mark as read if CV was successfully extracted
                  if (cvExtracted) {
                    await this.client!.messageFlagsAdd(seq, ['\\Seen'])
                    await this.moveToFolder(seq, 'Processed')
                    logger.info(`✅ Successfully processed email (CV extracted): ${subject}`)
                  } else {
                    // Keep unread if no CV was found or extraction failed
                    logger.warn(`⚠️ Email processed but CV not extracted - keeping unread: ${subject}`)
                    await this.moveToFolder(seq, 'Failed')
                  }
                } catch (error) {
                  logger.error(`❌ Error processing email ${seq}:`, error)
                  
                  // Keep unread on error - don't mark as seen
                  await this.moveToFolder(seq, 'Failed')
                }
              } else {
                logger.warn(`❌ NO MATCH: Email subject "${subject}" doesn't match any job posting`)
                logger.warn(`   From: ${sender}`)
                // Log available jobs for debugging
                try {
                  const { rows: availableJobs } = await query(
                    `SELECT job_title, status, created_at FROM job_postings 
                     WHERE (status IS NULL OR UPPER(TRIM(status)) = 'ACTIVE' OR status = '')
                     ORDER BY created_at DESC
                     LIMIT 10`
                  )
                  if (availableJobs.length > 0) {
                    logger.warn(`   Available jobs for matching (${availableJobs.length}):`)
                    availableJobs.forEach((j, idx) => {
                      logger.warn(`     ${idx + 1}. "${j.job_title}" (Status: ${j.status || 'NULL'}, Created: ${j.created_at})`)
                    })
                    logger.warn(`   💡 TIP: Email subject should contain the job title. Examples:`)
                    logger.warn(`      - Exact: "${availableJobs[0].job_title}"`)
                    logger.warn(`      - Prefix: "${availableJobs[0].job_title} - Application"`)
                    logger.warn(`      - Contains: "Application for ${availableJobs[0].job_title}"`)
                  } else {
                    logger.warn(`   ⚠️ No active jobs found in database`)
                  }
                } catch (dbErr) {
                  logger.error(`   Error querying jobs for debug:`, dbErr)
                }
                // Move unmatched email to Failed folder but keep it unread for manual review
                try {
                  await this.moveToFolder(seq, 'Failed')
                  logger.warn(`   Email moved to Failed folder (still unread for manual review)`)
                } catch (moveErr) {
                  logger.error(`   Failed to move email to Failed folder:`, moveErr)
                }
              }
            }
          } catch (error) {
            logger.error(`Error processing email ${seq}:`, error)
            // Keep email unread on error - don't mark as seen
            try {
              await this.moveToFolder(seq, 'Failed')
            } catch (moveError) {
              logger.error(`Failed to move email ${seq} to Failed folder:`, moveError)
            }
          }
        }
      } finally {
        lock.release()
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error('❌ Error accessing inbox:', errorMsg)
      
      // Check if it's a connection error
      if (errorMsg.includes('Connection') || errorMsg.includes('ECONNRESET') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('not available')) {
        logger.warn('⚠️ IMAP connection lost, will attempt to reconnect on next check')
        emailReaderStatus.lastError = `Connection error: ${errorMsg}`
        
        // Mark client as disconnected
        this.client = null
        
        // Don't set running to false - let the reconnection logic handle it
      } else {
        emailReaderStatus.lastError = errorMsg
      }
    }
  }

  /**
   * Move email to a different folder
   */
  private async moveToFolder(seq: number, folderName: string) {
    if (!this.client) return

    try {
      await this.client.messageMove(seq, folderName)
      logger.debug(`Moved email ${seq} to ${folderName}`)
    } catch (error) {
      logger.warn(`Could not move email ${seq} to ${folderName}:`, error)
    }
  }

  /**
   * Find job posting by subject match (case-insensitive)
   *
   * HARDENED RULE:
   * - Subject MUST contain both the job title AND the company name to be considered a match.
   * - Recommended pattern for HRs and applicants:
   *     "Job Title at Company Name"
   *   e.g. "Software Engineer at Britam"
   *
   * This prevents ambiguity when multiple companies hire for the same role.
   */
  private async findJobByExactSubject(emailSubject: string): Promise<any | null> {
    try {
      // Normalize subject: trim, lowercase, and collapse multiple spaces
      const normalizedSubject = emailSubject.toLowerCase().trim().replace(/\s+/g, ' ')
      
      logger.info(`🔍 Matching email subject: "${emailSubject}" (normalized: "${normalizedSubject}")`)
      
      // Query all active jobs first, including company name for disambiguation
      let { rows: allActiveJobs } = await query(
        `SELECT jp.job_posting_id,
                jp.company_id,
                jp.job_title,
                jp.job_description,
                jp.skills_required as required_skills,
                jp.application_deadline,
                jp.interview_start_time,
                jp.meeting_link,
                jp.created_at,
                jp.updated_at,
                jp.status,
                c.company_name,
                c.company_domain,
                c.company_email,
                c.hr_email
         FROM job_postings jp
         JOIN companies c ON c.company_id = jp.company_id
         WHERE (jp.status IS NULL 
                OR UPPER(TRIM(jp.status)) = 'ACTIVE' 
                OR jp.status = '')
         ORDER BY jp.created_at DESC`
      )
      
      // If no active jobs found, get ALL jobs for debugging and matching
      if (allActiveJobs.length === 0) {
        logger.warn(`⚠️ No active jobs found with status filter. Checking all jobs in database...`)
        try {
          const { rows: allJobs } = await query(
            `SELECT jp.job_posting_id, jp.company_id, jp.job_title, jp.status, jp.created_at, c.company_name
             FROM job_postings jp
             JOIN companies c ON c.company_id = jp.company_id
             ORDER BY jp.created_at DESC
             LIMIT 10`
          )
          if (allJobs.length > 0) {
            logger.warn(`Found ${allJobs.length} jobs in database (ignoring status): ${allJobs.map(j => `"${j.job_title}" at "${j.company_name}" (status: ${j.status || 'NULL'})`).join(', ')}`)
            // Get full job details for matching, with company info
            const { rows: allJobsFull } = await query(
              `SELECT jp.job_posting_id,
                      jp.company_id,
                      jp.job_title,
                      jp.job_description,
                      jp.skills_required as required_skills,
                      jp.application_deadline,
                      jp.interview_start_time,
                      jp.meeting_link,
                      jp.created_at,
                      jp.updated_at,
                      jp.status,
                      c.company_name,
                      c.company_domain,
                      c.company_email,
                      c.hr_email
               FROM job_postings jp
               JOIN companies c ON c.company_id = jp.company_id
               ORDER BY jp.created_at DESC`
            )
            allActiveJobs = allJobsFull // Use all jobs for matching
          } else {
            logger.error(`❌ No jobs found in database at all!`)
            return null
          }
        } catch (dbError: any) {
          logger.error(`❌ Database query error when checking for jobs:`, dbError?.message || String(dbError))
          return null
        }
      }
      
      logger.info(`📋 Checking ${allActiveJobs.length} job(s) against email subject. Jobs: ${allActiveJobs.map(j => `"${j.job_title}" at "${j.company_name}"`).join(', ')}`)
      
      // Find the best match
      // Priority (only when BOTH title and company name appear in subject):
      // 1) Exact match to "Job Title at Company Name"
      // 2) Subject starts with "Job Title at Company Name"
      // 3) Subject contains "Job Title at Company Name"
      // 4) Fallback: subject contains both title and company name (any order)
      //
      // Additionally, track ambiguous cases where the subject only contains the title
      // (and not the company name). In that case, when multiple companies are hiring
      // for the same role, we will create applications for ALL matching jobs so no
      // company misses the candidate.
      let bestMatch: any = null
      let longestMatchLength = 0
      let bestMatchScore = 0
      const ambiguousByTitle: Record<string, any[]> = {}
      
      for (const job of allActiveJobs) {
        // Normalize job title and company name: trim, lowercase, and collapse multiple spaces
        const normalizedJobTitle = job.job_title.toLowerCase().trim().replace(/\s+/g, ' ')
        const normalizedCompanyName = (job.company_name || '').toLowerCase().trim().replace(/\s+/g, ' ')

        if (!normalizedJobTitle || !normalizedCompanyName) {
          continue
        }

        // HARD RULE for single-company match: require both title AND company name in subject
        const subjectContainsTitle = normalizedSubject.includes(normalizedJobTitle)
        const subjectContainsCompany = normalizedSubject.includes(normalizedCompanyName)
        if (!subjectContainsTitle && !subjectContainsCompany) {
          continue
        }

        // If we have the title but NOT the company name, track as ambiguous-by-title.
        // Later, if no precise match is found, we will create applications for all
        // jobs that share this title across companies.
        if (subjectContainsTitle && !subjectContainsCompany) {
          if (!ambiguousByTitle[normalizedJobTitle]) {
            ambiguousByTitle[normalizedJobTitle] = []
          }
          ambiguousByTitle[normalizedJobTitle].push(job)
          continue
        }

        // Expected canonical subject: "Job Title at Company Name"
        const expectedSubject = `${normalizedJobTitle} at ${normalizedCompanyName}`

        // 1. Exact match against canonical subject
        if (normalizedSubject === expectedSubject) {
          logger.info(`✅ EXACT MATCH: "${emailSubject}" exactly matches "${job.job_title} at ${job.company_name}"`)
          return job
        }

        // 2. Prefix match: subject starts with canonical subject
        if (normalizedSubject.startsWith(expectedSubject)) {
          logger.info(`✅ PREFIX MATCH: "${emailSubject}" starts with "${job.job_title} at ${job.company_name}"`)
          if (expectedSubject.length > longestMatchLength || bestMatchScore < 4) {
            longestMatchLength = expectedSubject.length
            bestMatch = job
            bestMatchScore = 4
          }
          continue
        }

        // 3. Subject contains canonical subject
        if (normalizedSubject.includes(expectedSubject)) {
          logger.info(`✅ CONTAINS MATCH: canonical "${job.job_title} at ${job.company_name}" found in "${emailSubject}"`)
          if (expectedSubject.length > longestMatchLength || bestMatchScore < 3) {
            longestMatchLength = expectedSubject.length
            bestMatch = job
            bestMatchScore = 3
          }
          continue
        }

        // 4. Fallback: subject contains both title and company name in any order
        if (subjectContainsTitle && subjectContainsCompany) {
          const combinedLength = normalizedJobTitle.length + normalizedCompanyName.length
          if (combinedLength > longestMatchLength || bestMatchScore < 2) {
            logger.info(`✅ TITLE+COMPANY MATCH: "${emailSubject}" contains "${job.job_title}" and "${job.company_name}"`)
            longestMatchLength = combinedLength
            bestMatch = job
            bestMatchScore = 2
          }
        }
      }
      
      if (bestMatch) {
        logger.info(`✅ MATCH SELECTED: "${bestMatch.job_title}" (ID: ${bestMatch.job_posting_id})`)
        return bestMatch
      }

      // No precise (title+company) match.
      // If we have ambiguous title-only matches, return all jobs for that role
      // so the caller can create applications for each company hiring that title.
      const ambiguousTitles = Object.keys(ambiguousByTitle)
      if (ambiguousTitles.length > 0) {
        const allAmbiguousJobs = ambiguousTitles.flatMap((key) => ambiguousByTitle[key])
        if (allAmbiguousJobs.length === 1) {
          logger.info(
            `✅ TITLE-ONLY MATCH: "${emailSubject}" matched uniquely to "${allAmbiguousJobs[0].job_title}" at "${allAmbiguousJobs[0].company_name}"`
          )
          return allAmbiguousJobs[0]
        }
        logger.info(
          `✅ TITLE-ONLY MULTI MATCH: "${emailSubject}" matched role "${ambiguousTitles.join(
            ', '
          )}" across ${allAmbiguousJobs.length} job(s); will create applications for all companies hiring this role.`
        )
        return allAmbiguousJobs
      }

      logger.warn(
        `❌ NO MATCH: Subject "${emailSubject}" doesn't match any job. Available jobs: ${allActiveJobs
          .map((j) => `"${j.job_title}"`)
          .join(', ')}`
      )
      return null
    } catch (error) {
      logger.error('❌ Error finding job by subject:', error)
      return null
    }
  }

  /**
   * Process email for a specific job posting (exact subject match)
   */
  private async processEmailForJob(source: Buffer, envelope: any, seq: number, job: any): Promise<boolean> {
    try {
      const parsed = await simpleParser(source)
      
      const senderName = parsed.from?.text || envelope.from[0]?.name || 'Unknown'
      const senderEmail = parsed.from?.value[0]?.address || envelope.from[0]?.address || ''
      const subject = parsed.subject || envelope.subject || ''

      logger.info(`Processing email from ${senderEmail} for job: ${job.job_title}`)

      // Get company from job
      const company = await this.companyRepo.findById(job.company_id)
      if (!company) {
        logger.warn(`Company not found for job ${job.job_posting_id}`)
        return false
      }

      // Extract attachments (CV)
      let cvUrl: string | null = null
      let cvBuffer: Buffer | null = null
      let cvMimeType: string | null = null

      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const attachment of parsed.attachments) {
          const filename = attachment.filename || 'attachment'
          const ext = filename.toLowerCase()
          
          if (ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc')) {
            cvBuffer = attachment.content as Buffer
            cvMimeType = attachment.contentType || 'application/pdf'
            
            // Save CV file
            const savedPath = await saveFile(`cvs/${job.job_posting_id}_${Date.now()}_${filename}`, cvBuffer)
            cvUrl = savedPath
            logger.info(`CV extracted and saved: ${filename} -> ${savedPath}`)
            break
          }
        }
      }

      // Check if CV was extracted
      if (!cvBuffer || !cvMimeType) {
        logger.warn(`No CV attachment found in email from ${senderEmail} for job ${job.job_posting_id}`)
        // Still create application record but return false (keep email unread)
        await this.applicationRepo.create({
          job_posting_id: job.job_posting_id,
          company_id: company.company_id,
          candidate_name: senderName,
          email: senderEmail,
          resume_url: null
        })
        return false
      }

      // Create application record
      const application = await this.applicationRepo.create({
        job_posting_id: job.job_posting_id,
        company_id: company.company_id,
        candidate_name: senderName,
        email: senderEmail,
        resume_url: cvUrl
      })

      // Process CV - this is where CV extraction is confirmed
      try {
        await this.processCandidateCV(application.application_id, cvBuffer, cvMimeType, job, company)
        logger.info(`CV successfully processed for application ${application.application_id}`)
      } catch (cvError) {
        logger.error(`Error processing CV for application ${application.application_id}:`, cvError)
        // CV extraction failed, return false to keep email unread
        return false
      }

      // Send HR notification
      try {
        await this.emailService.sendHRNotification({
          hrEmail: company.hr_email,
          candidateName: senderName,
          candidateEmail: senderEmail,
          jobTitle: job.job_title,
          companyName: company.company_name
        })

        // Applicant count milestone notifications (5, 10, 50, 100, 200, 500, 1000, 2000)
        const thresholds = [5, 10, 50, 100, 200, 500, 1000, 2000]
        const { rows: countRows } = await query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM applications WHERE job_posting_id = $1`,
          [job.job_posting_id]
        )
        const total = parseInt(countRows[0]?.total || '0', 10)
        if (thresholds.includes(total)) {
          await this.emailService.sendApplicantMilestoneNotification({
            recipients: [company.hr_email, company.company_email, company.hiring_manager_email].filter(Boolean) as string[],
            jobTitle: job.job_title,
            companyName: company.company_name,
            totalApplications: total
          })
        }
      } catch (emailError) {
        // SMTP/network issues should NOT block applicant ingestion + analysis
        logger.warn(
          `Failed to send HR or milestone notification for application ${application.application_id} (continuing):`,
          emailError
        )
      }

      logger.info(`Successfully processed application from ${senderEmail} for job ${job.job_posting_id} - CV extracted and analyzed`)
      return true // CV was successfully extracted and processed
    } catch (error) {
      logger.error('Error processing email:', error)
      return false // Keep email unread on error
    }
  }

  private async processEmail(source: Buffer, envelope: any, seq: number): Promise<boolean> {
    try {
      const parsed = await simpleParser(source)
      
      const senderName = parsed.from?.text || envelope.from[0]?.name || 'Unknown'
      const senderEmail = parsed.from?.value[0]?.address || envelope.from[0]?.address || ''
      const subject = parsed.subject || envelope.subject || ''

      logger.info(`Processing email from ${senderEmail}: ${subject}`)

      // Detect job from subject
      const jobMatch = this.detectJobFromSubject(subject)
      if (!jobMatch) {
        logger.warn(`Could not detect job from subject: ${subject}`)
        return false
      }

      logger.info(`Detected job: "${jobMatch.jobTitle}" at "${jobMatch.companyName}"`)

      // Strategy 1: Try to find company first, then job
      let company = await this.companyRepo.findByName(jobMatch.companyName)
      let job = null

      if (company) {
        logger.info(`Found company: ${company.company_name}`)
        const jobs = await this.jobPostingRepo.findByCompany(company.company_id)
        job = jobs.find(j => 
          j.job_title.toLowerCase().includes(jobMatch.jobTitle.toLowerCase()) ||
          jobMatch.jobTitle.toLowerCase().includes(j.job_title.toLowerCase())
        )
        if (job) {
          logger.info(`Found job by company: ${job.job_title} at ${company.company_name}`)
        }
      }

      // Strategy 2: If company/job not found, search all active jobs by title
      if (!job) {
        logger.info(`Searching all active jobs for title: "${jobMatch.jobTitle}"`)
        const { rows: allJobs } = await query(
          `SELECT jp.job_posting_id, jp.company_id, jp.job_title, jp.job_description, 
                  jp.skills_required as required_skills, jp.application_deadline, 
                  jp.interview_start_time, jp.meeting_link, jp.created_at, jp.updated_at
           FROM job_postings jp
           WHERE (jp.status IS NULL OR jp.status = 'ACTIVE' OR jp.status = '')
           ORDER BY jp.created_at DESC
           LIMIT 50`
        )
        
        // Try to find best match by title (case-insensitive, partial match)
        const jobTitleLower = jobMatch.jobTitle.toLowerCase()
        job = allJobs.find((j: any) => {
          const dbTitle = j.job_title.toLowerCase()
          return dbTitle === jobTitleLower ||
                 dbTitle.includes(jobTitleLower) || 
                 jobTitleLower.includes(dbTitle) ||
                 jobTitleLower.split(/\s+/).some(word => word.length > 3 && dbTitle.includes(word))
        })
        
        if (job) {
          logger.info(`Found job by title match: ${job.job_title}`)
          // Get company from job
          company = await this.companyRepo.findById(job.company_id)
          if (company) {
            logger.info(`Found company from job: ${company.company_name}`)
          }
        }
      }

      if (!job) {
        logger.warn(`Job not found: "${jobMatch.jobTitle}" (company: "${jobMatch.companyName}"). Available jobs may not match.`)
        return false
      }

      if (!company) {
        logger.warn(`Company not found for job ${job.job_posting_id}`)
        return false
      }

      // Extract attachments (CV)
      let cvUrl: string | null = null
      let cvBuffer: Buffer | null = null
      let cvMimeType: string | null = null

      if (parsed.attachments && parsed.attachments.length > 0) {
        for (const attachment of parsed.attachments) {
          const filename = attachment.filename || 'attachment'
          const ext = filename.toLowerCase()
          
          if (ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc')) {
            cvBuffer = attachment.content as Buffer
            cvMimeType = attachment.contentType || 'application/pdf'
            
            // Save CV file
            const savedPath = await saveFile(`cvs/${job.job_posting_id}_${Date.now()}_${filename}`, cvBuffer)
            cvUrl = savedPath
            logger.info(`CV extracted and saved: ${filename} -> ${savedPath}`)
            break
          }
        }
      }

      // Check if CV was extracted
      if (!cvBuffer || !cvMimeType) {
        logger.warn(`No CV attachment found in email from ${senderEmail} for job ${job.job_posting_id}`)
        // Still create application record but return false (keep email unread)
        await this.applicationRepo.create({
          job_posting_id: job.job_posting_id,
          company_id: company.company_id,
          candidate_name: senderName,
          email: senderEmail,
          resume_url: null
        })
        return false
      }

      // Create application record
      const application = await this.applicationRepo.create({
        job_posting_id: job.job_posting_id,
        company_id: company.company_id,
        candidate_name: senderName,
        email: senderEmail,
        resume_url: cvUrl
      })

      // Process CV - this is where CV extraction is confirmed
      try {
        await this.processCandidateCV(application.application_id, cvBuffer, cvMimeType, job, company)
        logger.info(`CV successfully processed for application ${application.application_id}`)
      } catch (cvError) {
        logger.error(`Error processing CV for application ${application.application_id}:`, cvError)
        // CV extraction failed, return false to keep email unread
        return false
      }

      // Send HR notification
      await this.emailService.sendHRNotification({
        hrEmail: company.hr_email,
        candidateName: senderName,
        candidateEmail: senderEmail,
        jobTitle: job.job_title,
        companyName: company.company_name
      })

      logger.info(`Successfully processed application from ${senderEmail} for job ${job.job_posting_id} - CV extracted and analyzed`)
      return true // CV was successfully extracted and processed
    } catch (error) {
      logger.error('Error processing email:', error)
      return false // Keep email unread on error
    }
  }

  private detectJobFromSubject(subject: string): { jobTitle: string; companyName: string } | null {
    // Pattern: "Application for {Job Title} at {Company Name}"
    const patterns = [
      /application\s+for\s+(.+?)\s+at\s+(.+)/i,
      /apply\s+for\s+(.+?)\s+at\s+(.+)/i,
      /(.+?)\s+-\s+(.+?)\s+application/i
    ]

    for (const pattern of patterns) {
      const match = subject.match(pattern)
      if (match) {
        return {
          jobTitle: match[1].trim(),
          companyName: match[2].trim()
        }
      }
    }

    // Fallback: try to extract from common formats
    const parts = subject.split(/[-\|]/).map(s => s.trim())
    if (parts.length >= 2) {
      return {
        jobTitle: parts[0],
        companyName: parts[parts.length - 1]
      }
    }

    return null
  }

  private async processCandidateCV(
    applicationId: string,
    cvBuffer: Buffer,
    mimeType: string,
    job: any,
    company: any
  ) {
      // Parse CV
    let parsed: { textContent: string; linkedin: string | null; github: string | null; emails: string[]; other_links: string[] }
    try {
      parsed = await this.cvParser.parseCVBuffer(cvBuffer, mimeType)
    } catch (error) {
      const errorMsg = (error as any)?.message || String(error)
      logger.error(`Failed to parse CV for application ${applicationId}:`, error)

      // Mark as FLAG so it shows up as "analyzed" even if parsing fails
      try {
        await this.applicationRepo.updateScoring({
          application_id: applicationId,
          ai_score: 0,
          ai_status: 'FLAG',
          reasoning: `Automatic analysis failed: could not parse resume (${errorMsg}). Please review the attachment manually.`,
          parsed_resume_json: null
        })
      } catch (updateError) {
        logger.error(`Failed to mark application ${applicationId} as FLAG after CV parse failure:`, updateError)
      }
      throw error
    }

      // Build parsed resume JSON with links (aligned with CV parser output)
      const parsedResumeJson = {
        textContent: parsed.textContent,
        linkedin: parsed.linkedin,
        github: parsed.github,
        emails: parsed.emails,
        other_links: parsed.other_links
      }

      // Update application with parsed resume
      await this.applicationRepo.updateParsedResume({
        application_id: applicationId,
        parsed_resume_json: parsedResumeJson
      })

      // Extract skills
      const extractedSkills = this.cvParser.extractSkills(parsed.textContent, job.required_skills || [])

      // Score candidate (aligned with new input format - includes company details)
      const scoringResult = await this.aiScoring.scoreCandidate({
        job: {
          title: job.job_title,
          description: job.job_description,
          required_skills: job.required_skills || []
        },
        company: {
          company_name: company.company_name,
          company_domain: company.company_domain || null,
          company_email: company.company_email || null,
          hr_email: company.hr_email || null,
          hiring_manager_email: company.hiring_manager_email || null,
          settings: company.settings || null
        },
        cvText: parsed.textContent // Full CV text - no truncation before passing to AI
      })

      // Map status: FLAGGED -> FLAG, REJECTED -> REJECT (to match database enum)
      const dbStatus = scoringResult.status === 'FLAGGED' ? 'FLAG' : 
                       scoringResult.status === 'REJECTED' ? 'REJECT' : 
                       scoringResult.status
      
      // Update application with score
      await this.applicationRepo.updateScoring({
        application_id: applicationId,
        ai_score: scoringResult.score,
        ai_status: dbStatus as 'SHORTLIST' | 'FLAG' | 'REJECT',
        reasoning: scoringResult.reasoning,
        parsed_resume_json: parsedResumeJson
      })

      // Send shortlist or rejection email to candidate immediately after ranking (same flow, no delay)
      const application = await this.applicationRepo.findById(applicationId)
      if (application) {
        const companyData = await this.companyRepo.findById(company.company_id)
        try {
          if (scoringResult.status === 'SHORTLIST') {
            logger.info(`📧 Sending shortlist email to ${application.email} for application ${applicationId}`)
            await this.emailService.sendShortlistEmail({
              candidateEmail: application.email,
              candidateName: application.candidate_name || 'Candidate',
              jobTitle: job.job_title,
              companyName: companyData?.company_name || company.company_name,
              companyEmail: companyData?.company_email || company.company_email,
              companyDomain: companyData?.company_domain || company.company_domain
              // No interview link/date/time: HR sends those when they use the Schedule button
            })
            logger.info(`✅ Shortlist email sent successfully to ${application.email}`)
          } else if (scoringResult.status === 'REJECTED') {
            logger.info(`📧 Sending rejection email to ${application.email} for application ${applicationId}`)
            await this.emailService.sendRejectionEmail({
              candidateEmail: application.email,
              candidateName: application.candidate_name || 'Candidate',
              jobTitle: job.job_title,
              companyName: companyData?.company_name || company.company_name,
              companyEmail: companyData?.company_email || company.company_email,
              companyDomain: companyData?.company_domain || company.company_domain
            })
            logger.info(`✅ Rejection email sent successfully to ${application.email}`)
          }
        } catch (emailError: any) {
          // SMTP/network issues should NOT block analysis
          const errorMsg = emailError?.message || String(emailError)
          logger.error(`❌ Failed to send candidate decision email for application ${applicationId}:`, errorMsg)
          logger.error(`   Email error details:`, emailError)
          // Continue - don't fail the analysis if email fails
        }
      }

      logger.info(`Processed CV for application ${applicationId}, score: ${scoringResult.score}, status: ${scoringResult.status}`)
  }
}

// Start email reader if enabled
if (process.env.ENABLE_EMAIL_READER !== 'false') {
  const emailReader = new EmailReader()
  emailReader.start().catch(err => {
    logger.error('Failed to start email reader:', err)
    emailReaderStatus.lastError = (err as any)?.message || String(err)
  })
} else {
  const reason = 'Email reader disabled via ENABLE_EMAIL_READER=false'
  emailReaderStatus.enabled = false
  emailReaderStatus.disabledReason = reason
  logger.info(reason)
}

