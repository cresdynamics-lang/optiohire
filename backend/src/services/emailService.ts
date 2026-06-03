import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { SendGridService } from './sendGridService.js'
import { ResendService } from './resendService.js'
import { APPLICATION_INBOX_EMAIL, getRecommendedApplicationSubject } from '../config/applicationInbox.js'
import { query } from '../db/index.js'
import { parseTemplate } from '../utils/templateParser.js'

/** Default from address for candidate emails and fallback when company email is not set */
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'
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
  private useSendGrid: boolean
  private useResend: boolean

  private logFile: string

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'email.log')
    // Priority: Resend > SendGrid > SMTP
    this.useResend = process.env.USE_RESEND === 'true' || !!process.env.RESEND_API_KEY
    this.useSendGrid = !this.useResend && (process.env.USE_SENDGRID === 'true' || !!process.env.SENDGRID_API_KEY)
    
    if (this.useResend) {
      this.resendService = new ResendService()
      logger.info('Email service: Using Resend API (recommended - domain verification support)')
      // Also initialize SMTP as fallback in case Resend fails
      this.initSMTP()
    } else if (this.useSendGrid) {
      this.sendGridService = new SendGridService()
      logger.info('Email service: Using SendGrid API (HTTPS - no firewall issues)')
      // Also initialize SMTP as fallback in case SendGrid fails
      this.initSMTP()
    } else {
      // Use SMTP as primary
      this.initSMTP()
    }
  }

  private initSMTP() {
    const mailHost = process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
    const mailUser = process.env.MAIL_USER || process.env.SMTP_USER
    const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS
    const mailFrom = process.env.MAIL_FROM || process.env.MAIL_USER || process.env.SMTP_USER || DEFAULT_FROM_EMAIL

    // Warn if credentials are missing
    if (!mailUser || !mailPass) {
      logger.warn('Email service initialized without authentication credentials. Emails will fail to send.')
      logger.warn('Please set MAIL_USER/SMTP_USER and MAIL_PASS/SMTP_PASS environment variables.')
      logger.warn('For Gmail, you must use an App Password (not your regular password).')
      logger.warn('Generate one at: https://myaccount.google.com/apppasswords')
    }

    // Try port 465 (SSL) first, fallback to 587 (TLS)
    const mailPort = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '465', 10)
    const useSecure = mailPort === 465
    
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: useSecure, // true for 465 (SSL), false for 587 (TLS)
      auth: mailUser && mailPass ? {
        user: mailUser,
        pass: mailPass
      } : undefined,
      // Increase timeouts and add retry options
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 30000,
      socketTimeout: 30000,
      // Add TLS options for better compatibility
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates if needed
      }
    })

    // Setup email log file
    this.logFile = path.join(process.cwd(), 'logs', 'email.log')
    this.ensureLogDirectory()

    // Verify connection on startup (non-blocking)
    this.verifyConnection().catch(err => {
      logger.warn('Email service connection verification failed:', err.message)
    })
  }

  /**
   * Verify email service connection (Resend, SendGrid, or SMTP)
   */
  async verifyConnection(): Promise<boolean> {
    if (this.useResend && this.resendService) {
      return await this.resendService.verifyConnection()
    }
    
    if (this.useSendGrid && this.sendGridService) {
      return await this.sendGridService.verifyConnection()
    }

    // Verify SMTP connection
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      logger.info('Email service: SMTP connection verified successfully')
      return true
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error('Email service: SMTP connection verification failed:', errorMsg)
      
      if (errorMsg?.includes('Authentication Required') || error?.responseCode === 530) {
        logger.error('Gmail requires an App Password. Please:')
        logger.error('1. Enable 2-Step Verification on your Google account')
        logger.error('2. Go to https://myaccount.google.com/apppasswords')
        logger.error('3. Generate an App Password for "Mail"')
        logger.error('4. Set MAIL_PASS or SMTP_PASS environment variable to the 16-character App Password')
        logger.error('')
        logger.error('OR use SendGrid (no firewall issues):')
        logger.error('1. Sign up at https://sendgrid.com')
        logger.error('2. Get API key from https://app.sendgrid.com/settings/api_keys')
        logger.error('3. Set SENDGRID_API_KEY in .env')
        logger.error('4. Set USE_SENDGRID=true in .env')
      }
      
      return false
    }
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
      html = parseTemplate(customTemplate.body_html, vars)
      text = customTemplate.body_text ? parseTemplate(customTemplate.body_text, vars) : html.replace(/<[^>]*>/g, '')
      
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

    // Use noreply@optiohire.com for all candidate emails
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'
    
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
      html = parseTemplate(customTemplate.body_html, vars)
      text = customTemplate.body_text ? parseTemplate(customTemplate.body_text, vars) : html.replace(/<[^>]*>/g, '')
      
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
    
    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position - <strong>${companyName}</strong> and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.</p>
    
    <p>After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.</p>
    
    <p>Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within <strong>${companyName}</strong>.</p>
    
    <p>If you have any questions or would like feedback regarding your application, please feel free to contact us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    
    <p>We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.</p>
    ${dashboardBlock}
    <p>Kind regards,<br>
    <strong>Company Name:</strong> ${companyName}<br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

      text = `Dear ${candidateName},

Thank you for taking the time to apply for the ${jobTitle} position - ${companyName} and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.

Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within ${companyName}.

If you have any questions or would like feedback regarding your application, please feel free to contact us at ${hrEmail}.

We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.
${dashboardBlockText}
Kind regards,

Company Name: ${companyName}
Company Email: ${hrEmail}`
    }

    // Use noreply@optiohire.com for all candidate emails
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'
    
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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'

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
    .share-box { background: #fafaf9; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 22px 24px; margin-bottom: 10px; position: relative; }
    .share-box-tag { position: absolute; top: -11px; left: 18px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase; }
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
        <p>To apply, send an email to <strong>${APPLICATION_INBOX_EMAIL}</strong> or <strong>jobs@optiohire.com</strong> and follow these exact steps:</p>
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
      <a href="https://optiohire.com/dashboard" class="cta-btn">Open Dashboard →</a>
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

To apply, send an email to ${APPLICATION_INBOX_EMAIL} or jobs@optiohire.com and follow these steps:

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
    const appUrl = (process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const dashboardUrl = `${appUrl}/dashboard`
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
    useSecondaryKey?: boolean // Use secondary Resend key for notifications (thanks for joining, welcome, etc.)
    skipLogInsert?: boolean
    existingEmailLogId?: string | null
  }) {
    const emailType = data.emailType || 'general'
    const recipientName = data.recipientName || null
    
    // Log email attempt
    let emailLogId: string | null = data.existingEmailLogId || null
    if (!data.skipLogInsert && !emailLogId) {
      try {
        const { query } = await import('../db/index.js')
        const { rows } = await query(
          `INSERT INTO email_logs (recipient_email, recipient_name, subject, email_type, status, provider, metadata)
           VALUES ($1, $2, $3, $4, 'pending', $5, $6)
           RETURNING email_id`,
          [
            data.to,
            recipientName,
            data.subject,
            emailType,
            this.useResend ? 'resend' : (this.useSendGrid ? 'sendgrid' : 'smtp'),
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

    // Priority 1: Use Resend if configured (recommended - domain verification support)
    if (this.useResend && this.resendService) {
      try {
        // Use secondary key for notification emails (thanks for joining, welcome, password reset, etc.)
        const useSecondary = data.useSecondaryKey === true || 
          ['password_reset', 'welcome', 'activation', 'notification', 'thanks'].includes(emailType.toLowerCase())
        
        const result = await this.resendService.sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
          fromName: data.fromName,
          replyTo: data.replyTo
        }, useSecondary)
        
        // Update email log - Resend service handles success internally
        if (emailLogId) {
          try {
            const { query } = await import('../db/index.js')
            await query(
              `UPDATE email_logs
               SET status = 'sent',
                   error_message = NULL,
                   sent_at = now(),
                   metadata = jsonb_set(
                     jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'false'::jsonb, true),
                     '{next_retry_at}',
                     'null'::jsonb,
                     true
                   )
               WHERE email_id = $1`,
              [emailLogId]
            )
          } catch (updateError) {
            logger.error('Failed to update email log:', updateError)
          }
        }
        return
      } catch (error: any) {
        const errorMsg = error?.message || String(error)
        logger.warn(`Resend failed (e.g. domain not verified), falling back to SendGrid or SMTP: ${errorMsg}`)
        // So we can fall back to SMTP when Resend fails (e.g. sending from @gmail.com)
        if (!this.transporter) {
          logger.info('Initializing SMTP transporter for fallback...')
          this.initSMTP()
          // Verify SMTP was initialized
          if (!this.transporter) {
            logger.error('SMTP transporter initialization failed - email sending will fail')
          } else {
            logger.info('SMTP transporter initialized successfully for fallback')
          }
        }
        // Fallback to SendGrid or SMTP below
      }
    }

    // Priority 2: Use SendGrid if configured (no firewall issues)
    if (this.useSendGrid && this.sendGridService) {
      try {
        await this.sendGridService.sendEmail({
          to: data.to,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
          fromName: data.fromName
        })
        return
      } catch (error: any) {
        logger.error(`SendGrid failed, falling back to SMTP: ${error.message}`)
        // Fallback to SMTP if SendGrid fails
        if (!this.transporter) {
          this.initSMTP()
        }
      }
    }

    // Use SMTP (fallback or if SendGrid not configured)
    try {
      const from = data.from || DEFAULT_FROM_EMAIL
      
      // Verify transporter is configured - initialize if not already done
      if (!this.transporter) {
        logger.info('SMTP transporter not initialized, initializing now...')
        this.initSMTP()
        if (!this.transporter) {
          throw new Error('Email transporter not initialized - SMTP configuration may be missing')
        }
      }

      // Verify authentication is configured
      const mailUser = process.env.MAIL_USER || process.env.SMTP_USER
      const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS
      
      if (!mailUser || !mailPass) {
        logger.error('Email authentication not configured. MAIL_USER/SMTP_USER and MAIL_PASS/SMTP_PASS environment variables must be set.')
        throw new Error('Email authentication not configured. Please set MAIL_USER/SMTP_USER and MAIL_PASS/SMTP_PASS environment variables. For Gmail, use an App Password (not your regular password).')
      }
      
      const result = await this.transporter.sendMail({
        from,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text
      })

      // Update email log
      if (emailLogId) {
        try {
          const { query } = await import('../db/index.js')
          await query(
            `UPDATE email_logs
             SET status = 'sent',
                 provider_message_id = $1,
                 error_message = NULL,
                 sent_at = now(),
                 metadata = jsonb_set(
                   jsonb_set(COALESCE(metadata, '{}'::jsonb), '{is_retry_eligible}', 'false'::jsonb, true),
                   '{next_retry_at}',
                   'null'::jsonb,
                   true
                 )
             WHERE email_id = $2`,
            [result.messageId || null, emailLogId]
          )
        } catch (updateError) {
          logger.error('Failed to update email log:', updateError)
        }
      }

      logger.info(`Email sent to ${data.to}: ${data.subject}`)
      await this.logEmail(data.to, data.subject, 'sent')
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      logger.error(`Failed to send email to ${data.to}:`, error)
      
      // Provide helpful error message for authentication failures
      if (error?.responseCode === 530 || errorMsg?.includes('Authentication Required')) {
        logger.error('SMTP Authentication Error: Gmail requires an App Password. Please:')
        logger.error('1. Go to https://myaccount.google.com/apppasswords')
        logger.error('2. Generate an App Password for "Mail"')
        logger.error('3. Set MAIL_PASS or SMTP_PASS environment variable to the generated App Password (not your regular password)')
        logger.error('4. Ensure MAIL_USER or SMTP_USER is set to your Gmail address')
      }
      
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
            [emailLogId, errorMsg, nextRetryCount, canRetry, nextRetryAt, new Date().toISOString()]
          )
        } catch (updateErr) {
          logger.error('Failed to persist retry metadata in email_logs:', updateErr)
        }
      }

      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      // Do not throw error here to fail gracefully and prevent job crashes
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
      from: process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com',
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
    }
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
  <p style="font-size:14px;background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px">
    <strong>Recommended lead →</strong> ${escapeHtml(opts.bestPick.name)} (${escapeHtml(opts.bestPick.email)})<br/>
    <span style="color:#166534">${escapeHtml(opts.bestPick.explanation)}</span>
  </p>
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
      `Best pick: ${opts.bestPick.name} <${opts.bestPick.email}> — ${opts.bestPick.explanation}`,
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
      from: process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com',
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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'

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

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'

    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html,
      emailType: 'certificate_rejected'
    })
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

