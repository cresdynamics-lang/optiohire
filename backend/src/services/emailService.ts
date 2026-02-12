import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'
import fs from 'fs/promises'
import path from 'path'
import { cleanJobTitle } from '../utils/jobTitle.js'
import { SendGridService } from './sendGridService.js'
import { ResendService } from './resendService.js'

/** Default from address for candidate emails and fallback when company email is not set */
const DEFAULT_FROM_EMAIL = process.env.MAIL_FROM || process.env.DEFAULT_FROM_EMAIL || 'nelsonochieng516@gmail.com'

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
    } else if (this.useSendGrid) {
      this.sendGridService = new SendGridService()
      logger.info('Email service: Using SendGrid API (HTTPS - no firewall issues)')
    } else {
      // Fallback to SMTP
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

    // Generate from email: use company_email, companyDomain, or fallback
    const fromEmail = this.getCompanyEmail(data.companyEmail, data.companyDomain, data.companyName)
    
    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html: html // Send the HTML email
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

    // Generate from email: use company_email, companyDomain, or fallback
    const fromEmail = this.getCompanyEmail(data.companyEmail, data.companyDomain, data.companyName)
    
    await this.sendEmail({
      to: data.candidateEmail,
      from: fromEmail,
      subject,
      text,
      html: html // Send the HTML email
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
      <p>A new application has been received for <strong>${data.jobTitle}</strong>.</p>
      <p><strong>Candidate:</strong> ${data.candidateName}</p>
      <p><strong>Email:</strong> ${data.candidateEmail}</p>
      ${data.score !== null && data.score !== undefined ? `<p><strong>Score:</strong> ${data.score}/100</p>` : ''}
      ${data.status ? `<p><strong>Status:</strong> ${data.status}</p>` : ''}
      <p>${data.score !== null && data.score !== undefined ? 'The candidate has been evaluated.' : 'The candidate is being processed and scored. You\'ll receive updates once the evaluation is complete.'}</p>
      <p>Best regards,<br>HireBit System</p>
    </div>
  </div>
</body>
</html>
    `

    const text = `
New Applicant Received

A new application has been received for ${data.jobTitle}.

Candidate: ${data.candidateName}
Email: ${data.candidateEmail}
${data.score !== null && data.score !== undefined ? `Score: ${data.score}/100` : ''}
${data.status ? `Status: ${data.status}` : ''}

${data.score !== null && data.score !== undefined ? 'The candidate has been evaluated.' : 'The candidate is being processed and scored. You\'ll receive updates once the evaluation is complete.'}

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
    
    // Final fallback - use configured default (nelsonochieng516@gmail.com)
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
    <p style="font-size: 14px; color: #666;">If you have any questions, reply to this email or visit our help center.</p>
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #999; margin: 0;">Best regards,<br>The OptioHire Team</p>
  </div>
</body>
</html>
    `
    const text = `Welcome to OptioHire\n\nHello ${name || 'User'},\n\nYour email is confirmed. You're all set to use OptioHire to post jobs, screen candidates, and hire with confidence.\n\nGet started by creating your first job posting from your dashboard.\n\nBest regards,\nThe OptioHire Team`
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
  }) {
    const emailType = data.emailType || 'general'
    const recipientName = data.recipientName || null
    
    // Log email attempt
    let emailLogId: string | null = null
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
          JSON.stringify({ html: data.html, text: data.text, from: data.from })
        ]
      )
      emailLogId = rows[0]?.email_id || null
    } catch (logError) {
      logger.error('Failed to log email:', logError)
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
              `UPDATE email_logs SET status = 'sent', sent_at = now() WHERE email_id = $1`,
              [emailLogId]
            )
          } catch (updateError) {
            logger.error('Failed to update email log:', updateError)
          }
        }
        return
      } catch (error: any) {
        logger.warn(`Resend failed (e.g. domain not verified), falling back to SendGrid or SMTP: ${error.message}`)
        // So we can fall back to SMTP when Resend fails (e.g. sending from @gmail.com)
        if (!this.transporter) {
          this.initSMTP()
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
      
      // Verify transporter is configured
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
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
            `UPDATE email_logs SET status = 'sent', provider_message_id = $1, sent_at = now() WHERE email_id = $2`,
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
      
      await this.logEmail(data.to, data.subject, 'failed', errorMsg)
      throw error
    }
  }
}

