import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { SendGridService } from './sendGridService.js'
import { ResendService } from './resendService.js'
import { APPLICATION_INBOX_EMAIL, getRecommendedApplicationSubject } from '../config/applicationInbox.js'

/** Default from address for candidate emails and fallback when company email is not set */
const DEFAULT_FROM_EMAIL = process.env.MAIL_FROM || process.env.DEFAULT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@optiohire.com'
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
    companyEmail?: string | null
    companyDomain?: string | null
    interviewLink?: string | null
    interviewDate?: string | null
    interviewTime?: string | null
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')

    const subject = `You've been shortlisted – ${cleanedJobTitle} at ${companyName}`
    const hasInterviewDetails = !!(data.interviewLink || data.interviewDate || data.interviewTime)

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
    
    <p>Congratulations! After reviewing your application for the <strong>${cleanedJobTitle}</strong> position at <strong>${companyName}</strong>, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.</p>
    
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
    
    <p>Kind regards,<br>
    <strong>${companyName}</strong><br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

    const text = hasInterviewDetails
      ? `Dear ${candidateName},

Congratulations! After reviewing your application for the ${cleanedJobTitle} position at ${companyName}, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Your final interview has been scheduled as follows:

Position: ${cleanedJobTitle}
Company: ${companyName}
${data.interviewDate ? `Date: ${data.interviewDate}\n` : ''}${data.interviewTime ? `Time: ${data.interviewTime}\n` : ''}${data.interviewLink ? `Meeting Link: ${data.interviewLink}\n` : ''}

During this session, we will discuss your experience, your fit for the role, and the value you can bring to our team.

If you have any questions, feel free to contact our HR team at ${hrEmail}.

Kind regards,
${companyName}
Company Email: ${hrEmail}`
      : `Dear ${candidateName},

Congratulations! After reviewing your application for the ${cleanedJobTitle} position at ${companyName}, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.

Our HR team will send you the interview date, time, and meeting link once your interview has been scheduled. You do not need to take any action at this time.

If you have any questions, feel free to contact our HR team at ${hrEmail}.

We look forward to meeting you. Thank you!

Kind regards,
${companyName}
Company Email: ${hrEmail}`

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
    companyEmail?: string | null
    companyDomain?: string | null
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const subject = `Update on Your Application for the ${jobTitle} Position at ${companyName}`
    
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
    
    <p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.</p>
    
    <p>After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.</p>
    
    <p>Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within <strong>${companyName}</strong>.</p>
    
    <p>If you have any questions or would like feedback regarding your application, please feel free to contact us at <a href="mailto:${hrEmail}">${hrEmail}</a>.</p>
    
    <p>We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.</p>
    
    <p>Kind regards,<br>
    <strong>Company Name:</strong> ${companyName}<br>
    <strong>Company Email:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

    const text = `Dear ${candidateName},

Thank you for taking the time to apply for the ${jobTitle} position at ${companyName} and for your interest in joining our team. We truly appreciate the effort you put into your application and the time you invested in the selection process.

After careful consideration and review of all candidates, we regret to inform you that we will not be moving forward with your application at this time. This decision was not easy, as we received a high number of strong applications, including yours.

Although you were not selected for this role, we encourage you to apply for future opportunities that match your skills and experience. Your profile is impressive, and we believe you may be a strong fit for upcoming positions within ${companyName}.

If you have any questions or would like feedback regarding your application, please feel free to contact us at ${hrEmail}.

We sincerely appreciate your interest in our company and wish you the very best in your job search and future career endeavors.

Kind regards,

Company Name: ${companyName}
Company Email: ${hrEmail}`

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
  }) {
    const hrEmail = data.companyEmail || DEFAULT_FROM_EMAIL
    const candidateName = getCandidateDisplayName(data.candidateName, data.candidateEmail)
    const companyName = data.companyName || '[Company Name]'
    const jobTitle = data.jobTitle || '[Job Title]'

    const subject = `Your application for ${jobTitle} at ${companyName} is under review`

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
    <p>Kind regards,<br>
    <strong>${companyName}</strong><br>
    <strong>HR contact:</strong> ${hrEmail}</p>
  </div>
</body>
</html>
    `

    const text = `Dear ${candidateName},

Thank you for applying for the ${jobTitle} role at ${companyName}.

Your CV has been received and assessed. Your profile is still under review by our hiring team. This is not a rejection — we may need a little more time to evaluate your fit against the role requirements.

We will contact you again if we move forward with your application. If you have questions, please reach us at ${hrEmail}.

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
      <p>A new application has been received for <strong>${cleanedJobTitle}</strong> at <strong>${companyName}</strong>.</p>
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

A new application has been received for ${cleanedJobTitle} at ${companyName}.

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
  }) {
    const to = Array.from(new Set(data.recipients.filter(Boolean))).join(',')
    if (!to) return

    const cleanedJobTitle = cleanJobTitle(data.jobTitle || '[Job Title]')
    const companyName = data.companyName || '[Company Name]'
    const deadline = new Date(data.applicationDeadline)
    const deadlineText = isNaN(deadline.getTime()) ? data.applicationDeadline : deadline.toLocaleString()
    const recommendedSubject = `${cleanedJobTitle} at ${companyName}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D2DDD; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .highlight { background: #e8f4fc; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #2D2DDD; }
    .help-box { background: #fff8e6; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #e6a800; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Job Created Successfully</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p><strong>Your job posting has been created successfully.</strong></p>
      <ul>
        <li><strong>Company:</strong> ${companyName}</li>
        <li><strong>Role:</strong> ${cleanedJobTitle}</li>
        <li><strong>Application deadline:</strong> ${deadlineText}</li>
      </ul>
      <div class="highlight">
        <p><strong>What to do next:</strong> You have two options to send candidate applications to OptioHire for AI screening and ranking:</p>
        <ol style="margin-top: 12px; padding-left: 20px;">
          <li><strong>Option 1:</strong> Set up email forwarding rules (recommended for high volume)</li>
          <li><strong>Option 2:</strong> Have candidates email directly to <strong>${APPLICATION_INBOX_EMAIL}</strong></li>
        </ol>
      </div>
      <p><strong>Step 1 – Subject line for email applications</strong></p>
      <p style="margin-top: 8px; padding: 10px; background: #fff; border-radius: 6px; border: 1px dashed #ccc;"><code>${recommendedSubject}</code></p>
      <p>Use this exact subject in your job advert and tell candidates to use it when emailing their CVs. This lets OptioHire route applications to the correct job and company.</p>
      <p><strong>Option 1: Set up email forwarding (Gmail example)</strong></p>
      <p>Forward application emails from your inbox to OptioHire:</p>
      <ol>
        <li>Open Gmail logged in as the inbox where candidates will send applications (e.g. your HR email).</li>
        <li>Click the gear icon → <strong>See all settings</strong> → <strong>Forwarding and POP/IMAP</strong>.</li>
        <li>Under “Forwarding”, click <strong>Add a forwarding address</strong> and enter <strong>${APPLICATION_INBOX_EMAIL}</strong>.</li>
        <li>Confirm the forwarding address using the verification link Google sends.</li>
        <li>Add a filter (Settings → <strong>Filters and blocked addresses</strong>) with <strong>Subject</strong> contains <code>${recommendedSubject}</code> and choose “Forward” to <strong>${APPLICATION_INBOX_EMAIL}</strong>.</li>
      </ol>
      <p><strong>Other email providers (Outlook, work email, etc.)</strong></p>
      <p>Create a rule/filter that forwards emails where the <strong>Subject</strong> contains <code>${recommendedSubject}</code> to <strong>${APPLICATION_INBOX_EMAIL}</strong>.</p>
      
      <p><strong>Option 2: Direct email to OptioHire</strong></p>
      <p>Alternatively, you can have candidates email their applications directly to:</p>
      <p style="margin-top: 8px; padding: 10px; background: #fff; border-radius: 6px; border: 1px dashed #ccc; font-weight: bold;">
        <strong>${APPLICATION_INBOX_EMAIL}</strong>
      </p>
      <p>Make sure candidates use the subject line <code>${recommendedSubject}</code> so we can route their application to the correct job.</p>
      
      <div class="help-box">
        <p><strong>Need help?</strong> If you need assistance setting up forwarding rules or have questions about either option, contact <a href="mailto:developer@optiohire.com">developer@optiohire.com</a> and we’ll guide you through it.</p>
      </div>
      <p>Best regards,<br>OptioHire</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `Job Created Successfully

Your job posting has been created successfully.

Company: ${companyName}
Role: ${cleanedJobTitle}
Application deadline: ${deadlineText}

WHAT TO DO NEXT: You have two options to send candidate applications to OptioHire for AI screening and ranking:

  Option 1: Set up email forwarding rules (recommended for high volume)
  Option 2: Have candidates email directly to ${APPLICATION_INBOX_EMAIL}

Step 1 – Subject line for email applications:

  ${recommendedSubject}

Use this exact subject in your job advert and tell candidates to use it when emailing their CVs.

OPTION 1: Set up email forwarding (Gmail example):
Forward application emails from your inbox to OptioHire:
  1) Open Gmail logged in as the inbox where candidates will send applications (e.g. your HR email).
  2) Go to Settings → See all settings → Forwarding and POP/IMAP.
  3) Under “Forwarding”, click “Add a forwarding address” and enter "${APPLICATION_INBOX_EMAIL}".
  4) Confirm the forwarding address using the verification link Google sends.
  5) Add a filter where Subject contains "${recommendedSubject}" and choose to forward those emails to "${APPLICATION_INBOX_EMAIL}".

Other email providers (Outlook, work email, etc.):
Create a rule/filter that forwards emails where the Subject contains "${recommendedSubject}" to "${APPLICATION_INBOX_EMAIL}".

OPTION 2: Direct email to OptioHire:
Alternatively, you can have candidates email their applications directly to: ${APPLICATION_INBOX_EMAIL}
Make sure candidates use the subject line "${recommendedSubject}" so we can route their application to the correct job.

Need help? If you need assistance setting up forwarding rules or have questions about either option, contact developer@optiohire.com and we'll guide you through it.

Best regards,
OptioHire`

    await this.sendEmail({
      to,
      subject: `Job posted – ${cleanedJobTitle} at ${companyName}`,
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
      <p>Your job posting <strong>${cleanedJobTitle}</strong> at <strong>${companyName}</strong> has reached <strong>${total}</strong> applications.</p>
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
    
    // Final fallback - use configured default (applicationsoptiohire@gmail.com)
    return DEFAULT_FROM_EMAIL
  }

  /**
   * Interview Scheduled Email
   * sendInterviewSchedule(candidate_email, jobTitle, meeting_time, meetingLink)
   */
  async sendInterviewSchedule(data: {
    candidate_email: string
    jobTitle: string
    meeting_time: string
    meetingLink: string
    candidateName?: string
    companyName?: string
  }) {
    const meetingDate = new Date(data.meeting_time).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })

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
    .info-box { background: white; padding: 15px; border-left: 4px solid #2D2DDD; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Scheduled</h1>
    </div>
    <div class="content">
      <p>Hi ${data.candidateName || 'Candidate'},</p>
      <p>Your interview for <strong>${data.jobTitle}</strong> has been scheduled.</p>
      <div class="info-box">
        <p><strong>Date & Time:</strong> ${meetingDate}</p>
        <p><strong>Meeting Link:</strong> <a href="${data.meetingLink}" class="button">Join Interview</a></p>
      </div>
      <p>Please arrive 5 minutes early and have your documents ready.</p>
      <p>Best regards,<br>${data.companyName || 'Hiring Team'}</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Interview Scheduled

Hi ${data.candidateName || 'Candidate'},

Your interview for ${data.jobTitle} has been scheduled.

Date & Time: ${meetingDate}
Meeting Link: ${data.meetingLink}

Please arrive 5 minutes early and have your documents ready.

Best regards,
${data.companyName || 'Hiring Team'}
    `

    await this.sendEmail({
      to: data.candidate_email,
      subject: `Interview Scheduled - ${data.jobTitle}`,
      html,
      text
    })
  }

  /**
   * HR Interview Confirmation Email
   * sendHRInterviewConfirmation(hr_email, candidate, time)
   */
  async sendHRInterviewConfirmation(data: {
    hr_email: string
    candidate: {
      name: string
      email: string
    }
    time: string
    jobTitle: string
    meetingLink: string
    companyName?: string
  }) {
    const meetingDate = new Date(data.time).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2D2DDD; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .info-box { background: white; padding: 15px; border-left: 4px solid #2D2DDD; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi,</p>
      <p>An interview has been scheduled:</p>
      <div class="info-box">
        <p><strong>Candidate:</strong> ${data.candidate.name} (${data.candidate.email})</p>
        <p><strong>Job:</strong> ${data.jobTitle}</p>
        <p><strong>Date & Time:</strong> ${meetingDate}</p>
        <p><strong>Meeting Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>
      </div>
      <p>Best regards,<br>HireBit System</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
Interview Confirmed

An interview has been scheduled:

Candidate: ${data.candidate.name} (${data.candidate.email})
Job: ${data.jobTitle}
Date & Time: ${meetingDate}
Meeting Link: ${data.meetingLink}

Best regards,
HireBit System
    `

    await this.sendEmail({
      to: data.hr_email,
      subject: `Interview Scheduled - ${data.candidate.name} for ${data.jobTitle}`,
      html,
      text
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
      throw error
    }
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

