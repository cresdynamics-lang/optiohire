/**
 * Retry sending ranking emails for applications that didn't receive them
 * Run: cd backend && npx tsx ../scripts/retry-missing-emails.ts
 */

import { query, pool } from '../backend/src/db/index.js'
import { EmailService } from '../backend/src/services/emailService.js'
import { CompanyRepository } from '../backend/src/repositories/companyRepository.js'

async function retryMissingEmails() {
  try {
    console.log('🔄 Retrying missing ranking emails...\n')

    const emailService = new EmailService()
    const companyRepo = new CompanyRepository()

    // Get applications with SHORTLIST or REJECT status from last 24 hours
    const { rows: applications } = await query<{
      application_id: string
      email: string
      candidate_name: string | null
      ai_status: string
      ai_score: number | null
      created_at: string
      job_title: string
      company_id: string
      company_name: string
      company_email: string | null
      company_domain: string | null
    }>(
      `SELECT 
        a.application_id,
        a.email,
        a.candidate_name,
        a.ai_status,
        a.ai_score,
        a.created_at,
        jp.job_title,
        c.company_id,
        c.company_name,
        c.company_email,
        c.company_domain
       FROM applications a
       JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       JOIN companies c ON a.company_id = c.company_id
       WHERE a.ai_status IN ('SHORTLIST', 'REJECT')
       AND a.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY a.created_at DESC`,
      []
    )

    if (applications.length === 0) {
      console.log('✅ No applications found that need emails\n')
      await pool.end()
      return
    }

    console.log(`Found ${applications.length} application(s) to check:\n`)

    let sentCount = 0
    let failedCount = 0

    for (const app of applications) {
      const emailType = app.ai_status === 'SHORTLIST' ? 'shortlist' : 'rejection'
      
      // Check if email was already sent
      const { rows: emailLogs } = await query<{
        email_id: string
        status: string
        sent_at: string | null
      }>(
        `SELECT email_id, status, sent_at
         FROM email_logs
         WHERE recipient_email = $1
         AND email_type = $2
         AND created_at > $3::timestamp - INTERVAL '1 hour'
         AND status = 'sent'
         ORDER BY created_at DESC
         LIMIT 1`,
        [app.email, emailType, app.created_at]
      )

      if (emailLogs.length > 0 && emailLogs[0].status === 'sent') {
        console.log(`✅ Email already sent: ${app.email} (${app.ai_status})`)
        continue
      }

      // Try to send email
      console.log(`📧 Sending ${emailType} email to ${app.email}...`)
      
      try {
        if (app.ai_status === 'SHORTLIST') {
          await emailService.sendShortlistEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: app.job_title,
            companyName: app.company_name,
            companyEmail: app.company_email,
            companyDomain: app.company_domain
          })
          console.log(`   ✅ Shortlist email sent successfully`)
          sentCount++
        } else if (app.ai_status === 'REJECT') {
          await emailService.sendRejectionEmail({
            candidateEmail: app.email,
            candidateName: app.candidate_name || 'Candidate',
            jobTitle: app.job_title,
            companyName: app.company_name,
            companyEmail: app.company_email,
            companyDomain: app.company_domain
          })
          console.log(`   ✅ Rejection email sent successfully`)
          sentCount++
        }
      } catch (err: any) {
        console.error(`   ❌ Failed to send email:`, err.message)
        failedCount++
      }
      
      console.log('')
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Emails sent: ${sentCount}`)
    console.log(`   ❌ Failed: ${failedCount}`)
    console.log(`   📧 Total checked: ${applications.length}`)

    await pool.end()
  } catch (err) {
    console.error('❌ Error:', err)
    await pool.end()
    process.exit(1)
  }
}

retryMissingEmails()
