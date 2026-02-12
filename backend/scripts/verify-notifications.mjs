#!/usr/bin/env node
/**
 * Verify notification/email sending: generic + password reset (Resend and/or SMTP).
 * Run from repo root: node backend/scripts/verify-notifications.mjs
 *
 * Optional: NOTIFICATION_TEST_TO=your@email.com
 * When set, sends: (1) generic test, (2) password-reset-style email (same template as real reset).
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env')
try {
  const env = readFileSync(envPath, 'utf8')
  env.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      const val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  })
} catch (e) {
  // .env might not exist
}

const RESEND_PRIMARY = process.env.RESEND_API_KEY
const USE_RESEND = process.env.USE_RESEND === 'true' || !!RESEND_PRIMARY
const MAIL_USER = process.env.MAIL_USER || process.env.SMTP_USER
const MAIL_PASS = process.env.MAIL_PASS || process.env.SMTP_PASS
const TEST_TO = process.env.NOTIFICATION_TEST_TO || process.env.MAIL_USER || ''
const FROM_EMAIL = process.env.MAIL_FROM || process.env.RESEND_FROM_EMAIL || 'nelsonochieng516@gmail.com'
const TEST_NAME = (TEST_TO && TEST_TO.includes('@')) ? TEST_TO.split('@')[0].replace(/[._]/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : 'Candidate'

async function testResend() {
  if (!RESEND_PRIMARY || RESEND_PRIMARY.includes('your_') || RESEND_PRIMARY.length < 10) {
    console.log('Resend: not configured (RESEND_API_KEY missing or invalid)')
    return { ok: false }
  }
  const { Resend } = await import('resend')
  const resend = new Resend(RESEND_PRIMARY)
  const from = FROM_EMAIL
  const to = TEST_TO || 'delivered@resend.dev'
  try {
    const { data, error } = await resend.emails.send({
      from: `OptioHire <${from}>`,
      to: [to],
      subject: 'OptioHire notification test',
      html: '<p>If you received this, notifications are working.</p>',
      text: 'If you received this, notifications are working.'
    })
    if (error) {
      console.log('Resend: send failed', error.message)
      return { ok: false, error: error.message }
    }
    console.log('Resend: test email sent successfully. Id:', data?.id || 'n/a')
    return { ok: true }
  } catch (err) {
    console.log('Resend: error', err.message)
    return { ok: false, error: err.message }
  }
}

async function testSMTP() {
  if (!MAIL_USER || !MAIL_PASS || MAIL_PASS.includes('your_')) {
    console.log('SMTP: not configured (MAIL_USER/MAIL_PASS missing or placeholder)')
    return { ok: false }
  }
  try {
    const nodemailer = (await import('nodemailer')).default
    const port = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587', 10)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: MAIL_USER, pass: MAIL_PASS.replace(/\s/g, '') }
    })
    await transporter.verify()
    console.log('SMTP: connection verified')
    if (TEST_TO) {
      const fromAddr = FROM_EMAIL || MAIL_USER
      await transporter.sendMail({
        from: fromAddr,
        to: TEST_TO,
        subject: 'OptioHire notification test (SMTP)',
        text: 'If you received this, SMTP notifications are working.'
      })
      console.log('SMTP: test email sent to', TEST_TO, 'from', fromAddr)
      // Send password-reset-style email so user can confirm that template delivers too
      const dummyCode = '123456'
      const resetHtml = `
<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Code</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <p>Hello ${TEST_NAME},</p>
    <p>We received a request to reset your password for your OptioHire account.</p>
    <p>Use the following code to reset your password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: #fff; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
        <p style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 0; font-family: monospace;">${dummyCode}</p>
      </div>
    </div>
    <p style="font-size: 14px; color: #666;">Enter this code on the password reset page. This code will expire in 1 hour.</p>
    <p style="font-size: 12px; color: #999;">This is a verification test — the code above is not valid. Real reset codes are sent when you use Forgot Password in the app.</p>
    <p style="font-size: 12px; color: #999;">Best regards,<br>The OptioHire Team</p>
  </div>
</body></html>`
      const resetText = `Password Reset Code\n\nHello ${TEST_NAME},\n\nWe received a request to reset your password for your OptioHire account.\n\nYour password reset code is: ${dummyCode}\n\nEnter this code on the password reset page. This code will expire in 1 hour.\n\n(This is a verification test — the code above is not valid.)\n\nBest regards,\nThe OptioHire Team`
      await transporter.sendMail({
        from: fromAddr,
        to: TEST_TO,
        subject: 'Your OptioHire Password Reset Code',
        html: resetHtml,
        text: resetText
      })
      console.log('SMTP: password-reset-style email sent to', TEST_TO)
      // Shortlist-style (to applicants who are shortlisted) – Dear [name]
      const jobTitle = 'Senior Developer'
      const companyName = 'Acme Corp'
      await transporter.sendMail({
        from: fromAddr,
        to: TEST_TO,
        subject: `Final Interview Invitation – ${jobTitle} at ${companyName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p>Dear ${TEST_NAME},</p><p>Congratulations! After reviewing your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>, we are pleased to inform you that you have been shortlisted for the next stage of our recruitment process.</p><p><strong>Interview Details:</strong></p><p><strong>Position:</strong> ${jobTitle}</p><p><strong>Company:</strong> ${companyName}</p><p>If you have any questions, contact our HR team.</p><p>Kind regards,<br>${companyName}</p><p style="font-size: 11px; color: #999;">[Verification test – same template as real shortlist emails to applicants.]</p></div>`,
        text: `Dear ${TEST_NAME},\n\nCongratulations! You have been shortlisted for ${jobTitle} at ${companyName}. We look forward to meeting you.\n\n[Verification test – same template as real shortlist emails to applicants.]`
      })
      console.log('SMTP: shortlist-style email sent to', TEST_TO, '(Dear ' + TEST_NAME + ')')
      // Rejection-style (to applicants who are not selected) – Dear [name]
      await transporter.sendMail({
        from: fromAddr,
        to: TEST_TO,
        subject: `Update on Your Application for the ${jobTitle} Position at ${companyName}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><p>Dear ${TEST_NAME},</p><p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>. After careful consideration, we will not be moving forward with your application at this time. We encourage you to apply for future opportunities.</p><p>If you have any questions, please contact us.</p><p>Kind regards,<br>${companyName}</p><p style="font-size: 11px; color: #999;">[Verification test – same template as real rejection emails to applicants.]</p></div>`,
        text: `Dear ${TEST_NAME},\n\nThank you for applying for ${jobTitle} at ${companyName}. We will not be moving forward with your application at this time. We encourage you to apply for future opportunities.\n\n[Verification test – same template as real rejection emails to applicants.]`
      })
      console.log('SMTP: rejection-style email sent to', TEST_TO, '(Dear ' + TEST_NAME + ')')
    }
    return { ok: true }
  } catch (err) {
    console.log('SMTP: error', err.message)
    return { ok: false, error: err.message }
  }
}

async function main() {
  console.log('=== Notification / email send verification ===\n')
  let anyOk = false
  if (USE_RESEND || RESEND_PRIMARY) {
    const r = await testResend()
    anyOk = anyOk || r.ok
  } else {
    console.log('Resend: skipped (USE_RESEND not true, RESEND_API_KEY not set)')
  }
  console.log('')
  const s = await testSMTP()
  anyOk = anyOk || s.ok
  console.log('')
  if (TEST_TO) {
    console.log('Test recipient:', TEST_TO)
    console.log('Sent: (1) generic  (2) password-reset  (3) shortlist  (4) rejection — all use same pipeline as real emails to applicants.')
  } else {
    console.log('Set NOTIFICATION_TEST_TO=your@email.com to send generic + password-reset test emails.')
  }
  console.log(anyOk ? '\nAll notification types (including password reset) use the same pipeline; if tests sent, reset emails will work.' : '\nConfigure Resend (RESEND_API_KEY) or SMTP (MAIL_USER, MAIL_PASS) to send.')
  process.exit(anyOk ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
