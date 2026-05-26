import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { emailParserService } from '../services/emailParserService.js';
import { ApplicationRepository } from '../repositories/applicationRepository.js';
import { aiQueue } from '../queues/aiQueue.js';
import { saveFile } from '../utils/storage.js';
import { randomUUID } from 'crypto';
import { ResendService } from '../services/resendService.js';

export const router = Router();
const applicationRepo = new ApplicationRepository();
const resendService = new ResendService();

router.post('/resend', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Guard: Verify it's an email.received event
    if (payload.type !== 'email.received') {
      logger.info(`[WEBHOOK] Received non-email.received event: ${payload.type}`);
      return res.status(200).json({ received: true });
    }

    const emailId = payload.data.email_id;
    if (!emailId) {
      logger.error('[WEBHOOK] No email_id found in payload data');
      return res.status(400).json({ error: 'No email_id in payload' });
    }

    logger.info(`[WEBHOOK] Processing received email: ${emailId}`);

    // Fetch full email content and attachments
    const emailData = await resendService.getEmail(emailId);
    if (!emailData) {
      logger.error(`[WEBHOOK] Could not fetch email data for ID: ${emailId}`);
      return res.status(404).json({ error: 'Email data not found' });
    }

    const subject = emailData.subject || 'No Subject';
    const from = emailData.from; // "Sender Name <sender@domain.com>"
    const htmlContent = emailData.html;
    const textContent = emailData.text;

    logger.info(`[WEBHOOK] Received email from ${from} with subject: ${subject}`);

    // Extract email address and name
    const emailMatch = from.match(/<([^>]+)>/);
    const candidateEmail = emailMatch ? emailMatch[1] : from;
    const candidateName = from.split('<')[0].trim();

    // Guard: Strict literal match the subject to a job posting
    const jobId = await emailParserService.matchSubjectToJob(subject);
    if (!jobId) {
      logger.warn(`[WEBHOOK] No job matched for subject: ${subject}`);
      return res.status(200).json({ received: true, ignored: 'no_job_match' });
    }

    // Download/Save message contents
    let emailContentUrl = null;
    const content = htmlContent || textContent;
    if (content) {
      const contentBuffer = Buffer.from(content);
      const contentFileName = `emails/${emailId}.${htmlContent ? 'html' : 'txt'}`;
      emailContentUrl = await saveFile(contentFileName, contentBuffer);
      logger.info(`[WEBHOOK] Saved email content to: ${emailContentUrl}`);
    }

    // Process attachments using the Receiving API
    let resumeUrl = null;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

    try {
      const attachments = await resendService.getAttachments(emailId);
      logger.info(`[WEBHOOK] Found ${attachments.length} attachments for email ${emailId}`);

      for (const attachment of attachments) {
        const filename = (attachment.filename || `attachment-${randomUUID()}`).toLowerCase();
        const downloadUrl = attachment.download_url;

        // Guard: Check file type
        if (!ALLOWED_EXTENSIONS.some(ext => filename.endsWith(ext))) {
          logger.info(`[WEBHOOK] Skipping attachment ${filename}: Not a PDF or Word document.`);
          continue;
        }

        // Guard: Check download URL
        if (!downloadUrl) {
          logger.warn(`[WEBHOOK] Attachment ${filename} had no download_url.`);
          continue;
        }

        try {
          // Guard: Check size before downloading (HEAD request)
          const fileSize = await getRemoteFileSize(downloadUrl);
          if (fileSize > MAX_FILE_SIZE) {
            logger.warn(`[WEBHOOK] Skipping attachment ${filename}: Size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit.`);
            continue;
          }

          const response = await fetch(downloadUrl);
          if (!response.ok) {
            logger.error(`[WEBHOOK] Failed to download attachment ${filename} from ${downloadUrl}`);
            continue;
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          
          // Guard: Check actual buffer size
          if (buffer.length > MAX_FILE_SIZE) {
            logger.warn(`[WEBHOOK] Skipping attachment ${filename}: Actual buffer size exceeds 5MB limit.`);
            continue;
          }

          const fileExt = filename.split('.').pop();
          const storageFileName = `attachments/${emailId}/${randomUUID()}.${fileExt}`;
          const savedUrl = await saveFile(storageFileName, buffer);

          // Link first valid attachment as the primary resume
          if (!resumeUrl) {
            resumeUrl = savedUrl;
            logger.info(`[WEBHOOK] Saved resume: ${filename} -> ${resumeUrl}`);
          } else {
            logger.info(`[WEBHOOK] Saved extra attachment: ${filename} -> ${savedUrl}`);
          }
        } catch (downloadError) {
          logger.error(`[WEBHOOK] Error downloading attachment ${filename}:`, downloadError);
        }
      }
    } catch (attachmentError) {
      logger.error(`[WEBHOOK] Error listing attachments for email ${emailId}:`, attachmentError);
    }

    // Create the application in the database
    const { query } = await import('../db/index.js');
    const { rows: jobs } = await query('SELECT company_id FROM job_postings WHERE job_posting_id = $1', [jobId]);
    const companyId = jobs[0]?.company_id;

    // Guard: Verify company exists
    if (!companyId) {
      logger.error(`[WEBHOOK] Company not found for matched job ID: ${jobId}`);
      return res.status(404).json({ error: 'Company not found for matched job.' });
    }

    const application = await applicationRepo.create({
      job_posting_id: jobId,
      company_id: companyId,
      candidate_name: candidateName,
      email: candidateEmail,
      resume_url: resumeUrl
    });

    logger.info(`[WEBHOOK] Application created: ${application.application_id}. Enqueueing for AI processing...`);

    // Add to BullMQ for the Watcher Engine to score
    await aiQueue.add('score_application', {
      applicationId: application.application_id,
      jobPostingId: jobId,
      candidateName: candidateName,
      email: candidateEmail,
      resumeUrl: resumeUrl,
      emailId: emailId,
      emailContentUrl: emailContentUrl
    });

    return res.status(200).json({ success: true, application_id: application.application_id });

  } catch (error) {
    logger.error('[WEBHOOK] Error processing Resend webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Helper to get the size of a remote file via HEAD request
 */
async function getRemoteFileSize(url: string): Promise<number> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  } catch (err) {
    return 0;
  }
}
