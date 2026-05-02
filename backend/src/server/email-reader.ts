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
import { GoogleCalendarService } from '../services/googleCalendarService.js'
import { logger } from '../utils/logger.js'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { APPLICATION_INBOX_EMAIL } from '../config/applicationInbox.js'

type EmailReaderStatus = {
  enabled: boolean
  running: boolean
  disabledReason: string | null
  inboxAddress: string | null
  lastProcessedAt: string | null
  lastError: string | null
  consecutiveFailures: number
  reconnectDelayMs: number
  lastFailureCategory: 'imap_limit' | 'auth' | 'network' | 'unknown' | null
}

export const emailReaderStatus: EmailReaderStatus = {
  enabled: process.env.ENABLE_EMAIL_READER !== 'false',
  running: false,
  disabledReason: null,
  inboxAddress: (process.env.IMAP_USER || null),
  lastProcessedAt: null,
  lastError: null,
  consecutiveFailures: 0,
  reconnectDelayMs: 30000,
  lastFailureCategory: null
}

export class EmailReader {
  private client: ImapFlow | null = null
  private isRunning = false
  private isStarting = false
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectDelayMs = 30000
  private readonly maxReconnectDelayMs = 300000
  private consecutiveImapFailures = 0
  private readonly circuitBreakerThreshold = 5
  private readonly circuitBreakerCooldownMs = 600000
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

  private normalizeCandidateLinks(parsed: {
    linkedin: string | null
    github: string | null
    other_links: string[]
  }): string[] {
    const links = [parsed.linkedin, parsed.github, ...(parsed.other_links || [])]
      .filter((v): v is string => !!v && typeof v === 'string')
      .map((v) => v.trim())
      .filter((v) => /^https?:\/\//i.test(v))

    const seen = new Set<string>()
    const deduped: string[] = []
    for (const link of links) {
      const key = link.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(link)
    }
    return deduped.slice(0, 5)
  }

  private async scanCandidateLinks(links: string[]): Promise<string[]> {
    const summaries: string[] = []
    const timeoutMs = Number(process.env.CANDIDATE_LINK_SCAN_TIMEOUT_MS || 4500)

    for (const link of links) {
      const ctrl = new AbortController()
      const timeout = setTimeout(() => ctrl.abort(), timeoutMs)
      try {
        const res = await fetch(link, {
          method: 'GET',
          redirect: 'follow',
          signal: ctrl.signal,
          headers: {
            'User-Agent': 'OptioHire-LinkScanner/1.0'
          }
        })
        if (!res.ok) {
          summaries.push(`${link} -> unavailable (${res.status})`)
          continue
        }
        const contentType = (res.headers.get('content-type') || '').toLowerCase()
        if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/json')) {
          summaries.push(`${link} -> non-text content (${contentType || 'unknown'})`)
          continue
        }
        const body = await res.text()
        const flattened = body
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const preview = flattened.slice(0, 220)
        summaries.push(`${link} -> ${preview || 'content available, but no preview extracted'}`)
      } catch (err: any) {
        const msg = err?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : err?.message || 'scan failed'
        summaries.push(`${link} -> ${msg}`)
      } finally {
        clearTimeout(timeout)
      }
    }

    return summaries
  }

  private scheduleReconnect(delayMs: number = 30000) {
    if (this.reconnectTimer) return
    const nextDelay = Math.min(
      Math.max(delayMs, this.reconnectDelayMs),
      this.maxReconnectDelayMs
    )
    this.reconnectDelayMs = Math.min(nextDelay * 2, this.maxReconnectDelayMs)
    logger.info(`⏳ Attempting to reconnect email reader in ${Math.floor(nextDelay / 1000)} seconds...`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (emailReaderStatus.enabled && process.env.ENABLE_EMAIL_READER !== 'false') {
        logger.info('🔄 Reconnecting email reader...')
        this.start().catch(err => {
          logger.error('❌ Failed to reconnect email reader:', err)
        })
      }
    }, nextDelay)
  }

  private isImapAlertOrAuthFailure(error: any): boolean {
    const message = (error?.message || String(error || '')).toLowerCase()
    const responseText = (error?.responseText || '').toLowerCase()
    const response = (error?.response || '').toLowerCase()
    const status = (error?.responseStatus || '').toLowerCase()
    return (
      message.includes('authentication') ||
      message.includes('too many simultaneous connections') ||
      responseText.includes('too many simultaneous connections') ||
      response.includes('alert') ||
      status === 'no'
    )
  }

  private categorizeFailure(error: any): 'imap_limit' | 'auth' | 'network' | 'unknown' {
    const message = (error?.message || String(error || '')).toLowerCase()
    const responseText = (error?.responseText || '').toLowerCase()
    if (message.includes('too many simultaneous connections') || responseText.includes('too many simultaneous connections')) {
      return 'imap_limit'
    }
    if (message.includes('authentication') || message.includes('invalid credentials')) {
      return 'auth'
    }
    if (message.includes('econnreset') || message.includes('timeout') || message.includes('enotfound')) {
      return 'network'
    }
    return 'unknown'
  }

  private scheduleReconnectWithCircuitBreaker(error: any) {
    const isImapLimitError = this.isImapAlertOrAuthFailure(error)
    this.consecutiveImapFailures = isImapLimitError ? this.consecutiveImapFailures + 1 : 0
    emailReaderStatus.consecutiveFailures = this.consecutiveImapFailures
    emailReaderStatus.lastFailureCategory = this.categorizeFailure(error)

    if (this.consecutiveImapFailures >= this.circuitBreakerThreshold) {
      logger.warn(
        `🚧 Email watcher circuit breaker open after ${this.consecutiveImapFailures} IMAP failures. Cooling down for ${Math.floor(this.circuitBreakerCooldownMs / 60000)} minutes.`
      )
      this.consecutiveImapFailures = 0
      this.reconnectDelayMs = this.circuitBreakerCooldownMs
      emailReaderStatus.reconnectDelayMs = this.reconnectDelayMs
      this.scheduleReconnect(this.circuitBreakerCooldownMs)
      return
    }

    emailReaderStatus.reconnectDelayMs = this.reconnectDelayMs
    this.scheduleReconnect(30000)
  }

  private attachImapEventHandlers(client: ImapFlow) {
    client.on('error', async (error: any) => {
      const errorMsg = error?.message || String(error)
      logger.error('❌ IMAP client error:', errorMsg)
      emailReaderStatus.lastError = errorMsg
      emailReaderStatus.running = false
      this.isRunning = false

      try {
        await client.logout()
      } catch {
        // no-op
      }
      if (this.client === client) {
        this.client = null
      }
      this.scheduleReconnect(10000)
    })
  }

  async start() {
    if (this.isRunning || this.isStarting) {
      logger.warn('Email reader is already running')
      return
    }
    this.isStarting = true

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
      emailReaderStatus.inboxAddress = imapUser || null
      logger.warn(reason)
      return
    }
    emailReaderStatus.inboxAddress = imapUser
    if (imapUser.toLowerCase().trim() !== APPLICATION_INBOX_EMAIL) {
      logger.warn(
        `IMAP_USER (${imapUser}) differs from configured APPLICATION_INBOX_EMAIL (${APPLICATION_INBOX_EMAIL}).` +
          ' Use the same inbox so job adverts and watcher routing stay consistent.'
      )
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
      this.attachImapEventHandlers(this.client)

      await this.client.connect()
      logger.info(`✅ IMAP email reader connected to ${imapHost}:${imapPort}`)
      this.reconnectDelayMs = 30000
      this.consecutiveImapFailures = 0
      emailReaderStatus.consecutiveFailures = 0
      emailReaderStatus.reconnectDelayMs = this.reconnectDelayMs
      emailReaderStatus.lastFailureCategory = null

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

        this.scheduleReconnectWithCircuitBreaker(error)
      })
    } catch (error) {
      logger.error('❌ Failed to start email reader:', error)
      this.isRunning = false
      emailReaderStatus.running = false
      emailReaderStatus.lastError = (error as any)?.message || String(error)
      this.scheduleReconnectWithCircuitBreaker(error)
    } finally {
      this.isStarting = false
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
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.reconnectDelayMs = 30000
    this.consecutiveImapFailures = 0
    emailReaderStatus.consecutiveFailures = 0
    emailReaderStatus.reconnectDelayMs = this.reconnectDelayMs
    emailReaderStatus.lastFailureCategory = null
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
      this.attachImapEventHandlers(this.client)
      
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
          logger.info(`📧 [EMAIL WATCHER] Found ${messages.length} unread email(s) in inbox - processing...`)
        } else {
          // Log periodically that we're checking (every 6 checks = ~30 seconds with 5s polling)
          const checkCount = (this as any).checkCount || 0
          ;(this as any).checkCount = checkCount + 1
          if (checkCount % 6 === 0) {
            logger.info(`📧 [EMAIL WATCHER] Monitoring inbox... (no unread emails found, check #${checkCount})`)
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
              
              logger.info(`📧 [EMAIL WATCHER] Processing email #${seq}: Subject="${subject}", From="${sender}"`)
              
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
                  `✅ [EMAIL WATCHER] MATCH FOUND: Email subject matches job posting: "${subject}" -> Job: "${matchingJob.job_title}" at "${matchingJob.company_name}" (ID: ${matchingJob.job_posting_id})`
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
   * FLEXIBLE MATCHING:
   * - Accepts any email subject and tries to match against available jobs
   * - Matches on: job title, company name, or keywords from job title
   * - Priority: exact matches > title+company > title only > company only > keyword matches
   * - If multiple matches found, returns the best match or all matches for ambiguous cases
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
                jp.responsibilities,
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
                      jp.responsibilities,
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
      
      // Flexible matching: try multiple strategies
      // Priority scoring:
      // 10: Exact match "Job Title at Company Name"
      // 9: Subject starts with "Job Title at Company Name"
      // 8: Subject contains "Job Title at Company Name"
      // 7: Subject contains both title AND company (any order)
      // 6: Subject contains full job title (exact match)
      // 5: Subject contains full company name (exact match)
      // 4: Subject contains significant keywords from job title (3+ words)
      // 3: Subject contains partial job title (2+ words)
      // 2: Subject contains partial company name
      // 1: Subject contains single keyword from job title
      
      let bestMatch: any = null
      let bestMatchScore = 0
      const matchesByTitle: Record<string, any[]> = {}
      const matchesByCompany: Record<string, any[]> = {}
      const keywordMatches: any[] = []
      
      // Extract keywords from subject (words with 3+ characters)
      const subjectWords = normalizedSubject.split(/\s+/).filter(w => w.length >= 3)
      
      for (const job of allActiveJobs) {
        // Normalize job title and company name
        const normalizedJobTitle = job.job_title.toLowerCase().trim().replace(/\s+/g, ' ')
        const normalizedCompanyName = (job.company_name || '').toLowerCase().trim().replace(/\s+/g, ' ')

        if (!normalizedJobTitle) {
          continue
        }

        const subjectContainsTitle = normalizedSubject.includes(normalizedJobTitle)
        const subjectContainsCompany = normalizedCompanyName ? normalizedSubject.includes(normalizedCompanyName) : false
        const expectedSubject = `${normalizedJobTitle}${normalizedCompanyName ? ` at ${normalizedCompanyName}` : ''}`

        let matchScore = 0

        // 10: Exact match "Job Title at Company Name"
        if (normalizedSubject === expectedSubject) {
          matchScore = 10
          logger.info(`✅ EXACT MATCH (score 10): "${emailSubject}" exactly matches "${job.job_title}${normalizedCompanyName ? ` at ${job.company_name}` : ''}"`)
          return job
        }

        // 9: Subject starts with "Job Title at Company Name"
        if (normalizedSubject.startsWith(expectedSubject)) {
          matchScore = 9
          logger.info(`✅ PREFIX MATCH (score 9): "${emailSubject}" starts with "${job.job_title}${normalizedCompanyName ? ` at ${job.company_name}` : ''}"`)
        }
        // 8: Subject contains "Job Title at Company Name"
        else if (normalizedSubject.includes(expectedSubject)) {
          matchScore = 8
          logger.info(`✅ CONTAINS MATCH (score 8): "${emailSubject}" contains "${job.job_title}${normalizedCompanyName ? ` at ${job.company_name}` : ''}"`)
        }
        // 7: Subject contains both title AND company (any order)
        else if (subjectContainsTitle && subjectContainsCompany) {
          matchScore = 7
          logger.info(`✅ TITLE+COMPANY MATCH (score 7): "${emailSubject}" contains "${job.job_title}" and "${job.company_name}"`)
        }
        // 6: Subject contains full job title
        else if (subjectContainsTitle) {
          matchScore = 6
          if (!matchesByTitle[normalizedJobTitle]) {
            matchesByTitle[normalizedJobTitle] = []
          }
          matchesByTitle[normalizedJobTitle].push(job)
          logger.info(`✅ TITLE MATCH (score 6): "${emailSubject}" contains full job title "${job.job_title}"`)
        }
        // 5: Subject contains full company name
        else if (subjectContainsCompany && normalizedCompanyName) {
          matchScore = 5
          if (!matchesByCompany[normalizedCompanyName]) {
            matchesByCompany[normalizedCompanyName] = []
          }
          matchesByCompany[normalizedCompanyName].push(job)
          logger.info(`✅ COMPANY MATCH (score 5): "${emailSubject}" contains company name "${job.company_name}"`)
        }
        // 4-1: Keyword matching
        else {
          // Extract job title words (3+ characters)
          const jobTitleWords = normalizedJobTitle.split(/\s+/).filter(w => w.length >= 3)
          const matchingKeywords = subjectWords.filter(word => jobTitleWords.includes(word))
          
          if (matchingKeywords.length >= 3) {
            matchScore = 4
            logger.info(`✅ KEYWORD MATCH (score 4): "${emailSubject}" contains 3+ keywords from "${job.job_title}": ${matchingKeywords.join(', ')}`)
          } else if (matchingKeywords.length === 2) {
            matchScore = 3
            logger.info(`✅ PARTIAL KEYWORD MATCH (score 3): "${emailSubject}" contains 2 keywords from "${job.job_title}": ${matchingKeywords.join(', ')}`)
          } else if (matchingKeywords.length === 1 && jobTitleWords.length <= 3) {
            // Single keyword match only if job title is short (likely unique)
            matchScore = 1
            logger.info(`✅ SINGLE KEYWORD MATCH (score 1): "${emailSubject}" contains keyword "${matchingKeywords[0]}" from "${job.job_title}"`)
          }
          
          if (matchScore > 0) {
            keywordMatches.push({ job, score: matchScore, keywords: matchingKeywords })
          }
        }

        // Update best match if this score is higher
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore
          bestMatch = job
        }
      }
      
      // Return best match if score is high enough (>= 6 for title/company matches)
      if (bestMatch && bestMatchScore >= 6) {
        logger.info(`✅ BEST MATCH SELECTED (score ${bestMatchScore}): "${bestMatch.job_title}" at "${bestMatch.company_name}" (ID: ${bestMatch.job_posting_id})`)
        return bestMatch
      }

      // Handle title-only matches (multiple jobs with same title)
      const titleMatches = Object.values(matchesByTitle)
      if (titleMatches.length > 0) {
        const allTitleMatches = titleMatches.flat()
        if (allTitleMatches.length === 1) {
          logger.info(`✅ UNIQUE TITLE MATCH: "${emailSubject}" matched to "${allTitleMatches[0].job_title}" at "${allTitleMatches[0].company_name}"`)
          return allTitleMatches[0]
        } else {
          logger.info(`✅ MULTIPLE TITLE MATCHES: "${emailSubject}" matched "${allTitleMatches[0].job_title}" across ${allTitleMatches.length} job(s); will create applications for all.`)
          return allTitleMatches
        }
      }

      // Handle company-only matches (multiple jobs for same company)
      const companyMatches = Object.values(matchesByCompany)
      if (companyMatches.length > 0) {
        const allCompanyMatches = companyMatches.flat()
        if (allCompanyMatches.length === 1) {
          logger.info(`✅ UNIQUE COMPANY MATCH: "${emailSubject}" matched to company "${allCompanyMatches[0].company_name}" - job "${allCompanyMatches[0].job_title}"`)
          return allCompanyMatches[0]
        } else {
          // Return most recent job for this company
          const mostRecent = allCompanyMatches.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          logger.info(`✅ COMPANY MATCH (multiple jobs): "${emailSubject}" matched company "${mostRecent.company_name}" - using most recent job "${mostRecent.job_title}"`)
          return mostRecent
        }
      }

      // Handle keyword matches (best keyword match)
      if (keywordMatches.length > 0) {
        // Sort by score and number of keywords
        keywordMatches.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return b.keywords.length - a.keywords.length
        })
        const bestKeywordMatch = keywordMatches[0]
        if (bestKeywordMatch.score >= 3) {
          logger.info(`✅ BEST KEYWORD MATCH (score ${bestKeywordMatch.score}): "${emailSubject}" matched "${bestKeywordMatch.job.job_title}" at "${bestKeywordMatch.job.company_name}" via keywords: ${bestKeywordMatch.keywords.join(', ')}`)
          return bestKeywordMatch.job
        }
      }

      // No match found - log available jobs for reference
      logger.warn(`❌ NO MATCH: Subject "${emailSubject}" doesn't match any active job.`)
      if (allActiveJobs.length > 0) {
        logger.warn(`   Available jobs (${allActiveJobs.length}):`)
        allActiveJobs.slice(0, 10).forEach((j, idx) => {
          logger.warn(`     ${idx + 1}. "${j.job_title}" at "${j.company_name}" (Status: ${j.status || 'NULL'})`)
        })
        logger.warn(`   💡 TIP: Email subject will match if it contains job title, company name, or keywords from the job title.`)
      } else {
        logger.warn(`   ⚠️ No active jobs found in database`)
      }
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

      try {
        await this.emailService.sendInboundForwardEmail({
          recipients: [company.hr_email, company.company_email, company.hiring_manager_email].filter(Boolean) as string[],
          candidateName: senderName,
          candidateEmail: senderEmail,
          jobTitle: job.job_title,
          companyName: company.company_name,
          originalSubject: subject,
          resumeUrl: cvUrl
        })
      } catch (forwardErr) {
        logger.warn(`Failed to send inbound-forward notification for application ${application.application_id}:`, forwardErr)
      }

      // Process CV - this is where CV extraction is confirmed
      try {
        await this.processCandidateCV(application.application_id, cvBuffer, cvMimeType, job, company)
        logger.info(`CV successfully processed for application ${application.application_id}`)
      } catch (cvError) {
        logger.error(`Error processing CV for application ${application.application_id}:`, cvError)
        // CV extraction failed, return false to keep email unread
        return false
      }

      // HR notifications disabled - applications will appear on HR dashboard instead
      // No email notifications sent for individual applications
      logger.info(`📊 [EMAIL WATCHER] Application ${application.application_id} created - will appear on HR dashboard (no email notification sent)`)

      // Applicant count milestone notifications (5, 10, 50, 100, 200, 500, 1000, 2000)
      // These are still sent as they're summary notifications, not per-application
      try {
        const thresholds = [5, 10, 50, 100, 200, 500, 1000, 2000]
        const { rows: countRows } = await query<{ total: string }>(
          `SELECT COUNT(*) AS total FROM applications WHERE job_posting_id = $1`,
          [job.job_posting_id]
        )
        const total = parseInt(countRows[0]?.total || '0', 10)
        if (thresholds.includes(total)) {
          logger.info(`📊 [EMAIL WATCHER] Milestone reached: ${total} applications for job ${job.job_posting_id} - sending milestone notification`)
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
          `Failed to send milestone notification for application ${application.application_id} (continuing):`,
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

      logger.info(`📧 Processing email from ${senderEmail}: "${subject}"`)

      // Use the same matching logic as findJobByExactSubject for consistency
      const job = await this.findJobByExactSubject(subject)
      if (!job) {
        logger.warn(`❌ Could not match email subject to any job: "${subject}"`)
        // Log available jobs for debugging
        try {
          const { rows: availableJobs } = await query(
            `SELECT jp.job_title, jp.status, c.company_name, jp.created_at 
             FROM job_postings jp
             JOIN companies c ON c.company_id = jp.company_id
             WHERE (jp.status IS NULL OR UPPER(TRIM(jp.status)) = 'ACTIVE' OR jp.status = '')
             ORDER BY jp.created_at DESC
             LIMIT 10`
          )
          if (availableJobs.length > 0) {
            logger.warn(`   Available jobs (${availableJobs.length}):`)
            availableJobs.forEach((j, idx) => {
              logger.warn(`     ${idx + 1}. "${j.job_title}" at "${j.company_name}" (Status: ${j.status || 'NULL'})`)
            })
            logger.warn(`   💡 TIP: Email subject should match: "Job Title at Company Name"`)
            logger.warn(`      Example: "${availableJobs[0].job_title} at ${availableJobs[0].company_name}"`)
          } else {
            logger.warn(`   ⚠️ No active jobs found in database`)
          }
        } catch (dbErr) {
          logger.error(`   Error querying jobs for debug:`, dbErr)
        }
        return false
      }

      // Handle multiple matches (title-only ambiguous case)
      const jobsToProcess = Array.isArray(job) ? job : [job]
      logger.info(`✅ Matched ${jobsToProcess.length} job(s) for email subject: "${subject}"`)
        
      // Process each matched job
      let anyProcessed = false
      for (const matchingJob of jobsToProcess) {
        try {
          logger.info(`   Processing for job: "${matchingJob.job_title}" (ID: ${matchingJob.job_posting_id})`)
          
          // Get company info
          const { rows: companyRows } = await query(
            `SELECT company_id, company_name, company_email, hr_email, company_domain
             FROM companies WHERE company_id = $1`,
            [matchingJob.company_id]
          )
          if (companyRows.length === 0) {
            logger.warn(`   Company not found for job ${matchingJob.job_posting_id}`)
            continue
          }
          const company = companyRows[0]

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
                const savedPath = await saveFile(`cvs/${matchingJob.job_posting_id}_${Date.now()}_${filename}`, cvBuffer)
                cvUrl = savedPath
                logger.info(`   CV extracted and saved: ${filename} -> ${savedPath}`)
                break
              }
            }
          }

          // Check if CV was extracted
          if (!cvBuffer || !cvMimeType) {
            logger.warn(`   No CV attachment found in email from ${senderEmail} for job ${matchingJob.job_posting_id}`)
            // Still create application record but continue to next job
            await this.applicationRepo.create({
              job_posting_id: matchingJob.job_posting_id,
              company_id: company.company_id,
              candidate_name: senderName,
              email: senderEmail,
              resume_url: null
            })
            continue
          }

          // Create application record
          const application = await this.applicationRepo.create({
            job_posting_id: matchingJob.job_posting_id,
            company_id: company.company_id,
            candidate_name: senderName,
            email: senderEmail,
            resume_url: cvUrl
          })

          try {
            await this.emailService.sendInboundForwardEmail({
              recipients: [company.hr_email, company.company_email, company.hiring_manager_email].filter(Boolean) as string[],
              candidateName: senderName,
              candidateEmail: senderEmail,
              jobTitle: matchingJob.job_title,
              companyName: company.company_name,
              originalSubject: subject,
              resumeUrl: cvUrl
            })
          } catch (forwardErr) {
            logger.warn(`Failed to send inbound-forward notification for application ${application.application_id}:`, forwardErr)
          }

          // Process CV - this is where CV extraction is confirmed
          try {
            await this.processCandidateCV(application.application_id, cvBuffer, cvMimeType, matchingJob, company)
            logger.info(`   CV successfully processed for application ${application.application_id}`)
            anyProcessed = true
          } catch (cvError) {
            logger.error(`   Error processing CV for application ${application.application_id}:`, cvError)
            // Continue to next job
            continue
          }

          // HR notifications disabled - applications will appear on HR dashboard instead
          // No email notifications sent for individual applications
          logger.info(`📊 [EMAIL WATCHER] Application ${application.application_id} created - will appear on HR dashboard (no email notification sent)`)

          logger.info(`   ✅ Successfully processed application from ${senderEmail} for job ${matchingJob.job_posting_id}`)
        } catch (jobError) {
          logger.error(`   Error processing job ${matchingJob.job_posting_id}:`, jobError)
          continue
        }
      }

      return anyProcessed // Return true if at least one job was successfully processed
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

      const candidateLinks = this.normalizeCandidateLinks(parsed)
      const linkInsights = await this.scanCandidateLinks(candidateLinks)

      // Score candidate (aligned with new input format - includes company details)
      const scoringResult = await this.aiScoring.scoreCandidate({
        job: {
          title: job.job_title,
          description: job.job_description,
          responsibilities: job.responsibilities || '',
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
        cvText: parsed.textContent, // Full CV text - no truncation before passing to AI
        candidateEvidence: {
          linkedin: parsed.linkedin,
          github: parsed.github,
          other_links: parsed.other_links || [],
          link_insights: linkInsights
        }
      })

      // Map status: FLAGGED -> FLAG, REJECTED -> REJECT (to match database enum)
      const dbStatus = scoringResult.status === 'FLAGGED' ? 'FLAG' : 
                       scoringResult.status === 'REJECTED' ? 'REJECT' : 
                       scoringResult.status
      if (scoringResult.audit) {
        logger.info('AI fairness audit (email reader scoring)', {
          applicationId,
          jobPostingId: job.job_posting_id,
          ...scoringResult.audit,
        })
      }
      
      // Update application with score
      await this.applicationRepo.updateScoring({
        application_id: applicationId,
        ai_score: scoringResult.score,
        ai_status: dbStatus as 'SHORTLIST' | 'FLAG' | 'REJECT',
        reasoning: scoringResult.reasoning,
        parsed_resume_json: parsedResumeJson
      })

      // Send shortlist or rejection email to candidate after 5 second delay
      const application = await this.applicationRepo.findById(applicationId)
      if (application) {
        const companyData = await this.companyRepo.findById(company.company_id)
        
        // Determine email type based on scoring result status (before DB mapping)
        const shouldSendShortlist = scoringResult.status === 'SHORTLIST'
        const shouldSendReject = scoringResult.status === 'REJECTED'
        
        logger.info(`📊 Email sending decision for application ${applicationId}: status="${scoringResult.status}", score=${scoringResult.score}, shouldSendShortlist=${shouldSendShortlist}, shouldSendReject=${shouldSendReject}`)
        
        // Send email immediately (no delay) for instant feedback
        if (shouldSendShortlist || shouldSendReject) {
          logger.info(`📧 [EMAIL WATCHER] Sending feedback email immediately for application ${applicationId} (${application.email})`)
          
          // Use setImmediate to send asynchronously without blocking, but immediately
          setImmediate(async () => {
            try {
              if (shouldSendShortlist) {
                logger.info(`📧 [EMAIL WATCHER] Sending shortlist email to ${application.email} for application ${applicationId} (Job: ${job.job_title} at ${company.company_name})`)
                await this.emailService.sendShortlistEmail({
                  candidateEmail: application.email,
                  candidateName: application.candidate_name || 'Candidate',
                  jobTitle: job.job_title,
                  companyName: companyData?.company_name || company.company_name,
                  companyEmail: companyData?.company_email || company.company_email,
                  companyDomain: companyData?.company_domain || company.company_domain
                  // No interview link/date/time: HR sends those when they use the Schedule button
                })
                logger.info(`✅ [EMAIL WATCHER] Shortlist email sent successfully to ${application.email} for application ${applicationId}`)
              } else if (shouldSendReject) {
                logger.info(`📧 [EMAIL WATCHER] Sending rejection email to ${application.email} for application ${applicationId} (Job: ${job.job_title} at ${company.company_name})`)
                await this.emailService.sendRejectionEmail({
                  candidateEmail: application.email,
                  candidateName: application.candidate_name || 'Candidate',
                  jobTitle: job.job_title,
                  companyName: companyData?.company_name || company.company_name,
                  companyEmail: companyData?.company_email || company.company_email,
                  companyDomain: companyData?.company_domain || company.company_domain
                })
                logger.info(`✅ [EMAIL WATCHER] Rejection email sent successfully to ${application.email} for application ${applicationId}`)
              }
            } catch (emailError: any) {
              // SMTP/network issues should NOT block analysis, but log extensively
              const errorMsg = emailError?.message || String(emailError)
              const errorStack = emailError?.stack || 'No stack trace'
              logger.error(`❌ [EMAIL WATCHER] Failed to send candidate decision email for application ${applicationId}:`, {
                error: errorMsg,
                stack: errorStack,
                candidateEmail: application.email,
                jobTitle: job.job_title,
                companyName: company.company_name,
                status: scoringResult.status,
                score: scoringResult.score,
                shouldSendShortlist,
                shouldSendReject
              })
              logger.error(`   Full error object:`, emailError)
              
              // Log to console for immediate visibility
              console.error(`\n❌ [EMAIL WATCHER] EMAIL SENDING FAILED:`)
              console.error(`   Application ID: ${applicationId}`)
              console.error(`   Candidate: ${application.email}`)
              console.error(`   Status: ${scoringResult.status}`)
              console.error(`   Error: ${errorMsg}`)
              console.error(`   Stack: ${errorStack}\n`)
            }
          })
        } else {
          logger.info(`ℹ️ [EMAIL WATCHER] No email sent for application ${applicationId} - status is "${scoringResult.status}" (FLAG status requires manual review)`)
        }

        if (shouldSendShortlist) {
          setImmediate(() => {
            void this.autoScheduleInterviewForShortlist(job, company, application).catch((err) => {
              logger.warn(`[EMAIL WATCHER] Auto interview scheduling skipped/failed (non-fatal):`, err)
            })
          })
        }
      } else {
        logger.warn(`⚠️ [EMAIL WATCHER] Application ${applicationId} not found after scoring - cannot send email`)
      }

      setImmediate(() => {
        void this.sendPipelineDigestEmail(job, company, applicationId, scoringResult, dbStatus).catch((err) => {
          logger.warn(`[EMAIL WATCHER] Pipeline digest email failed (non-fatal):`, err)
        })
      })

      logger.info(`✅ [EMAIL WATCHER] Processed CV for application ${applicationId}, score: ${scoringResult.score}, status: ${scoringResult.status} (DB status: ${dbStatus}), candidate: ${application?.email || 'unknown'}`)
  }

  /**
   * Optional automation: when a candidate is shortlisted by the watcher, create/sync an interview slot
   * and notify both candidate + employer contacts with the meeting link.
   */
  private async autoScheduleInterviewForShortlist(job: any, company: any, application: any) {
    if (process.env.ENABLE_AUTO_SCHEDULE_INTERVIEW !== 'true') {
      return
    }
    if (!application?.application_id || !application?.email) {
      return
    }

    // Do not overwrite if an interview is already scheduled.
    if (application.interview_link || application.interview_time) {
      return
    }

    const offsetHours = Number(process.env.AUTO_INTERVIEW_OFFSET_HOURS || 48)
    const interviewStart = new Date(Date.now() + Math.max(1, offsetHours) * 60 * 60 * 1000)
    const interviewEnd = new Date(interviewStart.getTime() + 60 * 60 * 1000)

    let meetingLink: string | null = job.meeting_link || null
    if (!meetingLink) {
      const calendarService = new GoogleCalendarService()
      if (calendarService.isEnabled()) {
        try {
          const attendees = [application.email, company.hr_email, company.hiring_manager_email].filter(Boolean) as string[]
          const created = await calendarService.createMeetEvent({
            summary: `${company.company_name || 'Interview'} interview with ${application.candidate_name || application.email}`,
            description: `Interview for ${job.job_title} at ${company.company_name || 'your company'}`,
            start: interviewStart.toISOString(),
            end: interviewEnd.toISOString(),
            attendees,
          })
          meetingLink = created.meetingLink
        } catch (err) {
          logger.warn(`[EMAIL WATCHER] Google Meet creation failed during auto schedule:`, err)
        }
      }
    }
    if (!meetingLink) return

    const updated = await this.applicationRepo.scheduleInterview({
      application_id: application.application_id,
      interview_time: interviewStart.toISOString(),
      interview_link: meetingLink,
    })

    const cleanedJobTitle = cleanJobTitle(job.job_title || 'the role')
    const companyName = company.company_name || 'your company'
    const interviewDate = interviewStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const interviewTime = interviewStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

    const companyEmail = this.emailService.getCompanyEmail(
      company.company_email,
      company.company_domain,
      company.company_name
    )
    const hrEmail = company.company_email || company.hr_email || 'applicationsoptiohire@gmail.com'
    const candidateName = application.candidate_name || application.email.split('@')[0] || 'Candidate'

    await this.emailService.sendEmail({
      to: application.email,
      from: companyEmail,
      subject: `Interview Scheduled – ${cleanedJobTitle} at ${companyName}`,
      html: `<p>Dear ${candidateName},</p>
<p>You have been shortlisted for <strong>${cleanedJobTitle}</strong> at <strong>${companyName}</strong>.</p>
<p><strong>Interview Details</strong><br/>
Date: ${interviewDate}<br/>
Time: ${interviewTime}<br/>
Meeting Link: <a href="${meetingLink}">${meetingLink}</a></p>
<p>If this time does not work, please reply to <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>`,
      text: `Dear ${candidateName},

You have been shortlisted for ${cleanedJobTitle} at ${companyName}.

Interview details:
Date: ${interviewDate}
Time: ${interviewTime}
Meeting Link: ${meetingLink}

If this time does not work, please reply to ${hrEmail}.`,
      emailType: 'auto_interview_candidate',
    })

    const employerRecipients = [company.hr_email, company.company_email, company.hiring_manager_email].filter(Boolean) as string[]
    for (const recipient of employerRecipients) {
      await this.emailService.sendEmail({
        to: recipient,
        from: companyEmail,
        subject: `Auto interview scheduled – ${candidateName} for ${cleanedJobTitle}`,
        html: `<p>An interview was auto-scheduled by the email watcher.</p>
<p><strong>Candidate:</strong> ${candidateName} (${application.email})<br/>
<strong>Role:</strong> ${cleanedJobTitle}<br/>
<strong>Date:</strong> ${interviewDate}<br/>
<strong>Time:</strong> ${interviewTime}<br/>
<strong>Meeting:</strong> <a href="${meetingLink}">${meetingLink}</a></p>`,
        text: `An interview was auto-scheduled by the email watcher.

Candidate: ${candidateName} (${application.email})
Role: ${cleanedJobTitle}
Date: ${interviewDate}
Time: ${interviewTime}
Meeting: ${meetingLink}`,
        emailType: 'auto_interview_employer',
      })
    }

    logger.info(`[EMAIL WATCHER] Auto interview scheduled for shortlisted candidate`, {
      applicationId: updated.application_id,
      interviewTime: updated.interview_time,
      interviewLink: updated.interview_link,
    })
  }

  /**
   * Internal watcher (developer@optiohire.com by default) + employer: ranking, best pick, meeting/dashboard links.
   */
  private async sendPipelineDigestEmail(
    job: any,
    company: any,
    applicationId: string,
    scoringResult: { score: number; status: string; reasoning: string },
    dbStatus: string
  ) {
    if (process.env.ENABLE_WATCHER_PIPELINE_DIGEST === 'false') {
      return
    }

    const raw = process.env.WATCHER_DIGEST_EMAIL || 'developer@optiohire.com'
    const watcherList = raw.split(/[,;]+/).map((s) => s.trim()).filter(Boolean)

    const seen = new Set<string>()
    const recipients: string[] = []
    for (const e of [
      ...watcherList,
      company.hr_email,
      company.company_email,
      company.hiring_manager_email,
    ]) {
      if (!e || typeof e !== 'string') continue
      const t = e.trim()
      const k = t.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      recipients.push(t)
    }
    if (recipients.length === 0) return

    const appUrl = (process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(
      /\/$/,
      ''
    )
    const dashboardShortlistedUrl = `${appUrl}/dashboard/job/${job.job_posting_id}/shortlisted`

    const { rows } = await query<{
      candidate_name: string | null
      email: string
      ai_score: number | null
      ai_status: string | null
    }>(
      `SELECT candidate_name, email, ai_score, ai_status
       FROM applications
       WHERE job_posting_id = $1
       ORDER BY
         CASE COALESCE(UPPER(TRIM(ai_status)), '')
           WHEN 'SHORTLIST' THEN 1
           WHEN 'FLAG' THEN 2
           WHEN 'REJECT' THEN 3
           ELSE 4
         END,
         ai_score DESC NULLS LAST,
         created_at ASC
       LIMIT 12`,
      [job.job_posting_id]
    )

    if (rows.length === 0) return

    const rankedRows = rows.map((r, i) => ({
      rank: i + 1,
      name: r.candidate_name || r.email.split('@')[0] || 'Candidate',
      email: r.email,
      score: r.ai_score,
      status: (r.ai_status || '—').toString(),
    }))

    const norm = (s: string | null) => (s || '').toUpperCase().trim()
    const firstShortlist = rows.find((r) => norm(r.ai_status) === 'SHORTLIST')
    const bestRow = firstShortlist || rows[0]
    const bestPick = {
      name: bestRow.candidate_name || bestRow.email.split('@')[0] || 'Candidate',
      email: bestRow.email,
      score: bestRow.ai_score,
      status: (bestRow.ai_status || '—').toString(),
      explanation: firstShortlist
        ? `Top Shortlist candidate for this role (AI score ${firstShortlist.ai_score ?? '—'}/100). Shortlist means strong fit to the job description and required skills (typically 80–100).`
        : `Leading candidate by review order: status ${bestRow.ai_status || '—'}, score ${bestRow.ai_score ?? '—'}. No Shortlist yet—review Flagged applicants or keep collecting applications.`,
    }

    const application = await this.applicationRepo.findById(applicationId)
    const reasoning = scoringResult.reasoning || ''
    const latestCandidate = {
      name: application?.candidate_name || application?.email?.split('@')[0] || 'Candidate',
      email: application?.email || '',
      score: scoringResult.score,
      status: dbStatus,
      reasoningPreview: reasoning.length > 400 ? `${reasoning.slice(0, 400)}…` : reasoning,
    }

    await this.emailService.sendWatcherPipelineDigest({
      recipients,
      jobPostingId: String(job.job_posting_id),
      jobTitle: job.job_title,
      companyName: company.company_name,
      meetingLink: job.meeting_link || null,
      dashboardShortlistedUrl,
      latestCandidate,
      rankedRows,
      bestPick,
    })
  }
}

let emailReaderSingleton: EmailReader | null = null

/**
 * Start the IMAP watcher after storage is ready (call from server bootstrap).
 * Pipeline: inbox → attachments → CV parsed to structured JSON → AI scoring (fairness-aware) → DB → shortlist/reject emails.
 */
export async function startEmailReader(): Promise<void> {
  if (process.env.ENABLE_EMAIL_READER === 'false') {
    emailReaderStatus.enabled = false
    emailReaderStatus.disabledReason = 'Email reader disabled via ENABLE_EMAIL_READER=false'
    emailReaderStatus.running = false
    logger.info(emailReaderStatus.disabledReason)
    return
  }

  if (!emailReaderSingleton) {
    emailReaderSingleton = new EmailReader()
  }

  try {
    await emailReaderSingleton.start()
  } catch (err: any) {
    logger.error('Failed to start email reader:', err)
    emailReaderStatus.lastError = err?.message || String(err)
  }
}
