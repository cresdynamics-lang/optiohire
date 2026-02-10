import { logger } from '../utils/logger.js'
import https from 'https'
import http from 'http'

interface WebhookPayload {
  event: string
  timestamp: string
  data: any
}

interface WebhookConfig {
  url: string
  secret?: string
  timeout?: number
}

/**
 * Webhook Service
 * Sends webhooks to external systems for events
 */
export class WebhookService {
  private configs: Map<string, WebhookConfig[]> = new Map()

  /**
   * Register webhook URL for an event type
   */
  registerWebhook(eventType: string, config: WebhookConfig) {
    if (!this.configs.has(eventType)) {
      this.configs.set(eventType, [])
    }
    this.configs.get(eventType)!.push(config)
  }

  /**
   * Send webhook for an event
   */
  async sendWebhook(eventType: string, data: any): Promise<void> {
    const configs = this.configs.get(eventType) || []
    
    if (configs.length === 0) {
      logger.debug(`No webhooks registered for event: ${eventType}`)
      return
    }

    const payload: WebhookPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data
    }

    // Send to all registered webhooks in parallel
    await Promise.allSettled(
      configs.map(config => this.sendToWebhook(config, payload))
    )
  }

  /**
   * Send webhook to a specific URL
   */
  private async sendToWebhook(config: WebhookConfig, payload: WebhookPayload): Promise<void> {
    const url = new URL(config.url)
    const isHttps = url.protocol === 'https:'
    const client = isHttps ? https : http
    const timeout = config.timeout || 10000 // 10 second default timeout

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(payload)
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(config.secret && {
            'X-Webhook-Secret': config.secret,
            'X-Webhook-Signature': this.signPayload(postData, config.secret)
          })
        },
        timeout
      }

      const req = client.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            logger.debug(`Webhook sent successfully to ${config.url}`, {
              event: payload.event,
              statusCode: res.statusCode
            })
            resolve()
          } else {
            logger.warn(`Webhook failed: ${config.url}`, {
              event: payload.event,
              statusCode: res.statusCode,
              response: responseData.substring(0, 200)
            })
            reject(new Error(`Webhook failed with status ${res.statusCode}`))
          }
        })
      })

      req.on('error', (error) => {
        logger.error(`Webhook request error: ${config.url}`, {
          event: payload.event,
          error: error.message
        })
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        logger.warn(`Webhook timeout: ${config.url}`, {
          event: payload.event,
          timeout
        })
        reject(new Error('Webhook request timeout'))
      })

      req.write(postData)
      req.end()
    })
  }

  /**
   * Sign webhook payload (simple HMAC)
   */
  private signPayload(payload: string, secret: string): string {
    const crypto = require('crypto')
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }
}

// Singleton instance
let webhookService: WebhookService | null = null

export function getWebhookService(): WebhookService {
  if (!webhookService) {
    webhookService = new WebhookService()
    
    // Load webhook configs from environment
    const webhookUrl = process.env.WEBHOOK_URL
    const webhookSecret = process.env.WEBHOOK_SECRET
    
    if (webhookUrl) {
      // Register default webhook for all events
      webhookService.registerWebhook('*', {
        url: webhookUrl,
        secret: webhookSecret,
        timeout: 10000
      })
    }
  }
  return webhookService
}

// Event types
export const WebhookEvents = {
  CANDIDATE_APPLIED: 'candidate.applied',
  CANDIDATE_SCORED: 'candidate.scored',
  CANDIDATE_SHORTLISTED: 'candidate.shortlisted',
  CANDIDATE_REJECTED: 'candidate.rejected',
  JOB_CREATED: 'job.created',
  JOB_CLOSED: 'job.closed',
  REPORT_GENERATED: 'report.generated',
  INTERVIEW_SCHEDULED: 'interview.scheduled'
} as const
