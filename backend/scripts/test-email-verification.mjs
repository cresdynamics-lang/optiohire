#!/usr/bin/env node
/**
 * Test email verification + welcome flow after running add_email_verification migration.
 * Usage: NOTIFICATION_TEST_TO=your@email.com node backend/scripts/test-email-verification.mjs
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'

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
} catch (e) {}

const TEST_EMAIL = process.env.NOTIFICATION_TEST_TO || process.env.MAIL_USER || 'test@example.com'

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  console.log('1. Checking email_verification_codes table and users...')
  const { rows: userRows } = await client.query(
    `SELECT user_id, email, name FROM users WHERE email = $1`,
    [TEST_EMAIL]
  )
  let userId, userEmail, userName
  if (userRows.length > 0) {
    userId = userRows[0].user_id
    userEmail = userRows[0].email
    userName = userRows[0].name || 'User'
    console.log(`   Using existing user: ${userEmail}`)
  } else {
    const { rows: anyUser } = await client.query(
      `SELECT user_id, email, name FROM users LIMIT 1`
    )
    if (anyUser.length === 0) {
      console.log('   No users in DB. Create an account via signup first, or set NOTIFICATION_TEST_TO=your@email.com and ensure that user exists.')
      client.release()
      await pool.end()
      process.exit(1)
    }
    userId = anyUser[0].user_id
    userEmail = anyUser[0].email
    userName = anyUser[0].name || 'User'
    console.log(`   Using first user in DB: ${userEmail} (sending verification to ${TEST_EMAIL})`)
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  console.log('2. Inserting verification code...')
  await client.query(
    `INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`,
    [userId, userEmail, code, expiresAt]
  )
  console.log(`   Code: ${code} (expires in 24h)`)

  console.log('3. Sending verification email...')
  const { EmailService } = await import('../dist/services/emailService.js')
  const emailService = new EmailService()
  await emailService.sendEmailVerificationCode(userEmail, userName, code)
  console.log(`   Sent to: ${userEmail}`)

  console.log('4. Simulating verify-email: mark code used, set email_verified, send welcome...')
  const { rows: codeRows } = await client.query(
    `SELECT code_id FROM email_verification_codes WHERE email = $1 AND code = $2 AND used = false`,
    [userEmail, code]
  )
  if (codeRows.length === 0) {
    console.log('   Code not found (wrong email?). Using code we just inserted.')
    const { rows: r2 } = await client.query(
      `SELECT code_id FROM email_verification_codes WHERE user_id = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1`,
      [userId, code]
    )
    if (r2.length > 0) {
      await client.query(`UPDATE email_verification_codes SET used = true WHERE code_id = $1`, [r2[0].code_id])
    }
  } else {
    await client.query(`UPDATE email_verification_codes SET used = true WHERE code_id = $1`, [codeRows[0].code_id])
  }
  try {
    await client.query(`UPDATE users SET email_verified = true WHERE user_id = $1`, [userId])
  } catch (e) {}
  await emailService.sendWelcomeEmail(userEmail, userName)
  console.log(`   Welcome email sent to: ${userEmail}`)

  client.release()
  await pool.end()
  console.log('\nDone. Check inbox for', userEmail, '(1) verification code, (2) welcome email.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
