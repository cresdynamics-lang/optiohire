/**
 * Check for applications that were scored but didn't receive ranking emails
 * Run: cd backend && npx tsx ../scripts/check-missing-emails.ts
 */

import { query, pool } from '../backend/src/db/index.js'

async function checkMissingEmails() {
  try {
    console.log('🔍 Checking for applications that may have missed ranking emails...\n')

    // Get applications with SHORTLIST or REJECT status from last 24 hours
    const { rows: applications } = await query<{
      application_id: string
      email: string
      candidate_name: string | null
      ai_status: string
      ai_score: number | null
      created_at: string
      job_title: string
      company_name: string
    }>(
      `SELECT 
        a.application_id,
        a.email,
        a.candidate_name,
        a.ai_status,
        a.ai_score,
        a.created_at,
        jp.job_title,
        c.company_name
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       JOIN companies c ON a.company_id = c.company_id
       WHERE a.ai_status IN ('SHORTLIST', 'REJECT')
       AND a.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY a.created_at DESC`,
      []
    )

    if (applications.length === 0) {
      console.log('✅ No recent applications found\n')
      await pool.end()
      return
    }

    console.log(`Found ${applications.length} application(s) with SHORTLIST/REJECT status:\n`)

    // Check email logs for these applications
    for (const app of applications) {
      const emailType = app.ai_status === 'SHORTLIST' ? 'shortlist' : 'rejection'
      
      const { rows: emailLogs } = await query<{
        email_id: string
        recipient_email: string
        email_type: string
        status: string
        sent_at: string | null
      }>(
        `SELECT email_id, recipient_email, email_type, status, sent_at
         FROM email_logs
         WHERE recipient_email = $1
         AND email_type = $2
         AND created_at > $3::timestamp - INTERVAL '1 hour'
         ORDER BY created_at DESC
         LIMIT 1`,
        [app.email, emailType, app.created_at]
      )

      const hasEmailLog = emailLogs.length > 0 && emailLogs[0].status === 'sent'
      
      if (!hasEmailLog) {
        console.log(`⚠️  MISSING EMAIL:`)
        console.log(`   Application ID: ${app.application_id}`)
        console.log(`   Candidate: ${app.candidate_name || app.email}`)
        console.log(`   Email: ${app.email}`)
        console.log(`   Status: ${app.ai_status}`)
        console.log(`   Score: ${app.ai_score}`)
        console.log(`   Job: ${app.job_title} at ${app.company_name}`)
        console.log(`   Created: ${app.created_at}`)
        console.log(`   Expected email type: ${emailType}`)
        console.log('')
      } else {
        console.log(`✅ Email sent:`)
        console.log(`   ${app.candidate_name || app.email} (${app.email})`)
        console.log(`   Status: ${app.ai_status}, Score: ${app.ai_score}`)
        console.log(`   Email sent at: ${emailLogs[0].sent_at}`)
        console.log('')
      }
    }

    await pool.end()
  } catch (err) {
    console.error('❌ Error:', err)
    await pool.end()
    process.exit(1)
  }
}

checkMissingEmails()
