import { Worker, Job } from 'bullmq'
import { redisConnection, isRedisEnabled } from '../queues/connection.js'
import { AI_QUEUE_NAME } from '../queues/aiQueue.js'
import { logger } from '../utils/logger.js'
import { query } from '../db/index.js'
import { ApplicationRepository } from '../repositories/applicationRepository.js'
import { CVParser } from '../lib/cv-parser.js'
import { AIScoringEngine } from '../lib/ai-scoring.js'
import { EmailService } from '../services/emailService.js'
import { ContributionService } from '../services/contributionService.js'
import { healthMonitor } from '../utils/healthMonitor.js'
import path from 'path'

const applicationRepo = new ApplicationRepository()
const cvParser = new CVParser()
const aiScoring = new AIScoringEngine()
const emailService = new EmailService()
const contributionService = new ContributionService()

export class AIWorker {
  private worker: Worker

  constructor() {
    this.worker = new Worker(
      AI_QUEUE_NAME,
      async (job: Job) => {
        const taskKey = `worker.ai.${job.name.replace(/-/g, '.')}`;
        logger.info(`🤖 [AI-WORKER] Picking up job: ${job.name} (${taskKey}) for Application: ${job.data.applicationId}`)
        try {
          await healthMonitor.updateStatus(taskKey, 'running', null, { lastJobId: job.id });
          await this.processJob(job)
          await healthMonitor.updateStatus(taskKey, 'idle', null, { lastCompletedJobId: job.id });
        } catch (error: any) {
          logger.error(`❌ Worker Job Failed (#${job.id}):`, error)
          await healthMonitor.updateStatus(taskKey, 'error', error.message, { lastFailedJobId: job.id });
          throw error // Let BullMQ handle retries
        }
      },
      {
        connection: redisConnection,
        concurrency: 5
      }
    )

    this.worker.on('failed', async (job, err) => {
      const taskKey = job ? `worker.ai.${job.name.replace(/-/g, '.')}` : 'worker.ai.unknown';
      logger.error(`❌ Job #${job?.id} failed:`, { message: err.message })
      await healthMonitor.updateStatus(taskKey, 'error', err.message, { lastFailedJobId: job?.id });
    })
  }

  private async processJob(job: Job) {
    const { applicationId } = job.data
    if (!applicationId) {
      logger.warn('⚠️ No applicationId found in job data')
      return
    }

    const application = await this.fetchApplication(applicationId)
    if (!application) {
      logger.warn(`⚠️ Application not found in DB: ${applicationId}`)
      return
    }

    const jobPosting = await this.fetchJobPosting(application.job_posting_id)
    if (!jobPosting) {
      logger.warn(`⚠️ Job posting not found for application: ${applicationId}`)
      return
    }

    const company = await this.fetchCompany(jobPosting.company_id)
    if (!company) {
      logger.warn(`⚠️ Company not found for job: ${jobPosting.job_posting_id}`)
      return
    }

    let cvText = ''
    let parsedJson = null
    let technicalInsights: any[] = []

    if (application.resume_url) {
      logger.info(`📄 Parsing resume for application: ${applicationId}`)
      const cvResult = await this.parseResume(application.resume_url)
      if (cvResult) {
        cvText = cvResult.textContent
        parsedJson = cvResult
        
        // Scan discovered links for technical contributions (GitHub, etc.)
        const allLinks = [
          cvResult.linkedin,
          cvResult.github,
          ...(cvResult.other_links || [])
        ].filter(Boolean) as string[]
        
        if (allLinks.length > 0) {
          logger.info(`🔍 Scanning ${allLinks.length} links for technical insights for application: ${applicationId}`)
          technicalInsights = await contributionService.scanLinks(allLinks)
        }

        await applicationRepo.updateParsedResume({
          application_id: applicationId,
          parsed_resume_json: {
            ...cvResult,
            technical_insights: technicalInsights
          }
        })
      }
    } else {
      logger.warn(`⚠️ No resume URL for application: ${applicationId}`)
    }

    logger.info(`🧠 Scoring candidate for application: ${applicationId}`)
    const aiResult = await this.scoreCandidate(cvText, jobPosting, company, parsedJson, technicalInsights)
    if (!aiResult) {
      logger.error(`❌ AI scoring returned no result for application: ${applicationId}`)
      return
    }

    logger.info(`✅ Score: ${aiResult.score}, Status: ${aiResult.status} for application: ${applicationId}`)

    const status = this.mapAIStatus(aiResult.status)
    await applicationRepo.updateScoring({
      application_id: applicationId,
      ai_score: aiResult.score,
      ai_status: status as any,
      reasoning: aiResult.reasoning,
      parsed_resume_json: parsedJson,
      embedding: aiResult.embedding,
      ai_audit_log: aiResult.audit
    })

    logger.info(`📧 Sending outcome emails for application: ${applicationId}`)
    await this.sendOutcomeEmails(application, jobPosting, company, aiResult, status)
  }

  private async fetchApplication(applicationId: string) {
    const app = await applicationRepo.findById(applicationId)
    if (!app) {
      logger.warn(`⚠️ Application not found: ${applicationId}`)
    }
    return app
  }

  private async fetchJobPosting(jobPostingId: string) {
    const { rows } = await query('SELECT * FROM job_postings WHERE job_posting_id = $1', [jobPostingId])
    if (rows.length === 0) {
      logger.warn(`⚠️ Job posting not found: ${jobPostingId}`)
      return null
    }
    return rows[0]
  }

  private async fetchCompany(companyId: string) {
    const { rows } = await query('SELECT * FROM companies WHERE company_id = $1', [companyId])
    if (rows.length === 0) {
      logger.warn(`⚠️ Company not found: ${companyId}`)
      return null
    }
    return rows[0]
  }

  private async parseResume(resumeUrl: string) {
    try {
      let buffer: Buffer;
      let mime = resumeUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      if (resumeUrl.startsWith('http://') || resumeUrl.startsWith('https://')) {
        logger.info(`🌐 Fetching remote resume: ${resumeUrl}`);
        const response = await fetch(resumeUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch remote resume: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        // In a real scenario, we'd fetch the file from storage/S3
        // For now, we assume local file access for simplicity if resumeUrl is a path
        const fullPath = path.join(process.cwd(), 'storage', resumeUrl.replace(/^cvs\//, 'cvs/'))
        const fs = await import('fs/promises')
        buffer = await fs.readFile(fullPath)
      }
      
      return await cvParser.parseCVBuffer(buffer, mime)
    } catch (error) {
      logger.error('❌ Resume Parsing Failed:', error)
      return null
    }
  }

  private async scoreCandidate(cvText: string, job: any, company: any, parsedResume: any, technicalInsights: any[] = []) {
    try {
      return await aiScoring.scoreCandidate({
        job: {
          title: job.job_title,
          description: job.job_description,
          responsibilities: job.responsibilities || '',
          required_skills: job.required_skills || []
        },
        company: {
          company_name: company.company_name,
          company_domain: company.company_domain,
          company_email: company.company_email,
          hr_email: company.hr_email,
          hiring_manager_email: company.hiring_manager_email,
          settings: company.settings
        },
        cvText,
        candidateEvidence: {
          linkedin: parsedResume?.linkedin,
          github: parsedResume?.github,
          other_links: parsedResume?.other_links || [],
          link_insights: technicalInsights
        }
      })
    } catch (error) {
      logger.error('❌ AI Scoring Failed:', error)
      return null
    }
  }

  private mapAIStatus(status: string): string {
    if (status === 'FLAGGED') return 'FLAG'
    if (status === 'REJECTED') return 'REJECT'
    return status
  }

  private async sendOutcomeEmails(app: any, job: any, company: any, aiResult: any, mappedStatus: string) {
    const emailArgs = {
      candidateEmail: app.email,
      candidateName: app.candidate_name,
      jobTitle: job.job_title,
      companyName: company.company_name,
      companyId: company.company_id,
      companyEmail: company.company_email,
      companyDomain: company.company_domain
    }

    try {
      if (aiResult.status === 'SHORTLIST') {
        await emailService.sendShortlistEmail(emailArgs)
      } else if (aiResult.status === 'REJECTED') {
        await emailService.sendRejectionEmail(emailArgs)
      } else if (aiResult.status === 'FLAGGED') {
        await emailService.sendFlagReviewEmail(emailArgs)
      }

      // Send digest to HR
      await this.sendHRDigest(job, company, app.application_id, aiResult, mappedStatus)
    } catch (error) {
      logger.error('❌ Email Sending Failed:', error)
    }
  }

  private async sendHRDigest(job: any, company: any, applicationId: string, aiResult: any, mappedStatus: string) {
    if (process.env.ENABLE_WATCHER_PIPELINE_DIGEST === 'false') return

    const { rows } = await query(
      'SELECT candidate_name, email, ai_score, ai_status FROM applications WHERE job_posting_id = $1 ORDER BY ai_score DESC NULLS LAST LIMIT 12',
      [job.job_posting_id]
    )
    if (rows.length === 0) return

    const recipients = [...new Set([
      process.env.WATCHER_DIGEST_EMAIL || 'developer@optiohire.com',
      company.hr_email,
      company.company_email
    ].filter(Boolean) as string[])]

    await emailService.sendWatcherPipelineDigest({
      recipients,
      jobPostingId: String(job.job_posting_id),
      jobTitle: job.job_title,
      companyName: company.company_name,
      meetingLink: job.meeting_link,
      dashboardShortlistedUrl: `${process.env.FRONTEND_URL}/dashboard/job/${job.job_posting_id}/shortlisted`,
      latestCandidate: {
        name: rows[0].candidate_name || 'Candidate',
        email: rows[0].email,
        score: aiResult.score,
        status: mappedStatus,
        reasoningPreview: aiResult.reasoning.slice(0, 400)
      },
      rankedRows: rows.map((r, i) => ({
        rank: i + 1,
        name: r.candidate_name || 'Candidate',
        email: r.email,
        score: r.ai_score,
        status: String(r.ai_status || '')
      })),
      bestPick: {
        name: rows[0].candidate_name || 'Candidate',
        email: rows[0].email,
        score: rows[0].ai_score,
        status: String(rows[0].ai_status || ''),
        explanation: 'Top pick'
      }
    })
  }
}
