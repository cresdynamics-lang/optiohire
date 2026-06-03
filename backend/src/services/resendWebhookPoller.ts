import { query } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { resendInboundService } from './inboundEmailService.js';
import { ResendService } from './resendService.js';

export class ResendWebhookPoller {
  private isPolling = false;
  private resendService = new ResendService();

  constructor() {}

  /**
   * Main polling logic. 
   * Now designed to be called by BullMQ Maintenance Worker.
   */
  async poll() {
    if (this.isPolling) {
      logger.debug('[ResendPoller] Poll already in progress, skipping...');
      return;
    }
    
    logger.info('[ResendPoller] Starting inbound email poll via BullMQ...');
    this.isPolling = true;

    try {
      // 1. Verify connection if first time or check needed
      const isConfigured = await this.resendService.verifyConnection().catch(() => false);
      if (!isConfigured) {
        logger.warn('[ResendPoller] Resend service not properly configured, skipping poll');
        return;
      }

      // 2. Poll the Inbound Receiving API using ResendService
      const emails = await this.resendService.listReceivedEmails();
      if (!emails || emails.length === 0) {
        logger.info('[ResendPoller] No new inbound emails found');
        return;
      }

      logger.info(`[ResendPoller] Processing ${emails.length} inbound emails`);

      for (const email of emails) {
        const emailId = email.id;
        
        const isProcessed = await this.checkIfDeliveryProcessed(emailId);
        if (isProcessed) {
          logger.debug(`[ResendPoller] Email ${emailId} already processed, skipping`);
          continue;
        }

        logger.info(`[ResendPoller] Found unprocessed inbound email: ${emailId}`);
        logger.info(`[ResendPoller] Email details: From=${email.from}, Subject=${email.subject}`);
        
        // Construct a mock webhook payload that ResendInboundService expects
        const mockPayload = {
          type: 'email.received',
          data: {
            email_id: emailId,
            from: email.from,
            to: email.to,
            subject: email.subject,
            created_at: email.created_at
          }
        };

        logger.info(`[ResendPoller] Processing email ${emailId} with mock payload:`, JSON.stringify(mockPayload, null, 2));

        const result = await resendInboundService.processEmailReceivedEvent(mockPayload);
        
        if (result.success || result.ignored) {
          await this.markDeliveryProcessed(emailId);
        }
      }
    } catch (error: any) {
      // Only log errors that are not common transient ones
      const msg = error?.message || String(error);
      if (!msg.includes('fetch failed') && !msg.includes('ETIMEDOUT')) {
        logger.error('[ResendPoller] Error during polling:', error);
      }
    } finally {
      this.isPolling = false;
    }
  }

  private async checkIfDeliveryProcessed(deliveryId: string): Promise<boolean> {
    const { rows } = await query('SELECT id FROM processed_webhook_deliveries WHERE delivery_id = $1', [deliveryId]);
    return rows.length > 0;
  }

  private async markDeliveryProcessed(deliveryId: string): Promise<void> {
    await query('INSERT INTO processed_webhook_deliveries (delivery_id) VALUES ($1) ON CONFLICT DO NOTHING', [deliveryId]);
  }
}

export const resendWebhookPoller = new ResendWebhookPoller();
