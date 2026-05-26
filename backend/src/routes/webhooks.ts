import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { emailParserService } from '../services/emailParserService.js';
import { ApplicationRepository } from '../repositories/applicationRepository.js';
import { aiQueue } from '../queues/aiQueue.js';
import { saveFile } from '../utils/storage.js';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';

export const router = Router();
const applicationRepo = new ApplicationRepository();

router.post('/resend', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Verify it's an email.received event
    if (payload.type !== 'email.received') {
      return res.status(200).json({ received: true });
    }

    const emailData = payload.data;
    const subject = emailData.subject;
    const from = emailData.from; // "Sender Name <sender@domain.com>"
    const attachments = emailData.attachments || [];

    logger.info(`[WEBHOOK] Received email from ${from} with subject: ${subject}`);

    // Extract email address and name
    const emailMatch = from.match(/<([^>]+)>/);
    const candidateEmail = emailMatch ? emailMatch[1] : from;
    const candidateName = from.split('<')[0].trim();

    // Fuzzy match the subject to a job posting
    const jobId = await emailParserService.matchSubjectToJob(subject);

    if (!jobId) {
      logger.warn(`[WEBHOOK] No job matched for subject: ${subject}`);
      // Send fallback rejection or ignore
      return res.status(200).json({ received: true, ignored: 'no_job_match' });
    }

    // Process attachments
    let resumeUrl = null;
    if (attachments.length > 0) {
      // Find a PDF or DOCX
      const resumeFile = attachments.find((att: any) => 
        att.filename.toLowerCase().endsWith('.pdf') || 
        att.filename.toLowerCase().endsWith('.docx')
      );

      if (resumeFile) {
        logger.info(`[WEBHOOK] Found attachment: ${resumeFile.filename}`);
        
        // Attachment could be an S3 URL provided by Resend, or base64
        // Usually, Resend webhook provides a URL to download it or raw base64.
        // Assuming base64 for 'content' field per Resend API docs.
        if (resumeFile.content) {
            const buffer = Buffer.from(resumeFile.content, 'base64');
            const fileExt = resumeFile.filename.split('.').pop();
            const fileName = `cvs/${randomUUID()}.${fileExt}`;
            await saveFile(fileName, buffer);
            resumeUrl = fileName;
        } else {
            logger.warn(`[WEBHOOK] Attachment ${resumeFile.filename} had no content field.`);
        }
      }
    }

    // Create the application in the database
    // Note: We need company_id. In a real system, we might query job_postings to get company_id first.
    const { query } = await import('../db/index.js');
    const { rows: jobs } = await query('SELECT company_id FROM job_postings WHERE job_posting_id = $1', [jobId]);
    const companyId = jobs[0]?.company_id;

    if (!companyId) {
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
      resumeUrl: resumeUrl
    });

    return res.status(200).json({ success: true, application_id: application.application_id });

  } catch (error) {
    logger.error('[WEBHOOK] Error processing Resend webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
