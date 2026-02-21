/**
 * Test script: send a 6-digit verification code to an existing user's email.
 * Usage: npx tsx scripts/send-test-verification-code.ts <email>
 * Example: npx tsx scripts/send-test-verification-code.ts user@example.com
 *
 * Requires: DATABASE_URL, RESEND_API_KEY (or SMTP) in backend/.env
 */
import 'dotenv/config'
import { query } from '../src/db/index.js'
import { EmailService } from '../src/services/emailService.js'

const VERIFICATION_CODE_EXPIRY_HOURS = 24

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npx tsx scripts/send-test-verification-code.ts <email>')
    console.error('Example: npx tsx scripts/send-test-verification-code.ts test@optiohire.com')
    process.exit(1)
  }

  const { rows: userRows } = await query<{ user_id: string; name: string | null }>(
    `SELECT user_id, name FROM users WHERE email = $1`,
    [email.toLowerCase()]
  )
  if (userRows.length === 0) {
    console.error(`User not found: ${email}. Create an account first or use an existing user email.`)
    process.exit(1)
  }

  const userId = userRows[0].user_id
  const userName = userRows[0].name || 'User'
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_CODE_EXPIRY_HOURS)

  try {
    await query(
      `INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`,
      [userId, email.toLowerCase(), code, expiresAt]
    )
  } catch (e) {
    console.error('Failed to save code. Ensure email_verification_codes table exists (run complete_schema.sql or add_email_verification.sql).', e)
    process.exit(1)
  }

  console.log('Code saved to DB. Sending email...')
  console.log('6-digit code (for manual check):', code)

  const emailService = new EmailService()
  try {
    await emailService.sendEmailVerificationCode(email.toLowerCase(), userName, code)
    console.log('Verification email sent to', email)
    console.log('Check inbox (and spam). Code:', code)
  } catch (err) {
    console.error('Email send failed:', err)
    console.log('Code was saved. You can verify at /auth/verify-email with code:', code)
    process.exit(1)
  }
}

main()
