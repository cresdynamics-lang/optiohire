import { Resend } from 'resend'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'

/**
 * Resend Email Service
 * Uses Resend API for reliable email delivery with domain verification
 */
export class ResendService {
  private resend: Resend | null = null
  private apiKey: string
  private fromEmail: string
  private fromName: string
  private logFile: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ''
    this.fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_DOMAIN 
      ? `noreply@${process.env.RESEND_DOMAIN}` 
      : 'noreply@optiohire.com'
    this.fromName = process.env.RESEND_FROM_NAME || 'OptioHire'

    if (!this.apiKey) {
      logger.warn('Resend API key not configured. Set RESEND_API_KEY in .env')
      logger.warn('Get your API key from: https://resend.com/api-keys')
    } else {
      this.resend = new Resend(this.apiKey)
      logger.info('Resend email service initialized')
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
   * Send email using Resend API
   */
  async sendEmail(data: {
    to: string
    subject: string
    html: string
    text: string
    from?: string
    fromName?: string
    replyTo?: string
  }): Promise<void> {
    if (!this.resend) {
      throw new Error('Resend API key not configured. Set RESEND_API_KEY in .env')
    }

    try {
      const fromEmail = data.from || this.fromEmail
      const fromName = data.fromName || this.fromName

      const result = await this.resend.emails.send({
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

      logger.info(`Email sent via Resend to ${data.to}: ${data.subject} (ID: ${result.data?.id})`)
      await this.logEmail(data.to, data.subject, 'sent')
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error(`Failed to send email via Resend to ${data.to}:`, errorMsg)
      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      throw error
    }
  }

  /**
   * Verify Resend API key and domain
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.resend) {
      logger.error('Resend API key not configured')
      return false
    }

    try {
      // Verify API key by checking domains
      const domainsResponse = await this.resend.domains.list()
      const domainsList = Array.isArray(domainsResponse.data) ? domainsResponse.data : []
      logger.info(`Resend API key verified. Found ${domainsList.length} verified domain(s)`)
      
      if (domainsList.length > 0) {
        domainsList.forEach((domain: any) => {
          logger.info(`  - Domain: ${domain.name} (Status: ${domain.status})`)
        })
      } else {
        logger.warn('No domains found. Please verify your domain in Resend dashboard: https://resend.com/domains')
      }
      
      return true
    } catch (error: any) {
      logger.error(`Resend API connection test failed: ${error.message}`)
      return false
    }
  }

  /**
   * Get domain verification status
   */
  async getDomainStatus(domainName?: string): Promise<any> {
    if (!this.resend) {
      throw new Error('Resend API key not configured')
    }

    try {
      const domain = domainName || process.env.RESEND_DOMAIN
      if (!domain) {
        throw new Error('Domain name not provided and RESEND_DOMAIN not set')
      }

      const domainInfo = await this.resend.domains.get(domain)
      return domainInfo
    } catch (error: any) {
      logger.error(`Failed to get domain status: ${error.message}`)
      throw error
    }
  }

  /**
   * List all domains
   */
  async listDomains(): Promise<any[]> {
    if (!this.resend) {
      throw new Error('Resend API key not configured')
    }

    try {
      const domainsResponse = await this.resend.domains.list()
      return Array.isArray(domainsResponse.data) ? domainsResponse.data : []
    } catch (error: any) {
      logger.error(`Failed to list domains: ${error.message}`)
      throw error
    }
  }
}

