import { Resend } from 'resend'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'

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
    
    this.fromEmail = process.env.RESEND_FROM_EMAIL || (process.env.RESEND_DOMAIN 
      ? `noreply@${process.env.RESEND_DOMAIN}` 
      : 'nelsonochieng516@gmail.com')
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
        
        const result = await client.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: data.to,
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
    logger.error(`Failed to send email via Resend (all keys exhausted) to ${data.to}:`, errorMsg)
    await this.logEmail(data.to, data.subject, 'failed', errorMsg)
    throw new Error(`Resend email failed: ${errorMsg}`)
  }

  /**
   * Verify Resend API key and domain
   */
  async verifyConnection(): Promise<boolean> {
    const clients = [
      { name: 'primary', client: this.resendPrimary },
      { name: 'secondary', client: this.resendSecondary },
      { name: 'fallback', client: this.resendFallback }
    ].filter(c => c.client !== null)

    if (clients.length === 0) {
      logger.error('No Resend API keys configured')
      return false
    }

    let atLeastOneWorking = false

    for (const { name, client } of clients) {
      try {
        const domainsResponse = await client!.domains.list()
        const domainsList = Array.isArray(domainsResponse.data) ? domainsResponse.data : []
        logger.info(`Resend ${name} API key verified. Found ${domainsList.length} verified domain(s)`)
        
        if (domainsList.length > 0) {
          domainsList.forEach((domain: any) => {
            logger.info(`  - Domain: ${domain.name} (Status: ${domain.status})`)
          })
        } else {
          logger.warn(`Resend ${name}: No domains found. Please verify your domain in Resend dashboard: https://resend.com/domains`)
        }
        
        atLeastOneWorking = true
      } catch (error: any) {
        logger.error(`Resend ${name} API connection test failed: ${error.message}`)
      }
    }
    
    return atLeastOneWorking
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
      return Array.isArray(domainsResponse.data) ? domainsResponse.data : []
    } catch (error: any) {
      logger.error(`Failed to list domains: ${error.message}`)
      throw error
    }
  }
}

