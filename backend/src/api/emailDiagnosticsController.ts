import { Request, Response } from 'express'
import { EmailService } from '../services/emailService.js'
import { emailReaderStatus } from '../server/email-reader.js'
import { logger } from '../utils/logger.js'

/**
 * Check email service configuration and test sending
 */
export async function checkEmailService(req: Request, res: Response) {
  try {
    const emailService = new EmailService()
    const isConnected = await emailService.verifyConnection()
    
    // Check configuration
    const useResend = process.env.USE_RESEND === 'true' || !!process.env.RESEND_API_KEY
    const useSendGrid = process.env.USE_SENDGRID === 'true' || !!process.env.SENDGRID_API_KEY
    const mailUser = process.env.MAIL_USER || process.env.SMTP_USER
    const mailPass = process.env.MAIL_PASS || process.env.SMTP_PASS
    
    return res.json({
      connected: isConnected,
      provider: useResend ? 'resend' : (useSendGrid ? 'sendgrid' : 'smtp'),
      configured: useResend || useSendGrid || (!!mailUser && !!mailPass),
      hasCredentials: !!mailUser && !!mailPass,
      resendConfigured: useResend,
      sendGridConfigured: useSendGrid,
      smtpConfigured: !!mailUser && !!mailPass,
      fromEmail: process.env.MAIL_FROM || process.env.DEFAULT_FROM_EMAIL || 'applicationsoptiohire@gmail.com'
    })
  } catch (err: any) {
    logger.error('Email service check error:', err)
    return res.status(500).json({ error: err.message || 'Failed to check email service' })
  }
}

/**
 * Test sending an email
 */
export async function testEmailSend(req: Request, res: Response) {
  try {
    const { to, subject = 'Test Email from OptioHire' } = req.body
    if (!to) {
      return res.status(400).json({ error: 'to email address is required' })
    }

    const emailService = new EmailService()
    await emailService.sendEmail({
      to,
      subject,
      html: '<p>This is a test email from OptioHire.</p>',
      text: 'This is a test email from OptioHire.',
      emailType: 'test'
    })

    return res.json({ success: true, message: 'Test email sent successfully' })
  } catch (err: any) {
    logger.error('Test email send error:', err)
    return res.status(500).json({ 
      error: err.message || 'Failed to send test email',
      details: err.response || err.code || 'Unknown error'
    })
  }
}

/**
 * Get email reader status
 */
export async function getEmailReaderStatus(req: Request, res: Response) {
  try {
    const imapHost = process.env.IMAP_HOST
    const imapUser = process.env.IMAP_USER
    const imapPass = process.env.IMAP_PASS ? '***configured***' : null
    
    const isImapLimit = (emailReaderStatus.lastError || '').toLowerCase().includes('too many simultaneous connections')
    const isAuthError = (emailReaderStatus.lastError || '').toLowerCase().includes('authentication')

    return res.json({
      ...emailReaderStatus,
      config: {
        imapHost: imapHost || 'not set',
        imapUser: imapUser || 'not set',
        imapPass: imapPass ? 'configured' : 'not set',
        imapPort: process.env.IMAP_PORT || '993',
        imapSecure: process.env.IMAP_SECURE !== 'false',
        pollInterval: process.env.IMAP_POLL_MS || '1000'
      },
      recommendations: {
        ...(emailReaderStatus.disabledReason ? { 
          action: 'Configure missing IMAP credentials in backend/.env',
          required: ['IMAP_HOST', 'IMAP_USER', 'IMAP_PASS']
        } : {}),
        ...(isImapLimit ? {
          action: 'Mailbox provider is rate-limiting IMAP sessions',
          remediation: [
            'Ensure only one backend instance runs email reader',
            'Increase IMAP_POLL_MS (e.g. 30000 or more)',
            'Review mailbox security settings and active IMAP sessions'
          ]
        } : {}),
        ...(isAuthError ? {
          action: 'IMAP authentication failed',
          remediation: [
            'Regenerate Gmail app password',
            'Update IMAP_USER and IMAP_PASS in backend/.env',
            'Restart backend after env update'
          ]
        } : {}),
        ...(emailReaderStatus.lastError ? {
          action: 'Check IMAP credentials and network connectivity',
          error: emailReaderStatus.lastError
        } : {})
      }
    })
  } catch (err: any) {
    logger.error('Email reader status error:', err)
    return res.status(500).json({ error: err.message || 'Failed to get email reader status' })
  }
}
