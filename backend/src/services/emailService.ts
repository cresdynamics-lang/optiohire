import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { SendGridService } from './sendGridService.js'
import { ResendService } from './resendService.js'
import { MailtrapService } from './mailtrapService.js'
import { MailjetService } from './mailjetService.js'
import { RollingWindow } from '../utils/rollingWindow.js'
import { APPLICATION_INBOX_EMAIL, getRecommendedApplicationSubject } from '../config/applicationInbox.js'
import { query } from '../db/index.js'
import { parseTemplate } from '../utils/templateParser.js'

/** Default from address for candidate emails and fallback when company email is not set */
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
const DEFAULT_FROM_NAME = process.env.RESEND_FROM_NAME || 'OptioHire'
const MAX_EMAIL_RETRY_ATTEMPTS = Number(process.env.EMAIL_RETRY_MAX_ATTEMPTS || 8)
const EMAIL_RETRY_BASE_DELAY_SEC = Number(process.env.EMAIL_RETRY_BASE_DELAY_SEC || 30)

/** Derive display name for salutation: use candidate name or email local part so we never show only "Dear Candidate" when we have an email */
function getCandidateDisplayName(candidateName: string | null | undefined, candidateEmail: string): string {
  const trimmed = candidateName?.trim()
  if (trimmed) return trimmed
  const local = candidateEmail?.split('@')[0]
  if (!local) return 'Candidate'
  const cleaned = local.replace(/[._]/g, ' ').replace(/[^a-zA-Z0-9\s]/g, '')
  if (!cleaned) return 'Candidate'
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private sendGridService: SendGridService | null = null
  private resendService: ResendService | null = null
  private mailtrapService: MailtrapService | null = null
  private mailjetService: MailjetService | null = null

  private useSendGrid: boolean
  private useResend: boolean
  private useMailtrap: boolean
  private useMailjet: boolean

  private logFile: string
  private providers: Array<{
    name: string
    send: (data: any) => Promise<any>
    verify: () => Promise<boolean>
    window: RollingWindow
    limit: number
  }> = []

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'email.log')
    
    // Initialize services based on environment variables
    this.useResend = process.env.USE_RESEND === 'true' || !!process.env.RESEND_API_KEY
    this.useSendGrid = process.env.USE_SENDGRID === 'true' || !!process.env.SENDGRID_API_KEY
    this.useMailtrap = process.env.USE_MAILTRAP === 'true' || !!process.env.MAILTRAP_API_TOKEN
    this.useMailjet = process.env.USE_MAILJET === 'true' || !!process.env.MAILJET_API_KEY
    
    if (this.useResend) {
      this.resendService = new ResendService()
      this.providers.push({
        name: 'resend',
        send: (data) => this.resendService!.sendEmail(data, data.useSecondaryKey),
        verify: () => this.resendService!.verifyConnection(),
        window: new RollingWindow(60000),
        limit: Number(process.env.RESEND_RATE_LIMIT || 100)
      })
      logger.info('Email service: Resend API initialized')
    }

    if (this.useSendGrid) {
      this.sendGridService = new SendGridService()
      this.providers.push({
        name: 'sendgrid',
        send: (data) => this.sendGridService!.sendEmail(data),
        verify: () => this.sendGridService!.verifyConnection(),
        window: new RollingWindow(60000),
        limit: Number(process.env.SENDGRID_RATE_LIMIT || 100)
      })
      logger.info('Email service: SendGrid API initialized')
    }

    if (this.useMailtrap) {
      this.mailtrapService = new MailtrapService()
      this.providers.push({
        name: 'mailtrap',
        send: (data) => this.mailtrapService!.sendEmail(data),
        verify: () => this.mailtrapService!.verifyConnection(),
        window: new RollingWindow(60000),
        limit: Number(process.env.MAILTRAP_RATE_LIMIT || 50)
      })
      logger.info('Email service: Mailtrap API initialized')
    }

    if (this.useMailjet) {
      this.mailjetService = new MailjetService()
      this.providers.push({
        name: 'mailjet',
        send: (data) => this.mailjetService!.sendEmail(data),
        verify: () => this.mailjetService!.verifyConnection(),
        window: new RollingWindow(60000),
        limit: Number(process.env.MAILJET_RATE_LIMIT || 50)
      })
      logger.info('Email service: Mailjet API initialized')
    }

    // Always initialize SMTP as a final fallback
    this.initSMTP()
    this.providers.push({
      name: 'smtp',
      send: (data) => this.transporter!.sendMail({
        from: data.from || DEFAULT_FROM_EMAIL,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text
      }),
      verify: () => this.transporter!.verify().then(() => true).catch(() => false),
      window: new RollingWindow(60000),
      limit: Number(process.env.SMTP_RATE_LIMIT || 20)
    })

    // Verify connections on startup (non-blocking)
    this.verifyConnection().catch(err => {
      logger.warn('Email service connection verification failed:', err.message)
    })
  }

  private initSMTP() {
    const mailHost = process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
    const mailUser = process.env.MAIL_USER || process.env.SMTP_USER
    const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS
    const mailFrom = process.env.MAIL_FROM || process.env.MAIL_USER || process.env.SMTP_USER || DEFAULT_FROM_EMAIL

    // Warn if credentials are missing
    if (!mailUser || !mailPass) {
      logger.warn('Email service: SMTP initialized without authentication credentials.')
    }

    const mailPort = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '465', 10)
    const useSecure = mailPort === 465
    
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: useSecure,
      auth: mailUser && mailPass ? {
        user: mailUser,
        pass: mailPass
      } : undefined,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      tls: {
        rejectUnauthorized: false
      }
    })
  }

  /**
   * Verify all configured email services
   */
  async verifyConnection(): Promise<boolean> {
    const results = await Promise.all(this.providers.map(async p => {
      const ok = await p.verify()
      if (ok) logger.info(`Email service: ${p.name} connection verified`)
      else logger.warn(`Email service: ${p.name} connection failed`)
      return ok
    }))
    return results.some(r => r === true)
  }

  /**
   * Select the best available provider based on rolling window stats and rate limits
   */
  private pickProvider(): any {
    // Sort providers by health (success rate) and then by current usage vs limit
    const availableProviders = this.providers.filter(p => {
      const stats = p.window.getStats()
      return stats.isHealthy && p.window.canAccept(p.limit)
    })

    if (availableProviders.length === 0) {
      // If all providers are unhealthy or at limit, return the one with the best success rate
      // or just fallback to SMTP (last in list)
      return this.providers[this.providers.length - 1]
    }

    // Sort by success rate descending, then by usage percentage ascending
    return availableProviders.sort((a, b) => {
      const aStats = a.window.getStats()
      const bStats = b.window.getStats()
      
      if (bStats.successRate !== aStats.successRate) {
        return bStats.successRate - aStats.successRate
      }
      
      const aUsage = aStats.total / a.limit
      const bUsage = bStats.total / b.limit
      return aUsage - bUsage
    })[0]
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
      const logPath = this.logFile || path.join(process.cwd(), 'logs', 'email.log')
      const timestamp = new Date().toISOString()
      const logEntry = `[${timestamp}] ${status.toUpperCase()} | To: ${to} | Subject: ${subject}${error ? ` | Error: ${error}` : ''}\n`
      await fs.appendFile(logPath, logEntry)
    } catch (error) {
      logger.error('Failed to write email log:', error)
    }
  }

  private async getCustomTemplate(companyId: string | null | undefined, type: 'SHORTLIST' | 'REJECT' | 'INTERVIEW') {
    if (!companyId) return null
    try {
      const { rows } = await query(
        `SELECT subject, body_html, body_text FROM company_email_templates WHERE company_id = $1 AND template_type = $2`,
        [companyId, type]
      )
      return rows[0] || null
    } catch (error) {
      logger.error('Error fetching custom email template:', error)
      return null
    }
  }

  /**
   * Candidate Acknowledgment Email (SHORTLISTED)
   * sendAcknowledgement(email, jobTitle, meetingLink)
   */
  async sendAcknowledgement(data: {
    email: string
    jobTitle: string
    meetingLink: string | null
    candidateName?: string
    companyName?: string
  }) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D2DDD; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 24px; background: #2D2DDD; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
    </div>
    <div class="content">
      <p>Hi ${data.candidateName || 'Candidate'},</p>
      <p>Great news! You've been shortlisted for the position of <strong>${data.jobTitle}</strong>.</p>
      ${data.meetingLink ? `
      <p>Meeting link: <a href="${data.meetingLink}" class="button">Join Interview</a></p>
      <p><strong>Note:</strong> Interview time will be shared separately via email.</p>
      ` : '<p>Interview details will be shared soon via email.</p>'}
      <p>Best regards,<br>${data.companyName || 'Hiring Team'}</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Congratulations!

Hi ${data.candidateName || 'Candidate'},

Great news! You've been shortlisted for the position of ${data.jobTitle}.

${data.meetingLink ? `Meeting link: ${data.meetingLink}\n\nNote: Interview time will be shared separately via email.` : 'Interview details will be shared soon via email.'}

Best regards,
${data.companyName || 'Hiring Team'}
    `

    await this.sendEmail({
      to: data.email,
      subject: `Congratulations! You've been shortlisted for ${data.jobTitle}`,
      html,
      text
    })
  }

  /**
   * Sent to candidate immediately upon application submission
   */
  async sendCandidateApplicationReceivedEmail(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    candidateLoginUrl?: string | null
    candidateTemporaryPassword?: string | null
    isNewCandidateAccount?: boolean
  }) {
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')

    const subject = `Application Received: ${cleanedJobTitle} at ${companyName}`
    const loginUrl = data.candidateLoginUrl || 'https://optiohire.com/auth/signin'

    const dashboardBlock = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `
    <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🎯 Your Candidate Dashboard is Ready</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">We've created a personal dashboard for you where you can track your application status, build your skills profile, and explore more opportunities.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600;">${data.candidateEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.candidateTemporaryPassword}</td>
        </tr>
      </table>
      <a href="${loginUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Log In to Your Dashboard →</a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Please change your password after your first login for security.</p>
    </div>`
      : ''

    const dashboardBlockText = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `

--- YOUR CANDIDATE DASHBOARD ---
We've created a personal dashboard for you to track your application.

Email: ${data.candidateEmail}
Temporary Password: ${data.candidateTemporaryPassword}
Log in at: ${loginUrl}

Please change your password after your first login for security.
---------------------------------`
      : ''

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
        <h2 style="color: #0f1c2e; margin-bottom: 16px;">Application Received</h2>
        <p>Hi ${candidateName},</p>
        <p>Thank you for applying for the <strong>${cleanedJobTitle}</strong> position at <strong>${companyName}</strong>.</p>
        <p>We have successfully received your application. The hiring team will review your profile and get back to you with next steps.</p>
        ${dashboardBlock}
        <p style="margin-top: 24px;">Best regards,<br>The OptioHire Team</p>
      </div>
    `

    const text = `Application Received

Hi ${candidateName},

Thank you for applying for the ${cleanedJobTitle} position at ${companyName}.
We have successfully received your application.
${dashboardBlockText}

Best regards,
The OptioHire Team`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'

    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      html,
      text
    })
  }

  /**
   * Shortlist notification only. Does NOT include interview date/time/link.
   * Interview details are sent later when HR uses the Schedule button (scheduleInterviewController).
   */
  async sendShortlistEmail(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    companyId?: string | null
    companyEmail?: string | null
    companyDomain?: string | null
    interviewLink?: string | null
    interviewDate?: string | null
    interviewTime?: string | null
    candidateLoginUrl?: string | null
    candidateTemporaryPassword?: string | null
    isNewCandidateAccount?: boolean
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')

    const customTemplate = await this.getCustomTemplate(data.companyId, 'SHORTLIST')

    let subject = `You've been shortlisted – ${cleanedJobTitle} - ${companyName}`
    const hasInterviewDetails = !!(data.interviewLink || data.interviewDate || data.interviewTime)

    // Build candidate dashboard block if new account was provisioned
    const loginUrl = data.candidateLoginUrl || 'https://optiohire.com/auth/signin'
    const dashboardBlock = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `
    <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🎯 Your Candidate Dashboard is Ready</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">We've created a personal dashboard for you where you can track your application status, build your skills profile, and explore more opportunities.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600;">${data.candidateEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.candidateTemporaryPassword}</td>
        </tr>
      </table>
      <a href="${loginUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Log In to Your Dashboard →</a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Please change your password after your first login for security.</p>
    </div>`
      : ''

    const dashboardBlockText = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `

--- YOUR CANDIDATE DASHBOARD ---
We've created a personal dashboard for you to track your application.

Email: ${data.candidateEmail}
Temporary Password: ${data.candidateTemporaryPassword}
Log in at: ${loginUrl}

Please change your password after your first login for security.
---------------------------------`
      : ''

    let html = ''
    let text = ''

    if (customTemplate) {
      const vars = {
        candidate_name: candidateName,
        job_title: cleanedJobTitle,
        company_name: companyName,
        hr_email: hrEmail,
        interview_link: data.interviewLink,
        interview_date: data.interviewDate,
        interview_time: data.interviewTime
      }
      subject = parseTemplate(customTemplate.subject, vars)
      
      // Ensure custom template body has HTML formatting
      let rawHtml = parseTemplate(customTemplate.body_html, vars)
      if (rawHtml && !rawHtml.includes('<p>') && !rawHtml.includes('<br>')) {
        rawHtml = rawHtml.replace(/\n/g, '<br>')
      }
      
      html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    ${rawHtml}
  </div>
</body>
</html>`
      text = customTemplate.body_text ? parseTemplate(customTemplate.body_text, vars) : rawHtml.replace(/<[^>]*>/g, '')
      
      // Append dashboard block to custom template
      if (dashboardBlock) {
        html += dashboardBlock
        text += dashboardBlockText
      }
    } else {
      html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    
    <p>Congratulations! After reviewing your application for the <strong>${cleanedJobTitle}</strong> position - <strong>${companyName}</strong>, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.</p>
    
    ${hasInterviewDetails ? `
    <p>Your final interview has been scheduled as follows:</p>
    <p><strong>Interview Details:</strong></p>
    <p><strong>Position:</strong> ${cleanedJobTitle}</p>
    <p><strong>Company:</strong> ${companyName}</p>
    ${data.interviewDate ? `<p><strong>Date:</strong> ${data.interviewDate}</p>` : ''}
    ${data.interviewTime ? `<p><strong>Time:</strong> ${data.interviewTime}</p>` : ''}
    ${data.interviewLink ? `<p><strong>Meeting Link:</strong> <a href="${data.interviewLink}">${data.interviewLink}</a></p>` : ''}
    <p>During this session, we will discuss your experience, your fit for the role, and the value you can bring to our team.</p>
    ` : `
    <p>Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.</p>
    `}
    
    <p>If you have any questions, feel free to contact our HR team at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    
    <p>We look forward to meeting you and learning more about how you can contribute to our team. Thank you!</p>
    ${dashboardBlock}
    <p>Kind regards,<br>
    <strong>${companyName}</strong><br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

      text = hasInterviewDetails
        ? `Dear ${candidateName},

Congratulations! After reviewing your application for the ${cleanedJobTitle} position - ${companyName}, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Your final interview has been scheduled as follows:

Position: ${cleanedJobTitle}
Company: ${companyName}
${data.interviewDate ? `Date: ${data.interviewDate}\n` : ''}${data.interviewTime ? `Time: ${data.interviewTime}\n` : ''}${data.interviewLink ? `Meeting Link: ${data.interviewLink}\n` : ''}

During this session, we will discuss your experience, your fit for the role, and the value you can bring to our team.

If you have any questions, feel free to contact our HR team at ${hrEmail}.
${dashboardBlockText}
Kind regards,
${companyName}
Company Email: ${hrEmail}`
        : `Dear ${candidateName},

Congratulations! After reviewing your application for the ${cleanedJobTitle} position - ${companyName}, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.

If you have any questions, feel free to contact our HR team at ${hrEmail}.

We look forward to meeting you. Thank you!
${dashboardBlockText}
Kind regards,
${companyName}
Company Email: ${hrEmail}`
    }

    // Use applicationsoptiohire@gmail.com for all candidate emails
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
    
    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html: html, // Send the HTML email
      emailType: 'shortlist'
    })
  }

  async sendRejectionEmail(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    companyId?: string | null
    companyEmail?: string | null
    companyDomain?: string | null
    candidateLoginUrl?: string | null
    candidateTemporaryPassword?: string | null
    isNewCandidateAccount?: boolean
    rejectSource?: 'SYSTEM' | 'HR'
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const customTemplate = await this.getCustomTemplate(data.companyId, 'REJECT')

    let subject = `Update on Your Application for the ${jobTitle} Position - ${companyName}`

    // Build candidate dashboard block if new account was provisioned
    const loginUrl = data.candidateLoginUrl || 'https://optiohire.com/auth/signin'
    const dashboardBlock = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `
    <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🎯 Your Candidate Dashboard is Ready</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">We've created a personal dashboard for you where you can track your application status, build your skills profile, and explore more opportunities.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600;">${data.candidateEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.candidateTemporaryPassword}</td>
        </tr>
      </table>
      <a href="${loginUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Log In to Your Dashboard →</a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Please change your password after your first login for security.</p>
    </div>`
      : ''

    const dashboardBlockText = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `

--- YOUR CANDIDATE DASHBOARD ---
We've created a personal dashboard for you to track your application.

Email: ${data.candidateEmail}
Temporary Password: ${data.candidateTemporaryPassword}
Log in at: ${loginUrl}

Please change your password after your first login for security.
---------------------------------`
      : ''

    let html = ''
    let text = ''

    if (customTemplate) {
      const vars = {
        candidate_name: candidateName,
        job_title: jobTitle,
        company_name: companyName,
        hr_email: hrEmail
      }
      subject = parseTemplate(customTemplate.subject, vars)
      
      // Ensure custom template body has HTML formatting
      let rawHtml = parseTemplate(customTemplate.body_html, vars)
      if (rawHtml && !rawHtml.includes('<p>') && !rawHtml.includes('<br>')) {
        rawHtml = rawHtml.replace(/\n/g, '<br>')
      }
      
      html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    ${rawHtml}
  </div>
</body>
</html>`
      text = customTemplate.body_text ? parseTemplate(customTemplate.body_text, vars) : rawHtml.replace(/<[^>]*>/g, '')
      
      // Append dashboard block to custom template
      if (dashboardBlock) {
        html += dashboardBlock
        text += dashboardBlockText
      }
    } else {
      if (data.rejectSource === 'SYSTEM') {
        html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We appreciate the effort you put into your application.</p>
    <p>After an initial review of your profile against the core requirements of this role, we regret to inform you that we will not be moving forward with your application at this time.</p>
    <p>However, we were impressed by your background and have <strong>added your profile to our exclusive Talent Pool</strong>. This means our team will keep you in mind for future opportunities that better match your skills and experience within <strong>${companyName}</strong>.</p>
    <p>If you have any questions, please feel free to contact us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    <p>We sincerely appreciate your interest in our company and wish you the very best in your job search.</p>
    ${dashboardBlock}
    <p>Kind regards,<br>
    <strong>Company Name:</strong> ${companyName}<br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
        `

        text = `Dear ${candidateName},

Thank you for taking the time to apply for the ${jobTitle} position at ${companyName}. We appreciate the effort you put into your application.

After an initial review of your profile against the core requirements of this role, we regret to inform you that we will not be moving forward with your application at this time.

However, we were impressed by your background and have added your profile to our exclusive Talent Pool. This means our team will keep you in mind for future opportunities that better match your skills and experience within ${companyName}.

If you have any questions, please feel free to contact us at ${hrEmail}.

We sincerely appreciate your interest in our company and wish you the very best in your job search.
${dashboardBlockText}
Kind regards,

Company Name: ${companyName}
Company Email: ${hrEmail}`
      } else {
        html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. We truly appreciate the effort you put into your application and the time you invested in the selection process.</p>
    <p>After a detailed review by our HR team, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications.</p>
    <p>However, your profile is impressive, and we have <strong>added you to our exclusive Talent Pool</strong>. We encourage you to apply for future opportunities, and we will proactively reach out if a role opens up that aligns perfectly with your expertise.</p>
    <p>If you have any questions or would like feedback regarding your application, please feel free to contact us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    <p>We sincerely appreciate your interest in our company and wish you the very best in your future career endeavors.</p>
    ${dashboardBlock}
    <p>Kind regards,<br>
    <strong>Company Name:</strong> ${companyName}<br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
        `

        text = `Dear ${candidateName},

Thank you for taking the time to apply for the ${jobTitle} position at ${companyName}. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After a detailed review by our HR team, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications.

However, your profile is impressive, and we have added you to our exclusive Talent Pool. We encourage you to apply for future opportunities, and we will proactively reach out if a role opens up that aligns perfectly with your expertise.

If you have any questions or would like feedback regarding your application, please feel free to contact us at ${hrEmail}.

We sincerely appreciate your interest in our company and wish you the very best in your future career endeavors.
${dashboardBlockText}
Kind regards,

Company Name: ${companyName}
Company Email: ${hrEmail}`
      }
    }

    // Use applicationsoptiohire@gmail.com for all candidate emails
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
    
    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html: html, // Send the HTML email
      emailType: 'rejection'
    })
  }

  /**
   * RECONSIDERATION: Send a beautiful encouraging email when an admin rescores an application.
   */
  async sendReconsiderationEmail(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    missingSkills?: string[]
    companyEmail?: string | null
    companyDomain?: string | null
    candidateLoginUrl?: string | null
    candidateTemporaryPassword?: string | null
    isNewCandidateAccount?: boolean
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const subject = `Good News: Re-evaluation of Your Application for ${jobTitle} at ${companyName}`

    // Build candidate dashboard block if new account was provisioned
    const loginUrl = data.candidateLoginUrl || 'https://optiohire.com/auth/signin'
    const dashboardBlock = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `
    <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🎯 Your Candidate Dashboard is Ready</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">We've created a personal dashboard for you where you can track your application status, build your skills profile, and explore more opportunities.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600;">${data.candidateEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.candidateTemporaryPassword}</td>
        </tr>
      </table>
      <a href="${loginUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Log In to Your Dashboard →</a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Please change your password after your first login for security.</p>
    </div>`
      : ''

    const dashboardBlockText = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `

--- YOUR CANDIDATE DASHBOARD ---
We've created a personal dashboard for you to track your application.

Email: ${data.candidateEmail}
Temporary Password: ${data.candidateTemporaryPassword}
Log in at: ${loginUrl}

Please change your password after your first login for security.
---------------------------------`
      : ''

    let missingSkillsHtml = ''
    let missingSkillsText = ''

    if (data.missingSkills && data.missingSkills.length > 0) {
      missingSkillsHtml = `
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #0f172a;">Areas for Growth</p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">To further strengthen your profile, we identified a few skills that could be beneficial to develop:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
          ${data.missingSkills.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>`
      
      missingSkillsText = `
Areas for Growth:
To further strengthen your profile, we identified a few skills that could be beneficial to develop:
${data.missingSkills.map(s => `- ${s}`).join('\n')}
`
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { text-align: center; margin-bottom: 30px; }
    .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    h1 { color: #0f172a; font-size: 20px; margin-top: 15px; }
    p { color: #334155; font-size: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Application Update</span>
      <h1>Profile Re-evaluated</h1>
    </div>
    <p>Dear ${candidateName},</p>
    <p>We have wonderful news! Our team has recently conducted a secondary review of your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
    <p>We are pleased to inform you that upon closer inspection, we see great potential in your profile and would love to keep you actively moving forward in our talent pool consideration.</p>
    ${missingSkillsHtml}
    <p>Your passion and background are inspiring, and we want to ensure you have the best possible chance to succeed. We will be in touch if your profile aligns with the next steps.</p>
    <p>If you have any questions, please feel free to reach out to us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    ${dashboardBlock}
    <p style="margin-top: 30px;">Warm regards,<br>
    <strong>The Team at ${companyName}</strong><br>
    <a href="mailto:${hrEmail}" style="color: #64748b; font-size: 13px;">${hrEmail}</a></p>
  </div>
</body>
</html>
    `

    const text = `Dear ${candidateName},

We have wonderful news! Our team has recently conducted a secondary review of your application for the ${jobTitle} position at ${companyName}.

We are pleased to inform you that upon closer inspection, we see great potential in your profile and would love to keep you actively moving forward in our talent pool consideration.
${missingSkillsText}
Your passion and background are inspiring, and we want to ensure you have the best possible chance to succeed. We will be in touch if your profile aligns with the next steps.

If you have any questions, please feel free to reach out to us at ${hrEmail}.
${dashboardBlockText}
Warm regards,
The Team at ${companyName}
${hrEmail}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
    
    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html,
      emailType: 'reconsideration'
    })
  }

  /**
   * FLAG band (51–79): candidate is not rejected or shortlisted yet — HR review in progress.
   */
  async sendFlagReviewEmail(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    companyEmail?: string | null
    companyDomain?: string | null
    candidateLoginUrl?: string | null
    candidateTemporaryPassword?: string | null
    isNewCandidateAccount?: boolean
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const subject = `Your application for ${jobTitle} - ${companyName} is under review`

    // Build candidate dashboard block if new account was provisioned
    const loginUrl = data.candidateLoginUrl || 'https://optiohire.com/auth/signin'
    const dashboardBlock = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `
    <div style="margin-top: 24px; padding: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px;">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🎯 Your Candidate Dashboard is Ready</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155;">We've created a personal dashboard for you where you can track your application status, build your skills profile, and explore more opportunities.</p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 100px;">Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600;">${data.candidateEmail}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Password:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #0f1c2e; font-weight: 600; font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; display: inline-block;">${data.candidateTemporaryPassword}</td>
        </tr>
      </table>
      <a href="${loginUrl}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Log In to Your Dashboard →</a>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8;">Please change your password after your first login for security.</p>
    </div>`
      : ''

    const dashboardBlockText = data.isNewCandidateAccount && data.candidateTemporaryPassword
      ? `

--- YOUR CANDIDATE DASHBOARD ---
We've created a personal dashboard for you to track your application.

Email: ${data.candidateEmail}
Temporary Password: ${data.candidateTemporaryPassword}
Log in at: ${loginUrl}

Please change your password after your first login for security.
---------------------------------`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>Thank you for applying for the <strong>${jobTitle}</strong> role at <strong>${companyName}</strong>.</p>
    <p>Your CV has been received and assessed. Your profile is <strong>still under review</strong> by our hiring team. This is not a rejection — we may need a little more time to evaluate your fit against the role requirements.</p>
    <p>We will contact you again if we move forward with your application. If you have questions, please reach us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    ${dashboardBlock}
    <p>Kind regards,<br>
    <strong>${companyName}</strong><br>
    <strong>HR contact:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

    const text = `Dear ${candidateName},

Thank you for applying for the ${jobTitle} role - ${companyName}.

Your CV has been received and assessed. Your profile is still under review by our hiring team. This is not a rejection — we may need a little more time to evaluate your fit against the role requirements.

We will contact you again if we move forward with your application. If you have questions, please reach us at ${hrEmail}.
${dashboardBlockText}
Kind regards,
${companyName}
HR contact: ${hrEmail}`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'

    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html,
      emailType: 'flag_review',
    })
  }

  async sendInboundForwardEmail(data: {
    recipients: string[]
    candidateName: string
    candidateEmail: string
    jobTitle: string
    companyName: string
    originalSubject: string
    resumeUrl?: string | null
  }) {
    const to = Array.from(new Set(data.recipients.filter(Boolean))).join(',')
    if (!to) return

    const html = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h3>New Candidate Email Received</h3>
  <p>A candidate email was ingested and routed to your job posting.</p>
  <p><strong>Company:</strong> ${data.companyName}</p>
  <p><strong>Job:</strong> ${data.jobTitle}</p>
  <p><strong>Candidate:</strong> ${data.candidateName} (${data.candidateEmail})</p>
  <p><strong>Original Subject:</strong> ${data.originalSubject}</p>
  ${data.resumeUrl ? `<p><strong>Resume:</strong> <a href="${data.resumeUrl}">${data.resumeUrl}</a></p>` : '<p><strong>Resume:</strong> No attachment found</p>'}
</body>
</html>
    `

    const text = `New Candidate Email Received

Company: ${data.companyName}
Job: ${data.jobTitle}
Candidate: ${data.candidateName} (${data.candidateEmail})
Original Subject: ${data.originalSubject}
Resume: ${data.resumeUrl || 'No attachment found'}
`

    await this.sendEmail({
      to,
      subject: `New application received - ${data.jobTitle}`,
      html,
      text,
      emailType: 'notification',
      useSecondaryKey: true
    })
  }

  /**
   * HR Notification for Every New Applicant
   * sendHRNotification(hr_email, candidate_name, score, status)
   */
  async sendHRNotification(data: {
    hrEmail: string
    candidateName: string
    candidateEmail: string
    jobTitle: string
    companyName: string
    score?: number | null
    status?: string | null
  }) {
    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')
    const companyName = data.companyName || '[Company Name]'
    const recommendedSubject = getRecommendedApplicationSubject(cleanedJobTitle, companyName)

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D2DDD; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Applicant Received</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>A new application has been received for <strong>${cleanedJobTitle}</strong> - <strong>${companyName}</strong>.</p>
      <p><strong>Candidate:</strong> ${data.candidateName}</p>
      <p><strong>Email:</strong> ${data.candidateEmail}</p>
      ${data.score !== null && data.score !== undefined ? `<p><strong>Score:</strong> ${data.score}/100</p>` : ''}
      ${data.status ? `<p><strong>Status:</strong> ${data.status}</p>` : ''}
      <p>${data.score !== null && data.score !== undefined ? 'The candidate has been evaluated.' : 'The candidate is being processed and scored. You\'ll receive updates once the evaluation is complete.'}</p>
      <hr />
      <p><strong>Important:</strong> To ensure email applications are correctly matched to this job (even when multiple companies hire for similar roles), please instruct candidates to use the following exact subject line when emailing their CVs:</p>
      <p style="margin-top: 8px; padding: 10px; background: #fff; border-radius: 6px; border: 1px dashed #ccc;"><code>${recommendedSubject}</code></p>
      <p>This subject pattern includes both the role and your company name, so the system can unambiguously route applications to the correct job posting.</p>
      <p>Best regards,<br>HireBit System</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
New Applicant Received

A new application has been received for ${cleanedJobTitle} - ${companyName}.

Candidate: ${data.candidateName}
Email: ${data.candidateEmail}
${data.score !== null && data.score !== undefined ? `Score: ${data.score}/100` : ''}
${data.status ? `Status: ${data.status}` : ''}

${data.score !== null && data.score !== undefined ? 'The candidate has been evaluated.' : 'The candidate is being processed and scored. You\'ll receive updates once the evaluation is complete.'}

Important:
To ensure email applications are correctly matched to this job (even when multiple companies hire for similar roles), please instruct candidates to use the following exact subject line when emailing their CVs:

  ${recommendedSubject}

This subject pattern includes both the role and your company name, so the system can unambiguously route applications to the correct job posting.

Best regards,
HireBit System
    `

    await this.sendEmail({
      to: data.hrEmail,
      from: DEFAULT_FROM_EMAIL,
      fromName: DEFAULT_FROM_NAME,
      subject: `New Applicant Received for ${data.jobTitle}`,
      html,
      text,
      emailType: 'notification',
      useSecondaryKey: true // Use secondary key for HR notifications
    })
  }

  /**
   * Job posting created notification to HR/company
   */
  async sendJobPostingCreatedEmail(data: {
    recipients: string[]
    jobTitle: string
    companyName: string
    applicationDeadline: string
    hrName?: string
    hrEmail?: string
    department?: string
    jobLocation?: string
    employmentType?: string
  }) {
    const to = Array.from(new Set(data.recipients.filter(Boolean))).join(',')
    if (!to) return

    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')
    const companyName = data.companyName || '[Company Name]'
    const deadline = new Date(data.applicationDeadline)
    const deadlineText = isNaN(deadline.getTime()) ? data.applicationDeadline : deadline.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const recommendedSubject = `${cleanedJobTitle} - ${companyName}`

    // Derive HR name from email if not provided (e.g. john.doe@co.com → John)
    const hrEmailAddr = data.hrEmail || data.recipients[0] || ''
    const hrName = data.hrName
      ? data.hrName
      : (hrEmailAddr.split('@')[0] || 'HR Team')
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c: string) => c.toUpperCase())

    const department = data.department || ''
    const jobLocation = data.jobLocation || ''
    const employmentType = data.employmentType || ''

    // Build meta items — only show non-empty ones
    const metaItems = [companyName, department, jobLocation, employmentType].filter(Boolean)
    const metaHtml = metaItems.map((item, i) =>
      i === 0
        ? `<span>${item}</span>`
        : `<span class="meta-dot"></span><span>${item}</span>`
    ).join('')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your Job Is Live – OptioHire</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Serif+Display&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f0f4f8; font-family: 'DM Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 620px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .hdr { background: #0f1c2e; padding: 24px 36px; display: flex; align-items: center; justify-content: space-between; }
    .hdr-badge { background: #1a3a5c; color: #60aaf0; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 12px; border-radius: 20px; border: 1px solid #2a5280; }
    .status-bar { background: #0d7a4e; padding: 13px 36px; display: flex; align-items: center; gap: 10px; }
    .status-dot { width: 8px; height: 8px; background: #5DCAA5; border-radius: 50%; flex-shrink: 0; }
    .status-bar p { font-size: 13px; font-weight: 600; color: #c0f0dc; letter-spacing: 0.01em; }
    .body { padding: 36px; }
    .greeting { font-size: 15px; color: #334155; line-height: 1.75; margin-bottom: 28px; }
    .greeting strong { color: #0f1c2e; }
    .job-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 22px; margin-bottom: 28px; }
    .job-card-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-bottom: 10px; }
    .job-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .job-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 22px; color: #0f1c2e; line-height: 1.2; }
    .job-live-badge { background: #e1f5ee; color: #0d7a4e; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 10px; border-radius: 20px; white-space: nowrap; border: 1px solid #9fe1cb; flex-shrink: 0; }
    .job-meta { display: flex; gap: 16px; flex-wrap: wrap; }
    .job-meta span { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }
    .meta-dot { width: 3px; height: 3px; background: #cbd5e1; border-radius: 50%; }
    .ai-notice { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px 18px; margin-bottom: 28px; display: flex; gap: 14px; align-items: flex-start; }
    .ai-icon { width: 34px; height: 34px; background: #185fa5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ai-icon svg { width: 18px; height: 18px; fill: none; stroke: #93c5fd; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .ai-notice p { font-size: 13px; color: #1e40af; line-height: 1.6; }
    .ai-notice strong { color: #1e3a8a; }
    .div-label { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .div-label hr { flex: 1; border: none; border-top: 1px solid #e2e8f0; }
    .div-label span { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; white-space: nowrap; }
    .share-intro { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 18px; }
    .share-box { background: #fdf2f8; border: 1.5px dashed #fbcfe8; border-radius: 12px; padding: 22px 24px; margin-bottom: 10px; position: relative; }
    .share-box-tag { position: absolute; top: -11px; left: 18px; background: #fce7f3; border: 1px solid #fbcfe8; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; color: #db2777; letter-spacing: 0.08em; text-transform: uppercase; }
    .share-text { font-size: 13.5px; color: #334155; line-height: 1.8; }
    .share-text p { margin-bottom: 12px; }
    .share-text p:last-child { margin-bottom: 0; }
    .share-text strong { color: #0f1c2e; font-weight: 600; }
    .subject-pill { display: inline-block; background: #eff6ff; color: #185fa5; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 6px; border: 1px solid #bfdbfe; font-family: 'Courier New', monospace; word-break: break-all; }
    .share-steps { margin: 12px 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .share-steps li { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: #334155; line-height: 1.6; }
    .sli-num { width: 20px; height: 20px; background: #0f1c2e; color: #93c5fd; font-size: 10px; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
    .copy-hint { font-size: 12px; color: #94a3b8; text-align: right; margin-bottom: 28px; }
    .cta-row { background: #0f1c2e; border-radius: 12px; padding: 22px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
    .cta-text p:first-child { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
    .cta-text p:last-child { font-size: 12px; color: #64748b; }
    .cta-btn { display: inline-block; background: #185fa5; color: #ffffff; font-family: 'DM Sans', Arial, sans-serif; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 20px; border-radius: 8px; white-space: nowrap; }
    .foot { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 36px; text-align: center; }
    .foot p { font-size: 11px; color: #94a3b8; line-height: 1.8; }
    .foot a { color: #185fa5; text-decoration: none; }
    @media (max-width: 640px) {
      .wrap { margin: 0; border-radius: 0; }
      .hdr, .status-bar, .body, .foot { padding-left: 20px; padding-right: 20px; }
      .cta-row { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div style="display:flex;align-items:center;gap:9px">
      <img src="https://optiohire.com/assets/logo/logo-removebg-preview.png" alt="OptioHire Logo" style="height: 32px; width: auto;" />
    </div>
    <span class="hdr-badge">Job Confirmation</span>
  </div>
  <div class="status-bar">
    <div class="status-dot"></div>
    <p>Your job posting is live and AI shortlisting is now active</p>
  </div>
  <div class="body">
    <p class="greeting">
      Hi <strong>${hrName}</strong>,<br /><br />
      Great news — your job posting has been successfully created on OptioHire.
      The system is now actively receiving and shortlisting applications on your behalf.
      Below is a summary of your posting and everything you need to start sourcing candidates.
    </p>
    <div class="job-card">
      <p class="job-card-label">Your job posting</p>
      <div class="job-title-row">
        <span class="job-title">${cleanedJobTitle}</span>
        <span class="job-live-badge">Live</span>
      </div>
      <div class="job-meta">
        ${metaHtml}
      </div>
    </div>
    <div class="ai-notice">
      <div class="ai-icon">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
      </div>
      <p>
        <strong>AI shortlisting is active.</strong> Every application — whether submitted through the OptioHire platform or via email — will be automatically scored and ranked based on your job requirements. You will see all candidates in your dashboard. Application deadline: <strong>${deadlineText}</strong>.
      </p>
    </div>
    <div class="div-label">
      <hr />
      <span>Shareable message for external candidates</span>
      <hr />
    </div>
    <p class="share-intro">
      Want to reach candidates outside the platform — through LinkedIn, WhatsApp groups, or your own network?
      Copy and share the message below exactly as written. It includes all the instructions applicants need to apply correctly so the system can process their submissions automatically.
    </p>
    <div class="share-box">
      <span class="share-box-tag">Copy &amp; share this</span>
      <div class="share-text">
        <p>We are hiring for a <strong>${cleanedJobTitle}</strong> at <strong>${companyName}</strong>!</p>
        <p>To apply, send an email to <strong>applicationsoptiohire@gmail.com</strong> or <strong>jobs@optiohire.com</strong> and follow these exact steps:</p>
        <ul class="share-steps">
          <li>
            <span class="sli-num">1</span>
            <span>Your email subject line must be exactly:<br /><span class="subject-pill">${recommendedSubject}</span></span>
          </li>
          <li>
            <span class="sli-num">2</span>
            <span>In the body of the email, write a short cover letter explaining why you are a great fit for this role.</span>
          </li>
          <li>
            <span class="sli-num">3</span>
            <span>Attach your latest CV or résumé as a <strong>PDF file</strong>.</span>
          </li>
        </ul>
        <p>We look forward to receiving your application!</p>
      </div>
    </div>
    <p class="copy-hint">&#128274; The subject line above is unique to this job posting — it must not be changed.</p>
    <div class="cta-row">
      <div class="cta-text">
        <p>View your applications dashboard</p>
        <p>Track candidates, review shortlists &amp; schedule interviews</p>
      </div>
      <a href="https://optiohire.com/hr" class="cta-btn">Open Dashboard →</a>
    </div>
    <p style="font-size:12px; color:#94a3b8; line-height:1.7; text-align:center;">
      If you have any questions or need to update your posting, log in to your HR dashboard at any time.
    </p>
  </div>
  <div class="foot">
    <div style="display:flex;align-items:center;justify-content:center;gap:9px;margin-bottom:12px;">
      <img src="https://optiohire.com/assets/logo/logo-removebg-preview.png" alt="OptioHire Logo" style="height: 28px; width: auto;" />
    </div>
    <p>
      This notification was sent to <strong>${hrEmailAddr}</strong> by OptioHire.<br />
      <a href="https://optiohire.com">optiohire.com</a>
      &nbsp;·&nbsp;
      <a href="https://optiohire.com/unsubscribe">Unsubscribe</a>
    </p>
  </div>
</div>
</body>
</html>`

    const text = `Your Job Is Live – OptioHire

Hi ${hrName},

Your job posting has been successfully created on OptioHire. The system is now actively receiving and shortlisting applications on your behalf.

POSTING DETAILS
Role:     ${cleanedJobTitle}
Company:  ${companyName}
${department ? `Dept:     ${department}\n` : ''}${jobLocation ? `Location: ${jobLocation}\n` : ''}${employmentType ? `Type:     ${employmentType}\n` : ''}Deadline: ${deadlineText}

SHAREABLE MESSAGE FOR EXTERNAL CANDIDATES
Copy and paste this to LinkedIn, WhatsApp, or your network:

---
We are hiring for a ${cleanedJobTitle} at ${companyName}!

To apply, send an email to applicationsoptiohire@gmail.com or jobs@optiohire.com and follow these steps:

1. Your email subject MUST be exactly: ${recommendedSubject}
2. In the body, write a short cover letter explaining why you are a great fit.
3. Attach your latest CV/résumé as a PDF.

We look forward to receiving your application!
---

The subject line above is unique to this posting — it must not be changed.

View your dashboard: https://optiohire.com/dashboard

OptioHire — AI-Powered Recruitment
optiohire.com`

    await this.sendEmail({
      to,
      from: DEFAULT_FROM_EMAIL,
      subject: `Your job is live – ${cleanedJobTitle} at ${companyName}`,
      html,
      text,
      emailType: 'notification',
      useSecondaryKey: true
    })
  }

  /**
   * Applicant milestone notification (e.g. 10, 50, 100 applications)
   */
  async sendApplicantMilestoneNotification(data: {
    recipients: string[]
    jobTitle: string
    companyName: string
    totalApplications: number
  }) {
    const to = Array.from(new Set(data.recipients.filter(Boolean))).join(',')
    if (!to) return

    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')
    const companyName = data.companyName || '[Company Name]'
    const total = data.totalApplications

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D2DDD; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Milestone Reached</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>Your job posting <strong>${cleanedJobTitle}</strong> - <strong>${companyName}</strong> has reached <strong>${total}</strong> applications.</p>
      <p>This is a good time to review and shortlist candidates so far, or to adjust the job ad if needed.</p>
      <p>Best regards,<br>OptioHire</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `Application Milestone Reached

Your job posting "${cleanedJobTitle}" at "${companyName}" has reached ${total} applications.

This is a good time to review and shortlist candidates so far, or to adjust the job ad if needed.

Best regards,
OptioHire`

    await this.sendEmail({
      to,
      subject: `Milestone: ${total} applications for ${cleanedJobTitle}`,
      html,
      text,
      emailType: 'notification',
      useSecondaryKey: true
    })
  }

  /**
   * Generate company noreply email address
   * Priority: company_email > noreply@company_domain > noreply@sanitized_company_name.com > env fallback
   */
  getCompanyEmail(companyEmail: string | null | undefined, companyDomain: string | null | undefined, companyName: string): string {
    // If company_email exists, use it
    if (companyEmail) {
      return companyEmail
    }
    
    // If company_domain exists, use noreply@domain
    if (companyDomain) {
      // Remove http://, https://, www. if present
      const cleanDomain = companyDomain
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .toLowerCase()
      return `noreply@${cleanDomain}`
    }
    
    // Fallback: generate from company name (sanitized)
    if (companyName) {
      const sanitized = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)
      return `noreply@${sanitized}.com`
    }
    
    // Default fallback
    return DEFAULT_FROM_EMAIL
  }

  async sendInterviewSchedule(data: {
    candidate_email: string
    jobTitle: string
    meeting_time: string
    companyId?: string | null
    meetingLink?: string
    location?: string
    interviewType?: 'online' | 'in-person'
    candidateName?: string
    companyName?: string
    hrEmail?: string
  }) {
    const meetingDateObj = new Date(data.meeting_time)
    const meetingDate = meetingDateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    const candidateName = data.candidateName || 'Candidate'
    const companyName = data.companyName || 'Hiring Team'
    const hrContact = data.hrEmail || DEFAULT_FROM_EMAIL
    const cleanedJobTitle = cleanJobTitle(data.jobTitle)

    const customTemplate = await this.getCustomTemplate(data.companyId, 'INTERVIEW')

    let subject = `Your Interview for ${cleanedJobTitle} at ${companyName} – ${meetingDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
    let html = ''
    let text = ''

    if (customTemplate) {
      const vars = {
        candidate_name: candidateName,
        job_title: cleanedJobTitle,
        company_name: companyName,
        interview_link: data.meetingLink,
        interview_date: meetingDateObj.toLocaleDateString(),
        interview_time: meetingDateObj.toLocaleTimeString()
      }
      subject = parseTemplate(customTemplate.subject, vars)
      html = parseTemplate(customTemplate.body_html, vars)
      text = customTemplate.body_text ? parseTemplate(customTemplate.body_text, vars) : html.replace(/<[^>]*>/g, '')
    } else {
      const isOnline = data.interviewType === 'online' || !!data.meetingLink
      const isInPerson = data.interviewType === 'in-person' && !!data.location

      let locationHtml = ''
      let locationText = ''

      if (isInPerson && data.location) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`
        locationHtml = `
          <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:16px; margin:16px 0;">
            <p style="margin:0 0 6px 0;"><strong>📍 Interview Venue</strong></p>
            <p style="margin:0 0 12px 0; font-size:15px;">${data.location}</p>
            <a href="${mapsUrl}" style="display:inline-block; padding:10px 20px; background:#16a34a; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">📍 View on Google Maps</a>
          </div>
        `
        locationText = `Venue: ${data.location}\nGoogle Maps: ${mapsUrl}\n`
      } else if (isOnline && data.meetingLink) {
        locationHtml = `
          <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:8px; padding:16px; margin:16px 0;">
            <p style="margin:0 0 6px 0;"><strong>🎥 Online Interview</strong></p>
            <p style="margin:0 0 12px 0;">Your interview will take place via video call. Click the button below to join:</p>
            <a href="${data.meetingLink}" style="display:inline-block; padding:12px 28px; background:#2D2DDD; color:white; text-decoration:none; border-radius:6px; font-weight:bold; font-size:15px;">🎥 Join Interview</a>
            <p style="margin:12px 0 0 0; font-size:12px; color:#6b7280;">Link: <a href="${data.meetingLink}" style="color:#2D2DDD;">${data.meetingLink}</a></p>
          </div>
        `
        locationText = `Video Interview Link: ${data.meetingLink}\n`
      }

      html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #2D2DDD; padding: 32px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Interview Scheduled!</h1>
      <p style="color: #c7d2fe; margin: 8px 0 0 0;">You have been selected for an interview</p>
    </div>
    <div style="padding: 28px 28px;">
      <p style="margin: 0 0 16px 0;">Dear <strong>${candidateName}</strong>,</p>
      <p style="margin: 0 0 20px 0;">Congratulations! You have been shortlisted and your interview for the position below has been scheduled. Please review the details carefully and make sure you are prepared.</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #6b7280; width: 140px;">Position</td><td style="padding: 6px 0; font-weight: bold;">${cleanedJobTitle}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Company</td><td style="padding: 6px 0; font-weight: bold;">${companyName}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date &amp; Time</td><td style="padding: 6px 0; font-weight: bold;">${meetingDate}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Format</td><td style="padding: 6px 0; font-weight: bold;">${isInPerson ? 'In-Person' : 'Online (Video Call)'}</td></tr>
        </table>
      </div>

      ${locationHtml}

      <div style="background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0; font-weight: bold;">📋 How to Prepare</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Review the job description and your application</li>
          <li>Bring a printed copy of your CV</li>
          <li>${isInPerson ? 'Arrive at least 5–10 minutes early' : 'Test your audio and video before the interview'}</li>
          <li>Prepare questions to ask the interviewer</li>
        </ul>
      </div>

      <p style="margin: 20px 0 8px 0;">If you have any questions or need to reschedule, please contact us at <a href="mailto:${hrContact}" style="color: #2D2DDD;">${hrContact}</a>.</p>
      <p style="margin: 0;">We look forward to meeting you!</p>
    </div>
    <div style="background: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; font-size: 13px; color: #6b7280;">This email was sent by OptioHire on behalf of <strong>${companyName}</strong></p>
    </div>
  </div>
</body>
</html>`

      text = `Interview Scheduled – ${cleanedJobTitle} at ${companyName}

Dear ${candidateName},

Congratulations! Your interview has been scheduled. Please review the details below:

Position:    ${cleanedJobTitle}
Company:     ${companyName}
Date & Time: ${meetingDate}
Format:      ${isInPerson ? 'In-Person' : 'Online (Video Call)'}
${locationText}
How to Prepare:
- Review the job description and your application
- Bring a printed copy of your CV
- ${isInPerson ? 'Arrive at least 5–10 minutes early' : 'Test your audio and video before the interview'}
- Prepare questions to ask the interviewer

For questions or to reschedule, contact: ${hrContact}

We look forward to meeting you!

OptioHire on behalf of ${companyName}`
    }

    await this.sendEmail({
      to: data.candidate_email,
      subject,
      html,
      text
    })
  }

  async sendHRInterviewConfirmation(data: {
    hr_email: string
    candidate: {
      name: string
      email: string
    }
    time: string
    jobTitle: string
    meetingLink?: string
    location?: string
    interviewType?: 'online' | 'in-person'
    companyName?: string
  }) {
    const meetingDateObj = new Date(data.time)
    const meetingDate = meetingDateObj.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    const cleanedJobTitle = cleanJobTitle(data.jobTitle)
    const companyName = data.companyName || 'Your Company'
    const isInPerson = data.interviewType === 'in-person' && !!data.location
    const isOnline = !isInPerson && !!data.meetingLink

    let locationHtml = ''
    let locationText = ''

    if (isInPerson && data.location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location)}`
      locationHtml = `
        <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:16px; margin:12px 0;">
          <p style="margin:0 0 6px 0; font-weight:bold;">📍 Interview Venue</p>
          <p style="margin:0 0 10px 0;">${data.location}</p>
          <a href="${mapsUrl}" style="color:#16a34a;">View on Google Maps →</a>
        </div>
      `
      locationText = `Venue: ${data.location}\nGoogle Maps: ${mapsUrl}\n`
    } else if (isOnline && data.meetingLink) {
      locationHtml = `
        <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:8px; padding:16px; margin:12px 0;">
          <p style="margin:0 0 6px 0; font-weight:bold;">🎥 Online Interview</p>
          <p style="margin:0 0 10px 0;">Meeting Link: <a href="${data.meetingLink}" style="color:#2D2DDD;">${data.meetingLink}</a></p>
        </div>
      `
      locationText = `Video Interview Link: ${data.meetingLink}\n`
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f3f4f6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
    <div style="background: #2D2DDD; padding: 28px 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">✅ Interview Scheduled</h1>
      <p style="color: #c7d2fe; margin: 6px 0 0 0; font-size: 14px;">OptioHire — Interview Confirmation</p>
    </div>
    <div style="padding: 28px;">
      <p style="margin: 0 0 20px 0;">Hi, an interview has been successfully scheduled via OptioHire. Here are the full details:</p>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Candidate</p>
        <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: bold;">${data.candidate.name}</p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">Email</p>
        <p style="margin: 0 0 16px 0;"><a href="mailto:${data.candidate.email}" style="color: #2D2DDD;">${data.candidate.email}</a></p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">Position</p>
        <p style="margin: 0 0 16px 0; font-weight: bold;">${cleanedJobTitle}</p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">Date &amp; Time</p>
        <p style="margin: 0 0 16px 0; font-weight: bold;">${meetingDate}</p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">Format</p>
        <p style="margin: 0;">${isInPerson ? '🏢 In-Person' : '🎥 Online (Video Call)'}</p>
      </div>

      ${locationHtml}

      <p style="font-size: 13px; color: #6b7280; margin: 20px 0 0 0;">The candidate has been notified via email with the same details. No further action is required on your end unless you need to reschedule.</p>
    </div>
    <div style="background: #f8fafc; padding: 14px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">OptioHire — AI-Powered Recruitment for ${companyName}</p>
    </div>
  </div>
</body>
</html>`

    const text = `Interview Scheduled — OptioHire Confirmation

Candidate: ${data.candidate.name}
Email:     ${data.candidate.email}
Position:  ${cleanedJobTitle}
Date/Time: ${meetingDate}
Format:    ${isInPerson ? 'In-Person' : 'Online (Video Call)'}
${locationText}
The candidate has been notified via email with the same details.

OptioHire — AI-Powered Recruitment for ${companyName}`

    await this.sendEmail({
      to: data.hr_email,
      from: DEFAULT_FROM_EMAIL,
      subject: `Interview Scheduled: ${data.candidate.name} – ${cleanedJobTitle}`,
      html,
      text,
      emailType: 'notification',
      useSecondaryKey: true
    })
  }

  async sendPasswordResetCode(email: string, name: string, resetCode: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Code</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'User'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password for your OptioHire account.</p>
    <p style="font-size: 16px; margin-bottom: 30px;">Use the following code to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
        <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${resetCode}</p>
      </div>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Enter this code on the password reset page to continue.</p>
    <p style="font-size: 14px; color: #666; margin-top: 20px;">This code will expire in 1 hour for security reasons.</p>
    <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The OptioHire Team</p>
  </div>
</body>
</html>
    `

    const text = `
Password Reset Code

Hello ${name || 'User'},

We received a request to reset your password for your OptioHire account.

Your password reset code is: ${resetCode}

Enter this code on the password reset page to continue.

This code will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The OptioHire Team
    `

    await this.sendEmail({
      to: email,
      from: DEFAULT_FROM_EMAIL,
      subject: 'Your OptioHire Password Reset Code',
      html,
      text,
      emailType: 'password_reset',
      recipientName: name,
      useSecondaryKey: true // Use secondary key for notification emails
    })
  }

  /**
   * Email verification code on account creation – sent to user's email to confirm address
   */
  async sendEmailVerificationCode(email: string, name: string, code: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Confirm Your Email</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'User'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Thanks for creating your OptioHire account. Please confirm your email address using the code below.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
        <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
      </div>
    </div>
    <p style="font-size: 14px; color: #666;">Enter this code on the verification page to activate your account. This code expires in 24 hours.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The OptioHire Team</p>
  </div>
</body>
</html>
    `
    const text = `Confirm Your Email\n\nHello ${name || 'User'},\n\nThanks for creating your OptioHire account. Your verification code is: ${code}\n\nEnter this code on the verification page. This code expires in 24 hours.\n\nBest regards,\nThe OptioHire Team`
    await this.sendEmail({
      to: email,
      from: DEFAULT_FROM_EMAIL,
      subject: 'Confirm your OptioHire account – verification code',
      html,
      text,
      emailType: 'activation',
      recipientName: name,
      useSecondaryKey: true
    })
  }

  /**
   * Welcome email from OptioHire – sent after email is confirmed
   */
  async sendWelcomeEmail(email: string, name: string) {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || 'https://optiohire.com').replace(/\/$/, '')
    const dashboardUrl = `${appUrl}/hr`
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to OptioHire</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to OptioHire</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'User'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Your email is confirmed. You're all set to use OptioHire to post jobs, screen candidates, and hire with confidence.</p>
    <p style="font-size: 16px; margin-bottom: 20px;">Get started by creating your first job posting from your dashboard.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="background: #2563eb; color: white; padding: 14px 26px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 15px;">Open Dashboard</a>
    </div>
    <p style="font-size: 13px; color: #666; margin: 0 0 20px 0;">If the button does not work, copy and paste this link in your browser:</p>
    <p style="font-size: 12px; color: #777; word-break: break-all; background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; margin: 0 0 20px 0;">${dashboardUrl}</p>
    <p style="font-size: 14px; color: #666;">If you have any questions, reply to this email or visit our help center.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The OptioHire Team</p>
  </div>
</body>
</html>
    `
    const text = `Welcome to OptioHire\n\nHello ${name || 'User'},\n\nYour email is confirmed. You're all set to use OptioHire to post jobs, screen candidates, and hire with confidence.\n\nOpen your dashboard here:\n${dashboardUrl}\n\nBest regards,\nThe OptioHire Team`
    await this.sendEmail({
      to: email,
      from: DEFAULT_FROM_EMAIL,
      subject: 'Welcome to OptioHire – your account is ready',
      html,
      text,
      emailType: 'welcome',
      recipientName: name,
      useSecondaryKey: true
    })
  }

  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hello ${name || 'User'},</p>
    <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password for your OptioHire account.</p>
    <p style="font-size: 16px; margin-bottom: 30px;">Click the button below to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px; border: 1px solid #e0e0e0;">${resetUrl}</p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 1 hour for security reasons.</p>
    <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The OptioHire Team</p>
  </div>
</body>
</html>
    `

    const text = `
Password Reset Request

Hello ${name || 'User'},

We received a request to reset your password for your OptioHire account.

Click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The OptioHire Team
    `

    await this.sendEmail({
      to: email,
      from: DEFAULT_FROM_EMAIL,
      subject: 'Reset Your OptioHire Password',
      html,
      text,
      emailType: 'password_reset',
      recipientName: name,
      useSecondaryKey: true // Use secondary key for notification emails
    })
  }

  async sendEmail(data: {
    to: string
    subject: string
    html: string
    text: string
    from?: string
    fromName?: string
    replyTo?: string
    emailType?: string
    recipientName?: string
    useSecondaryKey?: boolean
    skipLogInsert?: boolean
    existingEmailLogId?: string | null
  }) {
    const emailType = data.emailType || 'general'
    const recipientName = data.recipientName || null

    // Anti-Spam: Frequency Cap (1 email of same type per recipient every 2 minutes)
    try {
      const { query } = await import('../db/index.js')
      const { rows: recentEmails } = await query(
        `SELECT COUNT(*) FROM email_logs 
         WHERE recipient_email = $1 
         AND email_type = $2 
         AND status = 'sent' 
         AND created_at > NOW() - INTERVAL '2 minutes'`,
        [data.to.toLowerCase(), emailType]
      )
      
      if (Number(recentEmails[0].count) > 0) {
        logger.warn(`Email frequency cap reached for ${data.to} (${emailType}). Skipping.`)
        return
      }
    } catch (freqErr) {
      logger.error('Failed to check email frequency cap:', freqErr)
    }
    
    // Log email attempt
    let emailLogId: string | null = data.existingEmailLogId || null
    if (!data.skipLogInsert && !emailLogId) {
      try {
        const { query } = await import('../db/index.js')
        const { rows } = await query(
          `INSERT INTO email_logs (recipient_email, recipient_name, subject, email_type, status, provider, metadata)
           VALUES ($1, $2, $3, $4, 'pending', 'rolling_window', $5)
           RETURNING email_id`,
          [
            data.to,
            recipientName,
            data.subject,
            emailType,
            JSON.stringify({
              html: data.html,
              text: data.text,
              from: data.from,
              fromName: data.fromName,
              replyTo: data.replyTo,
              retry_count: 0,
              is_retry_eligible: true,
              next_retry_at: null
            })
          ]
        )
        emailLogId = rows[0]?.email_id || null
      } catch (logError) {
        logger.error('Failed to log email:', logError)
      }
    }

    let success = false
    let lastError = ''
    const triedProviders = new Set<string>()
    const maxAttempts = Math.min(3, this.providers.length)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const provider = this.pickProvider()
      if (!provider || triedProviders.has(provider.name)) break
      
      triedProviders.add(provider.name)
      
      try {
        await provider.send(data)
        provider.window.record(true)
        success = true
        
        if (emailLogId) {
          try {
            const { query } = await import('../db/index.js')
            await query(
              `UPDATE email_logs
               SET status = 'sent',
                   provider = $2,
                   error_message = NULL,
                   sent_at = now(),
                   metadata = jsonb_set(
                     jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'false'::jsonb, true),
                     '{next_retry_at}',
                     'null'::jsonb,
                     true
                   )
               WHERE email_id = $1`,
              [emailLogId, provider.name]
            )
          } catch (updateError) {
            logger.error('Failed to update email log:', updateError)
          }
        }

        logger.info(`Email sent via ${provider.name} to ${data.to}: ${data.subject}`)
        await this.logEmail(data.to, data.subject, 'sent', `via ${provider.name}`)
        break
      } catch (error: any) {
        lastError = error?.message || String(error)
        provider.window.record(false)
        logger.warn(`Email via ${provider.name} failed: ${lastError}. Trying next provider...`)
      }
    }

    if (!success) {
      logger.error(`All email providers failed to send to ${data.to}: ${lastError}`)
      
      if (emailLogId) {
        try {
          const { query } = await import('../db/index.js')
          const { rows } = await query<{ retry_count: number }>(
            `SELECT COALESCE((metadata->>'retry_count')::int, 0) AS retry_count
             FROM email_logs
             WHERE email_id = $1`,
            [emailLogId]
          )
          const currentRetryCount = rows[0]?.retry_count ?? 0
          const nextRetryCount = currentRetryCount + 1
          const canRetry = nextRetryCount < MAX_EMAIL_RETRY_ATTEMPTS
          const delaySec = Math.min(3600, EMAIL_RETRY_BASE_DELAY_SEC * Math.pow(2, Math.max(0, currentRetryCount)))
          const nextRetryAt = new Date(Date.now() + delaySec * 1000).toISOString()

          await query(
            `UPDATE email_logs
             SET status = 'failed',
                 error_message = $2,
                 metadata = jsonb_set(
                   jsonb_set(
                     jsonb_set(
                       jsonb_set(
                         COALESCE(metadata, '{}'::jsonb),
                         '{retry_count}',
                         to_jsonb($3::int),
                         true
                       ),
                       '{is_retry_eligible}',
                       to_jsonb($4::boolean),
                       true
                     ),
                     '{next_retry_at}',
                     to_jsonb($5::text),
                     true
                   ),
                   '{last_failed_at}',
                   to_jsonb($6::text),
                   true
                 )
             WHERE email_id = $1`,
            [emailLogId, lastError, nextRetryCount, canRetry, nextRetryAt, new Date().toISOString()]
          )
        } catch (updateErr) {
          logger.error('Failed to persist retry metadata in email_logs:', updateErr)
        }
      }

      await this.logEmail(data.to, data.subject, 'failed', lastError)
      logger.warn(`Gracefully handled email failure to ${data.to}`);
    }
  }

  /**
   * Bulk or single custom message from HR to candidate(s).
   */
  async sendCustomCandidateMessage(data: {
    candidateEmail: string
    candidateName: string
    jobTitle: string
    companyName: string
    companyEmail: string
    messageBody: string
  }) {
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; border-left: 4px solid #2D2DDD; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>Regarding your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>, we have a message for you:</p>
    <div class="content">
      <p>${escapeHtml(data.messageBody).replace(/\\n/g, '<br>')}</p>
    </div>
    <p>Best regards,<br>
    <strong>${companyName} Hiring Team</strong><br>
    <a href="mailto:${data.companyEmail}">${data.companyEmail}</a></p>
  </div>
</body>
</html>
    `

    const text = `Dear ${candidateName},

Regarding your application for ${jobTitle} at ${companyName}, we have a message for you:

${data.messageBody}

Best regards,
${companyName} Hiring Team
${data.companyEmail}`

    await this.sendEmail({
      to: data.candidateEmail,
      from: process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com',
      replyTo: data.companyEmail,
      subject: `Message regarding your application: ${jobTitle}`,
      html,
      text,
      emailType: 'custom_message'
    })
  }

  /**
   * After the email watcher screens a CV: send a pipeline digest to the internal watcher address
   * (default developer@optiohire.com) and the employer so both see AI ranking, “best pick” logic, and next steps.
   */
  async sendWatcherPipelineDigest(opts: {
    recipients: string[]
    jobPostingId: string
    jobTitle: string
    companyName: string
    meetingLink: string | null
    dashboardShortlistedUrl: string
    latestCandidate: {
      name: string
      email: string
      score: number
      status: string
      reasoningPreview: string
    }
    rankedRows: { rank: number; name: string; email: string; score: number | null; status: string }[]
    bestPick: {
      name: string
      email: string
      score: number | null
      status: string
      explanation: string
    } | null
  }): Promise<void> {
    const safeTitle = cleanJobTitle(opts.jobTitle)
    const subject = `[OptioHire] AI screening update — ${safeTitle} at ${opts.companyName}`

    const rankTableRows = opts.rankedRows
      .map(
        (r) =>
          `<tr><td style="padding:8px;border-bottom:1px solid #eee">${r.rank}</td>` +
          `<td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(r.name)}</td>` +
          `<td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(r.email)}</td>` +
          `<td style="padding:8px;border-bottom:1px solid #eee">${r.score ?? '—'}</td>` +
          `<td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(r.status)}</td></tr>`
      )
      .join('')

    const meetingSection = opts.meetingLink
      ? `<p><strong>Video room on the job posting:</strong> <a href="${escapeAttr(opts.meetingLink)}">${escapeHtml(opts.meetingLink)}</a></p>`
      : `<p><em>No default meeting link on this job.</em> When you schedule from the dashboard, OptioHire can create a Google Meet (if Calendar is connected) and email the candidate.</p>`

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,Segoe UI,Arial,sans-serif;line-height:1.5;color:#111;max-width:720px;margin:0 auto;padding:16px">
  <h1 style="font-size:18px;color:#2563eb">Automated screening digest</h1>
  <p>This message is sent to the <strong>pipeline watcher</strong> and <strong>hiring contacts</strong> whenever the email inbox processes and scores an application.</p>
  <p><strong>Role:</strong> ${escapeHtml(safeTitle)} @ ${escapeHtml(opts.companyName)}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <h2 style="font-size:15px">Just analyzed</h2>
  <p><strong>${escapeHtml(opts.latestCandidate.name)}</strong> &lt;${escapeHtml(opts.latestCandidate.email)}&gt;<br/>
  Score: <strong>${opts.latestCandidate.score}</strong>/100 · Status: <strong>${escapeHtml(opts.latestCandidate.status)}</strong></p>
  <p style="font-size:14px;color:#444">${escapeHtml(opts.latestCandidate.reasoningPreview)}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <h2 style="font-size:15px">How we pick the “best” candidate (same order as your dashboard)</h2>
  <ul style="font-size:14px;padding-left:20px">
    <li><strong>Shortlist</strong> (AI score typically 80–100): strongest fit to the job description and required skills.</li>
    <li><strong>Flag</strong> (about 50–79): mixed signals — manual review recommended.</li>
    <li><strong>Reject</strong> (below threshold): weaker fit for this posting.</li>
    <li>Among equal status, higher <strong>AI score</strong> ranks first; then earlier applications break ties.</li>
  </ul>
  ${opts.bestPick ? `
  <p style="font-size:14px;background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px">
    <strong>Recommended lead →</strong> ${escapeHtml(opts.bestPick.name)} (${escapeHtml(opts.bestPick.email)})<br/>
    <span style="color:#166534">${escapeHtml(opts.bestPick.explanation)}</span>
  </p>` : ''}
  <h2 style="font-size:15px">Current pipeline (top ${opts.rankedRows.length})</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="text-align:left;background:#f8fafc">
      <th style="padding:8px;border-bottom:1px solid #e5e7eb">#</th>
      <th style="padding:8px;border-bottom:1px solid #e5e7eb">Name</th>
      <th style="padding:8px;border-bottom:1px solid #e5e7eb">Email</th>
      <th style="padding:8px;border-bottom:1px solid #e5e7eb">Score</th>
      <th style="padding:8px;border-bottom:1px solid #e5e7eb">Status</th>
    </tr></thead>
    <tbody>${rankTableRows}</tbody>
  </table>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
  <h2 style="font-size:15px">Next step: interview</h2>
  ${meetingSection}
  <p><a href="${escapeAttr(opts.dashboardShortlistedUrl)}" style="display:inline-block;margin-top:8px;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">Open shortlisted candidates (schedule meeting)</a></p>
  <p style="font-size:12px;color:#64748b">Candidates receive their own outcome email (shortlist / reject) separately. This digest is for internal visibility.</p>
</body></html>`

    const text = [
      `OptioHire — AI screening digest`,
      `Job: ${safeTitle} @ ${opts.companyName}`,
      ``,
      `Just analyzed: ${opts.latestCandidate.name} <${opts.latestCandidate.email}> — score ${opts.latestCandidate.score}, status ${opts.latestCandidate.status}`,
      opts.latestCandidate.reasoningPreview,
      ``,
      ...(opts.bestPick ? [
        `Best pick: ${opts.bestPick.name} <${opts.bestPick.email}> — ${opts.bestPick.explanation}`,
      ] : []),
      ``,
      `Pipeline (top ${opts.rankedRows.length}):`,
      ...opts.rankedRows.map(
        (r) => `  ${r.rank}. ${r.name} <${r.email}> — ${r.score ?? '—'} — ${r.status}`
      ),
      ``,
      opts.meetingLink ? `Meeting link: ${opts.meetingLink}` : 'No default meeting link on job.',
      `Dashboard: ${opts.dashboardShortlistedUrl}`,
    ].join('\n')

    for (const to of opts.recipients) {
      if (!to) continue
      try {
        await this.sendEmail({
          to,
          from: DEFAULT_FROM_EMAIL,
          subject,
          html,
          text,
          emailType: 'watcher_pipeline_digest',
          useSecondaryKey: true,
        })
      } catch (e) {
        logger.warn(`sendWatcherPipelineDigest failed for ${to}:`, e)
      }
    }
  }

  /**
   * Send a soft-rejection / talent pool notification email to a candidate
   */
  async sendTalentPoolNotification(data: {
    candidateEmail: string
    candidateName: string
    companyName: string
    jobTitle: string
  }): Promise<void> {
    const { candidateEmail, candidateName, companyName, jobTitle } = data
    
    const subject = `Update on your application for ${jobTitle} at ${companyName}`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hi ${escapeHtml(candidateName)},</p>
        <p>Thank you for taking the time to apply for the <strong>${escapeHtml(jobTitle)}</strong> position at <strong>${escapeHtml(companyName)}</strong>.</p>
        <p>We received many strong applications for this role, and while we are moving forward with other candidates at this time, we were impressed by your background.</p>
        <p>We have added your profile to our talent pool. If a suitable match is found in the future, we will reach out to you directly.</p>
        <p>Thank you again for your interest, and we wish you the best in your job search.</p>
        <br/>
        <p>Best regards,</p>
        <p>The team at ${escapeHtml(companyName)}</p>
      </div>
    `
    const text = `Hi ${candidateName},\n\nThank you for taking the time to apply for the ${jobTitle} position at ${companyName}.\n\nWe received many strong applications for this role, and while we are moving forward with other candidates at this time, we were impressed by your background.\n\nWe have added your profile to our talent pool. If a suitable match is found in the future, we will reach out to you directly.\n\nThank you again for your interest, and we wish you the best in your job search.\n\nBest regards,\nThe team at ${companyName}`

    return this.sendEmail({
      to: candidateEmail,
      from: DEFAULT_FROM_EMAIL,
      subject,
      html,
      text,
      emailType: 'talent_pool_notification',
    })
  }

  async sendTalentPoolMatchNotification(data: {
    candidateEmail: string
    candidateName?: string | null
    matches: Array<{
      jobTitle: string
      companyName: string
      overview: string
      requiredSkills: string[]
    }>
  }) {
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const matchCount = data.matches.length
    const subject = matchCount === 1
      ? `New job match found for you: ${data.matches[0].jobTitle} at ${data.matches[0].companyName}`
      : `New job matches found for you`

    const jobItemsHtml = data.matches.map((match, index) => `
      <div style="margin-bottom: 20px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f9fafb;">
        <p style="margin: 0 0 8px;"><strong>${index + 1}. ${escapeHtml(match.jobTitle)} at ${escapeHtml(match.companyName)}</strong></p>
        <p style="margin: 0 0 10px;">${escapeHtml(match.overview)}</p>
        ${match.requiredSkills.length > 0 ? `<p style="margin: 0 0 6px;"><strong>Key skills:</strong></p><ul style="margin: 0 0 0 18px; padding: 0;">${match.requiredSkills.slice(0, 6).map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .highlight { background: #eff6ff; padding: 16px; border-radius: 10px; margin-top: 16px; }
    .job-list { margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi ${escapeHtml(candidateName)},</p>

    <p>We found ${matchCount === 1 ? 'a new job match' : 'new job matches'} for you in the talent pool.</p>

    <div class="highlight">
      <p><strong>Why this matters:</strong></p>
      <p>Top candidates are selected from the talent pool even when they are not currently applied to a specific job. We recommend updating your CV and reapplying so the system can score your new application against the exact job posting.</p>
    </div>

    <div class="job-list">
      ${jobItemsHtml}
    </div>

    <p>Please update your application to highlight the skills and experience listed above, then reapply to the matching role(s).</p>
    <p>If you do not reapply, we will continue using your current talent pool profile for future matches.</p>

    <p>Best regards,<br />The team at OptioHire</p>
  </div>
</body>
</html>
    `

    const textJobs = data.matches.map((match, index) => `
${index + 1}. ${match.jobTitle} at ${match.companyName}
${match.overview}
${match.requiredSkills.length > 0 ? `Key skills: ${match.requiredSkills.slice(0, 6).join(', ')}` : ''}
`).join('\n')

    const text = `Hi ${candidateName},

We found ${matchCount === 1 ? 'a new job match' : 'new job matches'} for you in the talent pool.

${textJobs}
Please update your application to highlight the skills and experience listed above, then reapply to the matching role${matchCount === 1 ? '' : 's'}.

If you do not reapply, we will continue using your current talent pool profile for future matches.

Best regards,
The team at OptioHire`

    return this.sendEmail({
      to: data.candidateEmail,
      from: process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com',
      subject,
      html,
      text,
      emailType: 'talent_pool_match'
    })
  }

  // === Certificate Notifications ===

  async sendCertificateApprovedEmail(data: {
    candidateEmail: string
    candidateName: string
    skillName: string
  }) {
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const subject = `Certificate Approved: ${data.skillName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>Good news! Your uploaded certificate for <strong>${data.skillName}</strong> has been reviewed and <strong>APPROVED</strong> by our team.</p>
    <p>Your profile skill score has been updated accordingly. This boosts your visibility to potential employers.</p>
    <p>Keep up the great work!</p>
    <p>Kind regards,<br>
    <strong>OptioHire Admin Team</strong></p>
  </div>
</body>
</html>`

    const text = `Dear ${candidateName},

Good news! Your uploaded certificate for ${data.skillName} has been reviewed and APPROVED by our team.

Your profile skill score has been updated accordingly. This boosts your visibility to potential employers.

Keep up the great work!

Kind regards,
OptioHire Admin Team`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'

    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html,
      emailType: 'certificate_approved'
    })
  }

  async sendCertificateRejectedEmail(data: {
    candidateEmail: string
    candidateName: string
    skillName: string
    rejectionReason: string
  }) {
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const subject = `Action Required: Certificate Rejected for ${data.skillName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .reason-box { margin-top: 16px; padding: 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; color: #9f1239; }
  </style>
</head>
<body>
  <div class="container">
    <p>Dear ${candidateName},</p>
    <p>We have reviewed your uploaded certificate for <strong>${data.skillName}</strong>. Unfortunately, it could not be approved at this time.</p>
    
    <div class="reason-box">
      <strong>Reason for Rejection:</strong><br>
      ${data.rejectionReason}
    </div>

    <p>Don't worry — you can <strong>appeal this decision</strong> or simply re-upload a clearer or updated certificate directly from your Candidate Dashboard.</p>
    
    <p>If you have any questions, feel free to reply to this email.</p>
    
    <p>Kind regards,<br>
    <strong>OptioHire Admin Team</strong></p>
  </div>
</body>
</html>`

    const text = `Dear ${candidateName},

We have reviewed your uploaded certificate for ${data.skillName}. Unfortunately, it could not be approved at this time.

Reason for Rejection:
${data.rejectionReason}

Don't worry — you can appeal this decision or simply re-upload a clearer or updated certificate directly from your Candidate Dashboard.

If you have any questions, feel free to reply to this email.

Kind regards,
OptioHire Admin Team`

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'applicationsoptiohire@gmail.com'

    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html,
      emailType: 'certificate_rejected'
    })
  }

  async sendTalentPoolMatchEmail(data: {
    candidateEmail: string;
    candidateName: string | null;
    jobTitle: string;
    companyName: string;
    jobUrl: string;
  }) {
    const displayName = getCandidateDisplayName(data.candidateName, data.candidateEmail);
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">New Job Match at ${data.companyName}!</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
          <p style="color: #334155; font-size: 16px;">Based on your previous applications, our AI has identified you as a strong match for a newly opened role at <strong>${data.companyName}</strong>:</p>
          <p style="color: #2D2DDD; font-size: 18px; font-weight: bold; text-align: center; margin: 24px 0;">${data.jobTitle}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.jobUrl}" style="background-color: #2D2DDD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">View & Apply Now</a>
          </div>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire AI Team</p>
        </div>
      </div>
    `;

    const text = `Hi ${displayName},
    
Based on your previous applications, our AI has identified you as a strong match for a newly opened role at ${data.companyName}:

${data.jobTitle}

View and Apply here: ${data.jobUrl}

Best regards,
The OptioHire AI Team`;

    await this.sendEmail({
      to: data.candidateEmail,
      subject: `New Job Match: ${data.jobTitle} at ${data.companyName}`,
      html,
      text,
      emailType: 'TalentPoolMatch'
    });
  }

  async sendSupportTicketSeen(userEmail: string, subject: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">We've seen your message</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">This is a quick note to let you know that our administrative team has seen your support ticket: <strong>${subject}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">We are actively looking into it and will take the necessary actions. You will hear from us shortly.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: 'Your Support Ticket is Being Reviewed',
      html,
      text: `Hello, this is a quick note to let you know that our administrative team has seen your support ticket: ${subject}. We are actively looking into it and will take the necessary actions.`,
      emailType: 'SupportTicketSeen'
    });
  }

  async sendDemoSeen(userEmail: string, demoTime: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Demo Confirmed</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">Our team has been notified about your demo scheduled for <strong>${new Date(demoTime).toLocaleString()}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">We look forward to speaking with you! If you need to reschedule or have any questions beforehand, please reply to this email.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: userEmail,
      subject: 'OptioHire Demo Confirmed',
      html,
      text: `Hello, our team has been notified about your demo scheduled for ${new Date(demoTime).toLocaleString()}.`,
      emailType: 'DemoSeen'
    });
  }

  async sendDemoScheduledAdminAlert(adminEmail: string, hrInfo: any, demoTime: string, meetingLink?: string) {
    const meetingHtml = meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : '';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #fffbeb; border: 1px solid #fde68a;">
        <h2 style="color: #92400e; margin-top: 0;">New Demo Scheduled!</h2>
        <p style="color: #92400e;">A new demo has been booked.</p>
        <ul style="color: #92400e;">
          <li><strong>Email:</strong> ${hrInfo.email}</li>
          <li><strong>Company:</strong> ${hrInfo.companyName || 'N/A'}</li>
          <li><strong>Time:</strong> ${new Date(demoTime).toLocaleString()}</li>
          ${meetingHtml}
        </ul>
        <p style="color: #92400e; margin-bottom: 0;">Check the admin dashboard to mark it as seen.</p>
      </div>
    `;
    await this.sendEmail({
      to: adminEmail,
      subject: 'New Demo Scheduled',
      html,
      text: `A new demo has been booked by ${hrInfo.email} at ${new Date(demoTime).toLocaleString()}.`,
      emailType: 'AdminDemoAlert'
    });
  }

  async sendInterviewUpdated(candidateEmail: string, hrEmail: string, meetingTime: string, jobTitle: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Interview Schedule Updated</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">Your interview for the <strong>${jobTitle}</strong> position has been updated.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0;">
            <p style="color: #166534; margin: 0; font-size: 16px;"><strong>New time:</strong> ${new Date(meetingTime).toLocaleString()}</p>
          </div>
          <p style="color: #334155; font-size: 16px;">Please contact ${hrEmail} if you have any questions or need to request another change.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: candidateEmail,
      subject: 'Interview Updated',
      html,
      text: `Your interview for ${jobTitle} has been updated to ${new Date(meetingTime).toLocaleString()}`,
      emailType: 'InterviewUpdated'
    });
  }

  async sendHRInterviewUpdated(hrEmail: string, candidateName: string, meetingTime: string, jobTitle: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Interview Updated</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">The interview with <strong>${candidateName}</strong> for the <strong>${jobTitle}</strong> role has been updated.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0;">
            <p style="color: #166534; margin: 0; font-size: 16px;"><strong>New time:</strong> ${new Date(meetingTime).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: hrEmail,
      subject: 'Interview Updated',
      html,
      text: `The interview with ${candidateName} for ${jobTitle} has been updated to ${new Date(meetingTime).toLocaleString()}`,
      emailType: 'HRInterviewUpdated'
    });
  }
  async sendRoleUpdatedEmail(email: string, newRole: string, resetLink: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Account Role Updated</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">Your account role has been updated to <strong>${newRole}</strong> by an administrator.</p>
          <p style="color: #334155; font-size: 16px;">For security reasons, you must reset your password before logging in again.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password & Log In</a>
          </div>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: email,
      subject: 'OptioHire Account Update: Role Changed',
      html,
      text: `Your account role has been updated to ${newRole}. Please reset your password to log in: ${resetLink}`,
      emailType: 'RoleUpdated'
    });
  }
  async sendTalentPoolWelcomeEmail(data: {
    candidateEmail: string
    candidateName: string
    profileLink: string
    jobsLink: string
  }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Welcome to the OptioHire Talent Pool! 🎉</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello ${data.candidateName},</p>
          <p style="color: #334155; font-size: 16px;">Thanks for updating your profile! We have your details safely stored and you are now part of our exclusive Talent Pool.</p>
          <p style="color: #334155; font-size: 16px;">This means you are now visible to our AI worker and HR recruiters. Since HRs are constantly posting jobs, once a perfect match is found, we will dispatch an email to you immediately.</p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 20px 0;">
            <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">How to Improve Your Visibility & AI Score</h3>
            <ul style="color: #166534; margin: 0; padding-left: 20px; font-size: 15px;">
              <li style="margin-bottom: 5px;">Upload a <strong>Recommendation Letter</strong></li>
              <li>Upload <strong>Certifications</strong> to verify your skills</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.profileLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">Confirm My Profile</a>
            <a href="${data.jobsLink}" style="background-color: #475569; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Browse Open Jobs</a>
          </div>
          <p style="color: #334155; font-size: 16px;">We also encourage you to constantly check our jobs page in case any job that matches your preferences is uploaded.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    `;
    await this.sendEmail({
      to: data.candidateEmail,
      subject: 'Welcome to the OptioHire Talent Pool!',
      html,
      text: `Hello ${data.candidateName},\n\nThanks for updating your profile! You are now in our Talent Pool and visible to HRs.\n\nView Profile: ${data.profileLink}\nBrowse Jobs: ${data.jobsLink}\n\nImprove your score by uploading certificates and recommendation letters on your dashboard!\n\nBest,\nThe OptioHire Team`,
      emailType: 'TalentPoolWelcome'
    });
  }

  async sendAdminUploadNotificationEmail(data: {
    adminEmail: string
    candidateName: string
    documentType: string
    dashboardLink: string
  }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Document Uploaded</h2>
        <p>Candidate <strong>${data.candidateName}</strong> has uploaded a new <strong>${data.documentType}</strong>.</p>
        <p><a href="${data.dashboardLink}">Review on Dashboard</a></p>
      </div>
    `;
    await this.sendEmail({
      to: data.adminEmail,
      subject: `New ${data.documentType} Uploaded by ${data.candidateName}`,
      html,
      text: `Candidate ${data.candidateName} has uploaded a new ${data.documentType}. Review here: ${data.dashboardLink}`,
      emailType: 'AdminUploadAlert'
    });
  }

  async sendProfileCompletionReminderEmail(data: {
    candidateEmail: string
    candidateName: string
    onboardingLink: string
  }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px;">
        <h2 style="color: #e11d48; margin-top: 0;">Action Required: Complete Your Talent Profile</h2>
        <p style="color: #4c0519; font-size: 16px;">Hello ${data.candidateName},</p>
        <p style="color: #4c0519; font-size: 16px;">We noticed that your OptioHire candidate profile is incomplete. <strong>Currently, you are not in our Talent Pool and are invisible to our AI worker and HR recruiters.</strong></p>
        <p style="color: #4c0519; font-size: 16px;">To fix this and get matched with exciting opportunities, please complete your profile by uploading your CV and adding a short bio.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.onboardingLink}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete My Profile Now</a>
        </div>
        <p style="color: #4c0519; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
      </div>
    `;
    await this.sendEmail({
      to: data.candidateEmail,
      subject: 'Action Required: Complete Your OptioHire Profile',
      html,
      text: `Hello ${data.candidateName},\n\nPlease complete your profile to become visible to recruiters and our AI matching system.\n\nComplete Profile: ${data.onboardingLink}\n\nBest,\nThe OptioHire Team`,
      emailType: 'ProfileCompletionReminder'
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;')
}

