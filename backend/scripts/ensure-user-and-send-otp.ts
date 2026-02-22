/**
 * Ensure a user exists (create with placeholder password if not), then send OTP.
 * Usage: npx tsx scripts/ensure-user-and-send-otp.ts <email> [name]
 * Example: npx tsx scripts/ensure-user-and-send-otp.ts nelsonochieng516@gmail.com Nelson
 *
 * Requires: DATABASE_URL, RESEND_API_KEY (or SMTP) in backend/.env
 */
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { pool, query } from '../src/db/index.js'
import { EmailService } from '../src/services/emailService.js'

const SALT_ROUNDS = 10
const VERIFICATION_CODE_EXPIRY_HOURS = 24
const PLACEHOLDER_PASSWORD = 'TestPassword123!'

async function main() {
  const email = process.argv[2]?.toLowerCase()
  const name = process.argv[3] || 'Test User'
  if (!email) {
    console.error('Usage: npx tsx scripts/ensure-user-and-send-otp.ts <email> [name]')
    process.exit(1)
  }

  const client = await pool.connect()
  try {
    let userId: string
    let userName: string

    const { rows: existing } = await client.query<{ user_id: string; name: string | null }>(
      `SELECT user_id, name FROM users WHERE email = $1`,
      [email]
    )
    if (existing.length > 0) {
      userId = existing[0].user_id
      userName = existing[0].name || name
      console.log('User already exists:', email)
    } else {
      const hash = await bcrypt.hash(PLACEHOLDER_PASSWORD, SALT_ROUNDS)
      const { rows: colCheck } = await client.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name IN ('name', 'company_role')
      `)
      const hasName = colCheck.some((r: { column_name: string }) => r.column_name === 'name')
      const cols = ['email', 'password_hash', 'role', 'is_active']
      const vals = ['$1', '$2', "'user'", 'true']
      const params: unknown[] = [email, hash]
      let n = 3
      if (hasName) {
        cols.push('name')
        vals.push(`$${n++}`)
        params.push(name)
      }
      const insertQuery = `INSERT INTO users (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING user_id`
      const { rows } = await client.query<{ user_id: string }>(insertQuery, params)
      userId = rows[0].user_id
      userName = name
      console.log('Created user:', email)
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + VERIFICATION_CODE_EXPIRY_HOURS)

    await query(
      `INSERT INTO email_verification_codes (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)`,
      [userId, email, code, expiresAt]
    )
    console.log('Code saved. Sending email...')
    console.log('6-digit code (for manual check):', code)

    const emailService = new EmailService()
    await emailService.sendEmailVerificationCode(email, userName, code)
    console.log('OTP email sent to', email)
    console.log('Check inbox (and spam). Code:', code)
  } catch (e) {
    console.error('Error:', e)
    process.exit(1)
  } finally {
    client.release()
  }
}

main()
