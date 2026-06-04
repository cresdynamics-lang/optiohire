import { Resend } from 'resend'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'

// Global queue to respect Resend's 5 req/sec rate limit
let emailQueuePromise = Promise.resolve()

function enqueueEmailTask<T>(task: () => Promise<T>, delayMs: number = 250): Promise<T> {
  return new Promise((resolve, reject) => {
    emailQueuePromise = emailQueuePromise.then(async () => {
      try {
        const result = await task()
        resolve(result)
      } catch (err) {
        reject(err)
      }
      // Wait for the rate limit delay before allowing the next task (4 requests per second)
      await new Promise(r => setTimeout(r, delayMs))
    })
  })
}

/**
 * Resend Email Service
 * Uses Resend API for reliable email delivery with domain verification
 */
export class ResendService {
  private resendPrimary: Resend | null = null
  private resendSecondary: Resend | null = null
  private resendFallback: Resend | null = null
  private apiKeyPrimary: string
  private apiKeySecondary: string
  private apiKeyFallback: string
  private fromEmail: string
  private fromName: string
  private logFile: string

  constructor() {
    // Primary key - for all notifications and email sending
    this.apiKeyPrimary = process.env.RESEND_API_KEY || ''
    // Secondary key - for notifications like "thanks for joining"
    this.apiKeySecondary = process.env.RESEND_API_KEY_SECONDARY || ''
    // Fallback key - if primary/secondary fail or get rate limited
    this.apiKeyFallback = process.env.RESEND_API_KEY_FALLBACK || ''
    
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
    this.fromName = process.env.RESEND_FROM_NAME || 'OptioHire'

    // Initialize Resend clients
    if (this.apiKeyPrimary) {
      this.resendPrimary = new Resend(this.apiKeyPrimary)
      logger.info('Resend primary API key initialized')
    }
    if (this.apiKeySecondary) {
      this.resendSecondary = new Resend(this.apiKeySecondary)
      logger.info('Resend secondary API key initialized')
    }
    if (this.apiKeyFallback) {
      this.resendFallback = new Resend(this.apiKeyFallback)
      logger.info('Resend fallback API key initialized')
    }

    if (!this.apiKeyPrimary && !this.apiKeySecondary && !this.apiKeyFallback) {
      logger.warn('No Resend API keys configured. Set RESEND_API_KEY in .env')
      logger.warn('Get your API key from: https://resend.com/api-keys')
    } else {
      logger.info(`Resend email service initialized with ${[this.resendPrimary, this.resendSecondary, this.resendFallback].filter(Boolean).length} API key(s)`)
    }

    // Setup email log file
    this.logFile = path.join(process.cwd(), 'logs', 'email.log')
    this.ensureLogDirectory()
  }

  private async ensureLogDirectory() {
    try {
      const logDir = path.dirname(this.logFile)
      await fs.mkdir(logDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  private async logEmail(to: string, subject: string, status: 'sent' | 'failed', error?: string) {
    try {
      const logEntry = `${new Date().toISOString()} | ${status.toUpperCase()} | To: ${to} | Subject: ${subject}${error ? ` | Error: ${error}` : ''}\n`
      await fs.appendFile(this.logFile, logEntry)
    } catch (error) {
      logger.error('Failed to write email log:', error)
    }
  }


  /**
   * Send email using Resend API with fallback support
   * @param data Email data
   * @param useSecondary If true, use secondary key for notifications (like "thanks for joining")
   */
  async sendEmail(data: {
    to: string
    subject: string
    html: string
    text: string
    from?: string
    fromName?: string
    replyTo?: string
  }, useSecondary: boolean = false): Promise<void> {
    return enqueueEmailTask(async () => {
      const fromEmail = data.from || this.fromEmail
      const fromName = data.fromName || this.fromName
      
      // Determine which Resend client to use
      // Priority: useSecondary ? secondary > primary > fallback : primary > secondary > fallback
      const clients = useSecondary 
        ? [this.resendSecondary, this.resendPrimary, this.resendFallback]
        : [this.resendPrimary, this.resendSecondary, this.resendFallback]
      
      const clientNames = useSecondary
        ? ['secondary', 'primary', 'fallback']
        : ['primary', 'secondary', 'fallback']

      let lastError: Error | null = null

      // Try each client in order until one succeeds
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i]
        const clientName = clientNames[i]
        
        if (!client) {
          continue // Skip if this client is not configured
        }

        try {
          logger.debug(`Attempting to send email via Resend ${clientName} key`)
          
          const toArray = data.to.includes(',') 
            ? data.to.split(',').map(e => e.trim()).filter(Boolean)
            : data.to

          const result = await client.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: toArray,
            subject: data.subject,
            html: data.html,
            text: data.text,
            replyTo: data.replyTo,
          })

          if (result.error) {
            throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
          }

          logger.info(`Email sent via Resend ${clientName} to ${data.to}: ${data.subject} (ID: ${result.data?.id})`)
          await this.logEmail(data.to, data.subject, 'sent', `via ${clientName}`)
          return // Success - exit function
        } catch (error: any) {
          const errorMsg = error?.message || String(error)
          lastError = error
          logger.warn(`Resend ${clientName} failed: ${errorMsg}`)
          
          // Check if it's a rate limit or quota error - try next client
          if (errorMsg.includes('rate limit') || errorMsg.includes('quota') || errorMsg.includes('429')) {
            logger.info(`Rate limit/quota exceeded on ${clientName}, trying next key...`)
            continue
          }
          
          // For other errors, also try next client
          if (i < clients.length - 1) {
            logger.info(`Trying next Resend API key...`)
            continue
          }
        }
      }

      // All clients failed
      const errorMsg = lastError?.message || 'All Resend API keys failed'
      logger.error('Failed to send email via Resend (all keys exhausted)', { to: data.to, error: errorMsg })
      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      throw new Error(`Resend email failed: ${errorMsg}`)
    }, 250)
  }

  /**
   * Verify Resend API key and domain
   */
  async verifyConnection(): Promise<boolean> {
    const diagnostics = await this.getDiagnostics()
    return diagnostics.atLeastOneWorking
  }

  /**
   * Collect diagnostics about API key validity and verified domains.
   */
  async getDiagnostics(): Promise<{ atLeastOneWorking: boolean; hasVerifiedDomain: boolean; workingKeys: string[]; verifiedDomainCount: number }> {
    const clients = [
      { name: 'primary', client: this.resendPrimary },
      { name: 'secondary', client: this.resendSecondary },
      { name: 'fallback', client: this.resendFallback }
    ].filter(c => c.client !== null)

    if (clients.length === 0) {
      logger.error('No Resend API keys configured')
      return {
        atLeastOneWorking: false,
        hasVerifiedDomain: false,
        workingKeys: [],
        verifiedDomainCount: 0
      }
    }

    let atLeastOneWorking = false
    let hasVerifiedDomain = false
    let verifiedDomainCount = 0
    const workingKeys: string[] = []

    for (const { name, client } of clients) {
      try {
        const domainsResponse = await client!.domains.list()
        let domainsList: any[] = []
        if (Array.isArray(domainsResponse.data)) {
          domainsList = domainsResponse.data
        } else if (domainsResponse.data && typeof domainsResponse.data === 'object' && Array.isArray((domainsResponse.data as any).data)) {
          domainsList = (domainsResponse.data as any).data
        }
        logger.info(`Resend ${name} API key verified. Found ${domainsList.length} verified domain(s)`)
        
        if (domainsList.length > 0) {
          domainsList.forEach((domain: any) => {
            logger.info(`  - Domain: ${domain.name} (Status: ${domain.status})`)
            if (domain.status === 'verified') {
              hasVerifiedDomain = true
              verifiedDomainCount += 1
            }
          })
        } else {
          logger.warn(`Resend ${name}: No domains found. Please verify your domain in Resend dashboard: https://resend.com/domains`)
        }
        
        atLeastOneWorking = true
        workingKeys.push(name)
      } catch (error: any) {
        logger.error(`Resend ${name} API connection test failed: ${error.message}`)
      }
    }

    return {
      atLeastOneWorking,
      hasVerifiedDomain,
      workingKeys,
      verifiedDomainCount
    }
  }

  /**
   * Get domain verification status (uses primary key)
   */
  async getDomainStatus(domainName?: string): Promise<any> {
    const client = this.resendPrimary || this.resendSecondary || this.resendFallback
    if (!client) {
      throw new Error('No Resend API keys configured')
    }

    try {
      const domain = domainName || process.env.RESEND_DOMAIN
      if (!domain) {
        throw new Error('Domain name not provided and RESEND_DOMAIN not set')
      }

      const domainInfo = await client.domains.get(domain)
      return domainInfo
    } catch (error: any) {
      logger.error(`Failed to get domain status: ${error.message}`)
      throw error
    }
  }

  /**
   * List all domains (uses primary key)
   */
  async listDomains(): Promise<any[]> {
    const client = this.resendPrimary || this.resendSecondary || this.resendFallback
    if (!client) {
      throw new Error('No Resend API keys configured')
    }

    try {
      const domainsResponse = await client.domains.list()
      if (Array.isArray(domainsResponse.data)) {
        return domainsResponse.data
      } else if (domainsResponse.data && typeof domainsResponse.data === 'object' && Array.isArray((domainsResponse.data as any).data)) {
        return (domainsResponse.data as any).data
      }
      return []
    } catch (error: any) {
      logger.error(`Failed to list domains: ${error.message}`)
      throw error
    }
  }

  /**
   * List all received emails (Inbound Receiving API)
   */
  async listReceivedEmails(): Promise<any[]> {
    const client = this.resendPrimary || this.resendSecondary || this.resendFallback
    if (!client) {
      throw new Error('No Resend API keys configured')
    }

    try {
      logger.info('[ResendAPI] Fetching received emails list...')
      const result = await (client.emails as any).receiving.list()
      if (result.error) {
        logger.error('[ResendAPI] Error fetching emails list:', { error: result.error })
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
      }
      
      const emails = result.data?.data || []
      logger.info(`[ResendAPI] Successfully fetched ${emails.length} emails from Resend`)
      return emails
    } catch (error: any) {
      logger.error('Failed to list received emails:', { error })
      throw error
    }
  }

  /**
   * Get email details by ID (Inbound Receiving API)
   */
  async getEmail(emailId: string): Promise<any> {
    const client = this.resendPrimary || this.resendSecondary || this.resendFallback
    if (!client) {
      throw new Error('No Resend API keys configured')
    }

    try {
      logger.info(`[ResendAPI] Fetching email details for ID: ${emailId}...`)
      // Use the receiving API for inbound emails
      const result = await (client.emails as any).receiving.get(emailId)
      if (result.error) {
        logger.error(`[ResendAPI] Error fetching email details for ${emailId}:`, { error: result.error })
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
      }
      logger.info(`[ResendAPI] Successfully fetched details for email: ${emailId}`)
      return result.data
    } catch (error: any) {
      logger.error(`Failed to get inbound email ${emailId}:`, { error })
      throw error
    }
  }

  /**
   * Get email attachments (Inbound Receiving API)
   */
  async getAttachments(emailId: string): Promise<any[]> {
    const client = this.resendPrimary || this.resendSecondary || this.resendFallback
    if (!client) {
      throw new Error('No Resend API keys configured')
    }

    try {
      logger.info(`[ResendAPI] Fetching attachments for email ID: ${emailId}...`)
      const result = await (client.emails as any).receiving.attachments.list({ emailId })
      if (result.error) {
        logger.error(`[ResendAPI] Error fetching attachments for ${emailId}:`, { error: result.error })
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`)
      }
      const attachments = Array.isArray(result.data) ? result.data : (result.data?.data || [])
      logger.info(`[ResendAPI] Successfully fetched ${attachments.length} attachments for email: ${emailId}`)
      return attachments
    } catch (error: any) {
      logger.error(`Failed to list attachments for email ${emailId}:`, { error })
      throw error
    }
  }
}

