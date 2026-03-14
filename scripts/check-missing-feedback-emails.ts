/**
 * Check why feedback emails aren't being sent to latest applicants
 * Run: cd backend && npx tsx ../scripts/check-missing-feedback-emails.ts
 */

import '../backend/src/utils/env.js'
import { query, pool } from '../backend/src/db/index.js'

async function checkMissingEmails() {
  try {
    console.log('🔍 Checking Missing Feedback Emails for Latest Applicants...\n')
    
    // 1. Get latest applications (last hour)
    console.log('1️⃣ Latest Applications (Last Hour):')
    const { rows: recentApps } = await query<{
      application_id: string
      candidate_name: string | null
      email: string
      ai_score: number | null
      ai_status: string | null
      created_at: Date
      job_title: string
      company_name: string
    }>(
      `SELECT 
        a.application_id,
        a.candidate_name,
        a.email,
        a.ai_score,
        a.ai_status,
        a.created_at,
        jp.job_title,
        c.company_name
      FROM applications a
      JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
      JOIN companies c ON jp.company_id = c.company_id
      WHERE a.created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY a.created_at DESC
      LIMIT 10`
    )

    if (recentApps.length === 0) {
      console.log('   ⚠️  No applications in the last hour')
      await pool.end()
      return
    }

    console.log(`   Found ${recentApps.length} application(s):\n`)
    
    for (const app of recentApps) {
      console.log(`   📧 ${app.candidate_name || 'Unknown'} (${app.email})`)
      console.log(`      Job: ${app.job_title} at ${app.company_name}`)
      console.log(`      Status: ${app.ai_status || 'PENDING'}`)
      console.log(`      Score: ${app.ai_score !== null ? app.ai_score.toFixed(1) : 'Not scored'}`)
      console.log(`      Created: ${app.created_at.toISOString()}`)
      
      // Check if email was sent
      const { rows: emailLogs } = await query<{
        email_id: string
        email_type: string
        status: string
        sent_at: Date | null
        created_at: Date
      }>(
        `SELECT 
          email_id,
          email_type,
          status,
          sent_at,
          created_at
        FROM email_logs
        WHERE recipient_email = $1
          AND email_type IN ('shortlist', 'rejection')
          AND created_at >= $2 - INTERVAL '10 minutes'
          AND created_at <= $2 + INTERVAL '1 hour'
        ORDER BY created_at DESC
        LIMIT 1`,
        [app.email, app.created_at]
      )
      
      if (emailLogs.length > 0) {
        const emailLog = emailLogs[0]
        console.log(`      ✅ Email sent: ${emailLog.email_type.toUpperCase()} (${emailLog.status})`)
        console.log(`         Sent at: ${emailLog.sent_at ? emailLog.sent_at.toISOString() : 'Not sent yet'}`)
      } else {
        console.log(`      ❌ MISSING EMAIL - No feedback email found!`)
        
        // Check what email should have been sent
        if (app.ai_status === 'SHORTLIST') {
          console.log(`      ⚠️  Should have sent: SHORTLIST email`)
        } else if (app.ai_status === 'REJECT' || app.ai_status === 'REJECTED') {
          console.log(`      ⚠️  Should have sent: REJECTION email`)
        } else if (app.ai_status === 'FLAG') {
          console.log(`      ℹ️  FLAG status - no email sent (requires manual review)`)
        } else {
          console.log(`      ⚠️  Status: ${app.ai_status} - may not trigger email`)
        }
      }
      console.log('')
    }

    // 2. Check applications that should have received emails but didn't
    console.log('\n2️⃣ Applications Missing Feedback Emails:')
    const { rows: missingEmails } = await query<{
      application_id: string
      email: string
      candidate_name: string | null
      ai_status: string
      ai_score: number | null
      created_at: Date
      job_title: string
    }>(
      `SELECT 
        a.application_id,
        a.email,
        a.candidate_name,
        a.ai_status,
        a.ai_score,
        a.created_at,
        jp.job_title
      FROM applications a
      JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
      WHERE a.created_at >= NOW() - INTERVAL '24 hours'
        AND a.ai_status IN ('SHORTLIST', 'REJECT')
        AND NOT EXISTS (
          SELECT 1 
          FROM email_logs el
          WHERE el.recipient_email = a.email
            AND el.email_type IN ('shortlist', 'rejection')
            AND el.created_at >= a.created_at - INTERVAL '10 minutes'
            AND el.created_at <= a.created_at + INTERVAL '1 hour'
        )
      ORDER BY a.created_at DESC`
    )

    if (missingEmails.length > 0) {
      console.log(`   ⚠️  Found ${missingEmails.length} application(s) missing feedback emails:\n`)
      missingEmails.forEach((app, idx) => {
        console.log(`   ${idx + 1}. ${app.candidate_name || app.email}`)
        console.log(`      Job: ${app.job_title}`)
        console.log(`      Status: ${app.ai_status}`)
        console.log(`      Score: ${app.ai_score !== null ? app.ai_score.toFixed(1) : 'N/A'}`)
        console.log(`      Created: ${app.created_at.toISOString()}`)
        console.log(`      Application ID: ${app.application_id}`)
        console.log('')
      })
    } else {
      console.log('   ✅ All applications have received feedback emails')
    }

    // 3. Check email service configuration
    console.log('\n3️⃣ Email Service Configuration:')
    console.log(`   USE_RESEND: ${process.env.USE_RESEND || 'not set'}`)
    console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'not set'}`)
    console.log(`   RESEND_DOMAIN: ${process.env.RESEND_DOMAIN || 'not set'}`)
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST ? 'configured' : 'not set'}`)
    console.log(`   SMTP_USER: ${process.env.SMTP_USER ? 'configured' : 'not set'}`)

    // 4. Summary and recommendations
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Recent Applications: ${recentApps.length}`)
    console.log(`Missing Feedback Emails: ${missingEmails.length}`)
    
    if (missingEmails.length > 0) {
      console.log('\n⚠️  ISSUE FOUND: Some applicants did not receive feedback emails')
      console.log('\n💡 Possible Causes:')
      console.log('   1. Email sending failed silently (check backend logs)')
      console.log('   2. Email service not configured correctly')
      console.log('   3. Email watcher did not trigger email sending')
      console.log('   4. Status check logic issue')
      console.log('\n🔧 Next Steps:')
      console.log('   1. Check backend logs for email sending errors')
      console.log('   2. Verify email service configuration')
      console.log('   3. Check email watcher logs for processing errors')
      console.log('   4. Run retry script: npx tsx ../scripts/retry-missing-emails.ts')
    } else {
      console.log('\n✅ All applicants received feedback emails')
    }

    await pool.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    console.error(err)
    await pool.end()
    process.exit(1)
  }
}

checkMissingEmails()
