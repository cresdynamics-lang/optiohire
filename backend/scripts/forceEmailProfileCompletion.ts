import 'dotenv/config'
import pg from 'pg'
import { EmailService } from '../src/services/emailService.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  const emailService = new EmailService()
  const frontendUrl = process.env.FRONTEND_URL || 'https://optiohire.com'

  try {
    const { rows } = await pool.query(`
      SELECT u.user_id, u.email, u.name 
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.user_id = cp.user_id
      WHERE (u.role = 'candidate' OR u.company_role = 'candidate')
      AND u.is_active = true
      AND (
        cp.profile_id IS NULL 
        OR (cp.bio IS NULL AND cp.job_category IS NULL AND cp.cv_url IS NULL)
      )
    `)

    console.log(`Found ${rows.length} candidates with incomplete profiles.`)

    let sentCount = 0
    for (const row of rows) {
      try {
        await emailService.sendProfileCompletionReminderEmail({
          candidateEmail: row.email,
          candidateName: row.name || row.email.split('@')[0],
          onboardingLink: `${frontendUrl}/candidate/profile`
        })
        sentCount++
        console.log(`Sent email to ${row.email}`)
      } catch (err) {
        console.error(`Failed to send email to ${row.email}:`, err)
      }
    }

    console.log(`Successfully sent ${sentCount} reminder emails.`)
  } catch (err) {
    console.error('Error running script:', err)
  } finally {
    await pool.end()
  }
}

run()
