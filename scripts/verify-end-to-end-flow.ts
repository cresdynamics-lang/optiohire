/**
 * Verify end-to-end email watcher flow
 * Run: cd backend && npx tsx ../scripts/verify-end-to-end-flow.ts
 */

import '../backend/src/utils/env.js'
import { query, pool } from '../backend/src/db/index.js'

async function verifyFlow() {
  try {
    console.log('🔍 Verifying End-to-End Email Watcher Flow...\n')
    
    // 1. Check email watcher status
    console.log('1️⃣ Checking Email Watcher Status...')
    try {
      const healthResponse = await fetch('http://localhost:3001/health/email-reader')
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        const emailReader = health.emailReader || {}
        console.log(`   ✅ Enabled: ${emailReader.enabled ? 'YES' : 'NO'}`)
        console.log(`   ✅ Running: ${emailReader.running ? 'YES' : 'NO'}`)
        console.log(`   📅 Last Processed: ${emailReader.lastProcessedAt || 'never'}`)
        console.log(`   ⚠️  Last Error: ${emailReader.lastError || 'none'}`)
        console.log(`   📧 IMAP User: ${process.env.IMAP_USER || 'not set'}`)
        console.log(`   ⏱️  Poll Interval: ${process.env.IMAP_POLL_MS || '5000'}ms (${parseInt(process.env.IMAP_POLL_MS || '5000') / 1000}s)`)
        
        if (!emailReader.enabled || !emailReader.running) {
          console.log('\n   ❌ Email watcher is NOT active!')
          if (emailReader.disabledReason) {
            console.log(`   Reason: ${emailReader.disabledReason}`)
          }
        } else {
          console.log('\n   ✅ Email watcher is ACTIVE and monitoring inbox')
        }
      } else {
        console.log('   ⚠️  Could not check email watcher status (backend may not be running)')
      }
    } catch (err: any) {
      console.log(`   ⚠️  Could not check email watcher status: ${err.message}`)
    }

    // 2. Check recent applications (last 24 hours)
    console.log('\n2️⃣ Checking Recent Applications (Last 24 Hours)...')
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
      WHERE a.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY a.created_at DESC
      LIMIT 10`
    )

    console.log(`   Found ${recentApps.length} application(s) in last 24 hours`)
    if (recentApps.length > 0) {
      recentApps.forEach((app, idx) => {
        console.log(`\n   ${idx + 1}. ${app.candidate_name || 'Unknown'} (${app.email})`)
        console.log(`      Job: ${app.job_title} at ${app.company_name}`)
        console.log(`      Status: ${app.ai_status || 'PENDING'}`)
        console.log(`      Score: ${app.ai_score !== null ? app.ai_score.toFixed(1) : 'Not scored'}`)
        console.log(`      Created: ${app.created_at.toISOString()}`)
      })
    } else {
      console.log('   ⚠️  No applications found in last 24 hours')
      console.log('   💡 Send a test email with CV to applicationsoptiohire@gmail.com')
    }

    // 3. Check if ranking emails were sent
    console.log('\n3️⃣ Checking Ranking Emails Sent...')
    const { rows: emailLogs } = await query<{
      email_id: string
      recipient_email: string
      subject: string
      email_type: string
      status: string
      sent_at: Date | null
      created_at: Date
    }>(
      `SELECT 
        email_id,
        recipient_email,
        subject,
        email_type,
        status,
        sent_at,
        created_at
      FROM email_logs
      WHERE email_type IN ('shortlist', 'rejection')
        AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10`
    )

    console.log(`   Found ${emailLogs.length} ranking email(s) sent in last 24 hours`)
    if (emailLogs.length > 0) {
      emailLogs.forEach((log, idx) => {
        console.log(`\n   ${idx + 1}. ${log.email_type.toUpperCase()} email`)
        console.log(`      To: ${log.recipient_email}`)
        console.log(`      Subject: ${log.subject}`)
        console.log(`      Status: ${log.status}`)
        console.log(`      Sent: ${log.sent_at ? log.sent_at.toISOString() : 'Not sent'}`)
      })
    } else {
      console.log('   ⚠️  No ranking emails found in last 24 hours')
    }

    // 4. Check applications that should have received emails but didn't
    console.log('\n4️⃣ Checking Missing Ranking Emails...')
    const { rows: missingEmails } = await query<{
      application_id: string
      email: string
      ai_status: string
      ai_score: number | null
      created_at: Date
    }>(
      `SELECT 
        a.application_id,
        a.email,
        a.ai_status,
        a.ai_score,
        a.created_at
      FROM applications a
      WHERE a.created_at >= NOW() - INTERVAL '24 hours'
        AND a.ai_status IN ('SHORTLIST', 'REJECT')
        AND NOT EXISTS (
          SELECT 1 
          FROM email_logs el
          WHERE el.recipient_email = a.email
            AND el.email_type IN ('shortlist', 'rejection')
            AND el.created_at >= a.created_at - INTERVAL '5 minutes'
            AND el.created_at <= a.created_at + INTERVAL '1 hour'
        )
      ORDER BY a.created_at DESC`
    )

    if (missingEmails.length > 0) {
      console.log(`   ⚠️  Found ${missingEmails.length} application(s) that should have received ranking emails:`)
      missingEmails.forEach((app, idx) => {
        console.log(`\n   ${idx + 1}. ${app.email}`)
        console.log(`      Status: ${app.ai_status}`)
        console.log(`      Score: ${app.ai_score !== null ? app.ai_score.toFixed(1) : 'N/A'}`)
        console.log(`      Created: ${app.created_at.toISOString()}`)
      })
    } else {
      console.log('   ✅ All ranked applications have received their feedback emails')
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Email Watcher: ${recentApps.length > 0 ? 'Processing emails' : 'Active but no recent emails'}`)
    console.log(`✅ Applications Created: ${recentApps.length} in last 24h`)
    console.log(`✅ Ranking Emails Sent: ${emailLogs.length} in last 24h`)
    console.log(`${missingEmails.length > 0 ? '⚠️' : '✅'} Missing Emails: ${missingEmails.length}`)
    
    console.log('\n💡 To Test End-to-End Flow:')
    console.log('   1. Send an email to applicationsoptiohire@gmail.com')
    console.log('   2. Subject: "Sales Role at Cres Dynamics" (or match an active job)')
    console.log('   3. Attach a CV (PDF or DOCX)')
    console.log('   4. Wait 5-10 seconds')
    console.log('   5. Check dashboard → View Candidates')
    console.log('   6. Candidate should appear ranked with score and status')
    console.log('   7. Candidate should receive shortlist/rejection email')

    await pool.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    console.error(err)
    await pool.end()
    process.exit(1)
  }
}

verifyFlow()
