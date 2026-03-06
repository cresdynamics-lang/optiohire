/**
 * Preflight check: DB connection and required tables (e.g. email_verification_codes).
 * Run before dev to ensure env and DB are ready.
 *
 * Usage: npm run check   (from backend)
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const connectionString = process.env.DATABASE_URL

async function main() {
  let ok = true

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in backend/.env')
    ok = false
  } else {
    const client = new pg.Client({ connectionString })
    try {
      await client.connect()
      await client.query('SELECT 1')
      const { rows } = await client.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'email_verification_codes'
        LIMIT 1
      `)
      if (rows.length === 0) {
        console.error('❌ Table email_verification_codes missing. Run: npm run db:schema')
        ok = false
      } else {
        console.log('✅ Database connected, email_verification_codes exists')
      }
      await client.end()
    } catch (e: any) {
      console.error('❌ Database:', e.message)
      ok = false
    }
  }

  const hasResend = !!(process.env.RESEND_API_KEY || process.env.USE_RESEND === 'true')
  const hasSmtp = !!(process.env.SMTP_USER && process.env.SMTP_PASS) || !!(process.env.MAIL_USER && process.env.MAIL_PASS)
  if (hasResend) {
    console.log('✅ Email: Resend configured')
  } else if (hasSmtp) {
    console.log('✅ Email: SMTP configured')
  } else {
    console.warn('⚠️  Email: No RESEND_API_KEY or SMTP credentials (OTP/emails may fail)')
  }

  if (!ok) process.exit(1)
  console.log('✅ Preflight OK')
}

main()
