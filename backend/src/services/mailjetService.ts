import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'

/**
 * Mailjet Email Service
 * Uses Mailjet API (HTTPS) for reliable email delivery
 */
export class MailjetService {
  private apiKey: string
  private apiSecret: string
  private fromEmail: string
  private fromName: string
  private logFile: string

  constructor() {
    this.apiKey = process.env.MAILJET_API_KEY || ''
    this.apiSecret = process.env.MAILJET_API_SECRET || ''
    this.fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@optiohire.com'
    this.fromName = process.env.MAILJET_FROM_NAME || 'OptioHire'

    if (!this.apiKey || !this.apiSecret) {
      logger.warn('Mailjet API credentials not configured. Set MAILJET_API_KEY and MAILJET_API_SECRET in .env')
    }

    // Setup email log file
    this.logFile = path.join(process.cwd(), 'logs', 'email.log')
    this.ensureLogDirectory()
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }

  private async logEmail(to: string, subject: string, status: 'sent' | 'failed', error?: string) {
    try {
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] ${status.toUpperCase()} | To: ${to} | Subject: ${subject}${error ? ` | Error: ${error}` : ''}\n`
      await fs.appendFile(this.logFile, logEntry)
    } catch (error) {
      logger.error('Failed to write email log:', error)
    }
  }

  /**
   * Send email using Mailjet API v3.1
   */
  async sendEmail(data: {
    to: string
    subject: string
    html: string
    text: string
    from?: string
    fromName?: string
  }): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Mailjet API credentials not configured')
    }

    try {
      const fromEmail = data.from || this.fromEmail
      const fromName = data.fromName || this.fromName

      // Mailjet API endpoint for sending
      const url = 'https://api.mailjet.com/v3.1/send'

      const payload = {
        Messages: [
          {
            From: {
              Email: fromEmail,
              Name: fromName
            },
            To: [
              {
                Email: data.to,
                Name: ''
              }
            ],
            Subject: data.subject,
            TextPart: data.text,
            HTMLPart: data.html
          }
        ]
      }

      // Mailjet uses Basic Auth (API Key : API Secret)
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mailjet API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json() as any
      if (result.Messages && result.Messages[0].Status !== 'success') {
        throw new Error(`Mailjet API error: ${JSON.stringify(result.Messages[0].Errors)}`)
      }

      logger.info(`Email sent via Mailjet to ${data.to}: ${data.subject}`)
      await this.logEmail(data.to, data.subject, 'sent', 'via Mailjet')
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error(`Failed to send email via Mailjet to ${data.to}:`, error)
      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      throw error
    }
  }

  /**
   * Verify Mailjet API credentials
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.apiKey || !this.apiSecret) return false
    try {
      const auth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      const response = await fetch('https://api.mailjet.com/v3/REST/sender', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}
