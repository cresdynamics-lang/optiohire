import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'

/**
 * Mailtrap Email Service
 * Uses Mailtrap API (HTTPS) for reliable email delivery and testing
 */
export class MailtrapService {
  private apiToken: string
  private fromEmail: string
  private fromName: string
  private logFile: string

  constructor() {
    this.apiToken = process.env.MAILTRAP_API_TOKEN || ''
    this.fromEmail = process.env.MAILTRAP_FROM_EMAIL || 'noreply@optiohire.com'
    this.fromName = process.env.MAILTRAP_FROM_NAME || 'OptioHire'

    if (!this.apiToken) {
      logger.warn('Mailtrap API token not configured. Set MAILTRAP_API_TOKEN in .env')
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
   * Send email using Mailtrap API
   */
  async sendEmail(data: {
    to: string
    subject: string
    html: string
    text: string
    from?: string
    fromName?: string
  }): Promise<void> {
    if (!this.apiToken) {
      throw new Error('Mailtrap API token not configured. Set MAILTRAP_API_TOKEN in .env')
    }

    try {
      const fromEmail = data.from || this.fromEmail
      const fromName = data.fromName || this.fromName

      // Mailtrap API endpoint for sending
      const url = 'https://send.api.mailtrap.io/api/send'

      const payload = {
        from: {
          email: fromEmail,
          name: fromName
        },
        to: [
          {
            email: data.to
          }
        ],
        subject: data.subject,
        html: data.html,
        text: data.text
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Mailtrap API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json() as any
      if (result.success === false) {
        throw new Error(`Mailtrap API error: ${JSON.stringify(result.errors)}`)
      }

      logger.info(`Email sent via Mailtrap to ${data.to}: ${data.subject}`)
      await this.logEmail(data.to, data.subject, 'sent', 'via Mailtrap')
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error(`Failed to send email via Mailtrap to ${data.to}:`, error)
      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      throw error
    }
  }

  /**
   * Verify Mailtrap API token
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.apiToken) return false
    try {
      // Testing token by listing domains or some other simple GET request
      const response = await fetch('https://send.api.mailtrap.io/api/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      })
      return response.ok
    } catch (error) {
      return false
    }
  }
}
