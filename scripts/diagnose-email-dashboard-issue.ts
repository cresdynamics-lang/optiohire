/**
 * Diagnose why instant emails aren't being sent and dashboard isn't updating
 * Run: cd backend && npx tsx ../scripts/diagnose-email-dashboard-issue.ts
 */

import '../backend/src/utils/env.js'
import { query, pool } from '../backend/src/db/index.js'

async function diagnose() {
  try {
    console.log('🔍 Diagnosing Email & Dashboard Issues...\n')
    
    // 1. Check recent applications (last 10 minutes)
    console.log('1️⃣ Recent Applications (Last 10 Minutes):')
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
      WHERE a.created_at >= NOW() - INTERVAL '10 minutes'
      ORDER BY a.created_at DESC`
    )

    console.log(`   Found ${recentApps.length} application(s) in last 10 minutes\n`)
    
    if (recentApps.length === 0) {
      console.log('   ⚠️  No recent applications found')
      console.log('   💡 Email watcher may not be processing emails')
    } else {
      recentApps.forEach((app, idx) => {
        console.log(`   ${idx + 1}. ${app.candidate_name || app.email}`)
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
            AND created_at >= $2 - INTERVAL '5 minutes'
            AND created_at <= $2 + INTERVAL '10 minutes'
          ORDER BY created_at DESC
          LIMIT 1`,
          [app.email, app.created_at]
        )
        
        if (emailLogs.length > 0) {
          const log = emailLogs[0]
          console.log(`      ✅ Email sent: ${log.email_type} (${log.status}) at ${log.sent_at ? log.sent_at.toISOString() : 'pending'}`)
        } else {
          console.log(`      ❌ NO EMAIL SENT`)
          if (app.ai_status === 'SHORTLIST' || app.ai_status === 'REJECT') {
            console.log(`      ⚠️  Should have sent ${app.ai_status === 'SHORTLIST' ? 'shortlist' : 'rejection'} email`)
          }
        }
        console.log('')
      })
    }

    // 2. Check email logs for recent activity
    console.log('\n2️⃣ Recent Email Activity (Last 10 Minutes):')
    const { rows: recentEmails } = await query<{
      email_id: string
      recipient_email: string
      email_type: string
      status: string
      sent_at: Date | null
      created_at: Date
      error_message: string | null
    }>(
      `SELECT 
        email_id,
        recipient_email,
        email_type,
        status,
        sent_at,
        created_at,
        error_message
      FROM email_logs
      WHERE created_at >= NOW() - INTERVAL '10 minutes'
      ORDER BY created_at DESC
      LIMIT 10`
    )

    console.log(`   Found ${recentEmails.length} email log entry/entries\n`)
    if (recentEmails.length > 0) {
      recentEmails.forEach((email, idx) => {
        console.log(`   ${idx + 1}. ${email.email_type.toUpperCase()} to ${email.recipient_email}`)
        console.log(`      Status: ${email.status}`)
        console.log(`      Created: ${email.created_at.toISOString()}`)
        console.log(`      Sent: ${email.sent_at ? email.sent_at.toISOString() : 'Not sent'}`)
        if (email.error_message) {
          console.log(`      ❌ Error: ${email.error_message}`)
        }
        console.log('')
      })
    } else {
      console.log('   ⚠️  No email activity in last 10 minutes')
    }

    // 3. Check applications that should have received emails
    console.log('\n3️⃣ Applications Missing Emails:')
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
      WHERE a.created_at >= NOW() - INTERVAL '1 hour'
        AND a.ai_status IN ('SHORTLIST', 'REJECT')
        AND NOT EXISTS (
          SELECT 1 
          FROM email_logs el
          WHERE el.recipient_email = a.email
            AND el.email_type IN ('shortlist', 'rejection')
            AND el.created_at >= a.created_at - INTERVAL '10 minutes'
            AND el.created_at <= a.created_at + INTERVAL '1 hour'
            AND el.status = 'sent'
        )
      ORDER BY a.created_at DESC`
    )

    if (missingEmails.length > 0) {
      console.log(`   ⚠️  Found ${missingEmails.length} application(s) missing emails:\n`)
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
      console.log('   ✅ All applications have received their emails')
    }

    // 4. Check email watcher status
    console.log('\n4️⃣ Email Watcher Status:')
    try {
      const healthResponse = await fetch('http://localhost:3001/health/email-reader')
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        const emailReader = health.emailReader || {}
        console.log(`   Enabled: ${emailReader.enabled ? 'YES ✅' : 'NO ❌'}`)
        console.log(`   Running: ${emailReader.running ? 'YES ✅' : 'NO ❌'}`)
        console.log(`   Last Processed: ${emailReader.lastProcessedAt || 'never'}`)
        console.log(`   Last Error: ${emailReader.lastError || 'none'}`)
        
        if (!emailReader.enabled || !emailReader.running) {
          console.log('\n   ⚠️  Email watcher is NOT active!')
        }
      } else {
        console.log('   ⚠️  Could not check email watcher status')
      }
    } catch (err: any) {
      console.log(`   ⚠️  Could not reach backend: ${err.message}`)
    }

    // 5. Summary and recommendations
    console.log('\n' + '='.repeat(60))
    console.log('📊 DIAGNOSIS SUMMARY')
    console.log('='.repeat(60))
    console.log(`Recent Applications: ${recentApps.length}`)
    console.log(`Recent Email Logs: ${recentEmails.length}`)
    console.log(`Missing Emails: ${missingEmails.length}`)
    
    if (missingEmails.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:')
      console.log('   1. Some applications did not receive feedback emails')
      console.log('   2. Check backend logs for email sending errors')
      console.log('   3. Run retry script: npx tsx ../scripts/retry-missing-emails.ts')
    }
    
    if (recentApps.length === 0) {
      console.log('\n⚠️  NO RECENT APPLICATIONS:')
      console.log('   1. Email watcher may not be processing emails')
      console.log('   2. Check if emails are arriving at applicationsoptiohire@gmail.com')
      console.log('   3. Verify email subject matches job posting format')
    }

    await pool.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

diagnose()
