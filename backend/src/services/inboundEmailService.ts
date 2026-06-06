import { query as defaultQuery } from '../db/index.js';
import { logger } from '../utils/logger.js';
import { ResendService } from './resendService.js';
import { emailParserService } from './emailParserService.js';
import { ApplicationRepository } from '../repositories/applicationRepository.js';
import { aiQueue } from '../queues/aiQueue.js';
import { saveFile } from '../utils/storage.js';
import { randomUUID } from 'crypto';
import { provisionCandidateAccount } from './candidateProvisioningService.js';
import { EmailService } from './emailService.js';

const emailService = new EmailService();

const defaultResendService = new ResendService();

export class ResendInboundService {
  private query: typeof defaultQuery;
  private resendService: ResendService;

  constructor(queryFn = defaultQuery, resendService = defaultResendService) {
    this.query = queryFn;
    this.resendService = resendService;
  }

  /**
   * Processes a Resend "email.received" event payload.
   * This is idempotent based on the emailId.
   */
  async processEmailReceivedEvent(payload: any): Promise<{ success: boolean; application_id?: string; ignored?: string; error?: string }> {
    try {
      if (payload.type !== 'email.received') {
        logger.debug(`[ResendInbound] Ignored non-email.received event: ${payload.type}`);
        return { success: true, ignored: 'wrong_event_type' };
      }

      const emailId = payload.data?.email_id;
      if (!emailId) {
        logger.error('[ResendInbound] No email_id found in payload data');
        return { success: false, error: 'No email_id in payload' };
      }

      // Check if already processed as an application (using external_id)
      const { rows: existing } = await this.query<{ application_id: string }>('SELECT application_id FROM applications WHERE external_id = $1', [emailId]);
      if (existing.length > 0) {
        logger.info(`[ResendInbound] Email ${emailId} already processed as application ${existing[0].application_id}`);
        return { success: true, application_id: existing[0].application_id };
      }

      logger.info(`[ResendInbound] Processing received email: ${emailId}`);

      // Fetch full email content and attachments
      const emailData = await this.resendService.getEmail(emailId);
      if (!emailData) {
        logger.error(`[ResendInbound] Could not fetch email data for ID: ${emailId}`);
        return { success: false, error: 'Email data not found' };
      }

      const subject = emailData.subject || 'No Subject';
      const from = emailData.from; // "Sender Name <sender@domain.com>"
      const htmlContent = emailData.html;
      const textContent = emailData.text;

      logger.info(`[ResendInbound] Received email from ${from} with subject: ${subject}`);

      // Extract email address and name
      const emailMatch = from.match(/<([^>]+)>/);
      const candidateEmail = emailMatch ? emailMatch[1] : from;
      const candidateName = from.split('<')[0].trim();

      // Match the subject to a job posting
      const jobId = await emailParserService.matchSubjectToJob(subject);
      if (!jobId) {
        logger.warn(`[ResendInbound] No job matched for subject: ${subject}`);
        return { success: true, ignored: 'no_job_match' };
      }

      // Download/Save message contents
      let emailContentUrl = null;
      const content = htmlContent || textContent;
      if (content) {
        const contentBuffer = Buffer.from(content);
        const contentFileName = `emails/${emailId}.${htmlContent ? 'html' : 'txt'}`;
        emailContentUrl = await saveFile(contentFileName, contentBuffer);
      }

      // Process attachments
      let resumeUrl = null;
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

      try {
        const attachments = await this.resendService.getAttachments(emailId);
        for (const attachment of attachments) {
          const filename = (attachment.filename || `attachment-${randomUUID()}`).toLowerCase();
          const downloadUrl = attachment.download_url;

          if (!ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext))) continue;
          if (!downloadUrl) continue;

          try {
            const response = await fetch(downloadUrl);
            if (!response.ok) continue;

            const buffer = Buffer.from(await response.arrayBuffer());
            if (buffer.length > MAX_FILE_SIZE) continue;

            const fileExt = filename.split('.').pop();
            const storageFileName = `attachments/${emailId}/${randomUUID()}.${fileExt}`;
            const savedUrl = await saveFile(storageFileName, buffer);

            if (!resumeUrl) resumeUrl = savedUrl;
          } catch (err) {
            logger.error(`[ResendInbound] Error downloading attachment ${filename}:`, err);
          }
        }
      } catch (err) {
        logger.error(`[ResendInbound] Error listing attachments for email ${emailId}:`, err);
      }

      // Get company ID and job details
      const { rows: jobs } = await this.query<{ company_id: string, job_title: string, company_name: string }>(
        `SELECT jp.company_id, jp.job_title, c.company_name 
         FROM job_postings jp
         LEFT JOIN companies c ON jp.company_id = c.company_id
         WHERE jp.job_posting_id = $1`, 
        [jobId]
      );
      const companyId = jobs[0]?.company_id;
      const jobTitle = jobs[0]?.job_title;
      const companyName = jobs[0]?.company_name;

      if (!companyId) {
        logger.error(`[ResendInbound] Company not found for matched job ID: ${jobId}`);
        return { success: false, error: 'Company not found' };
      }

      // Create the application (using external_id for idempotency)
      const { rows: applicationRows } = await this.query<{ application_id: string }>(
        `INSERT INTO applications (
          job_posting_id, company_id, candidate_name, email, resume_url, external_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (external_id) DO UPDATE SET
          candidate_name = EXCLUDED.candidate_name,
          resume_url = EXCLUDED.resume_url
        RETURNING application_id`,
        [jobId, companyId, candidateName, candidateEmail, resumeUrl, emailId]
      );

      const application = applicationRows[0];

      logger.info(`[ResendInbound] Application created: ${application?.application_id}. Enqueueing for AI processing...`);

      // Provision candidate account and send the welcome email
      if (application) {
        try {
          const provisioned = await provisionCandidateAccount({ email: candidateEmail.toLowerCase(), candidateName: candidateName });
          const frontendUrl = process.env.FRONTEND_URL || 'https://optiohire.com';
          
          await emailService.sendCandidateApplicationReceivedEmail({
            candidateEmail: candidateEmail.toLowerCase(),
            candidateName: candidateName,
            jobTitle: jobTitle || 'Job Position',
            companyName: companyName || 'OptioHire',
            candidateLoginUrl: `${frontendUrl}/auth/signin`,
            candidateTemporaryPassword: provisioned.temporaryPassword,
            isNewCandidateAccount: provisioned.isNewAccount
          });
          logger.info(`[ResendInbound] Sent Application Received email to ${candidateEmail}`);
        } catch (err) {
          logger.warn(`[ResendInbound] Failed to send candidate application email: ${err}`);
        }
      }

      // Add to BullMQ
      if (application) {
        await aiQueue.add('score_application', {
          applicationId: application.application_id,
          jobPostingId: jobId,
          candidateName: candidateName,
          email: candidateEmail,
          resumeUrl: resumeUrl,
          emailId: emailId,
          emailContentUrl: emailContentUrl
        });
      }

      return { success: true, application_id: application?.application_id };
    } catch (error) {
      logger.error('[ResendInbound] Error processing Resend inbound email:', error);
      return { success: false, error: 'Internal error' };
    }
  }
}

export const resendInboundService = new ResendInboundService();
