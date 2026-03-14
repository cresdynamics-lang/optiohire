/**
 * Final readiness check before sending applications
 * Run: cd backend && npx tsx ../scripts/final-readiness-check.ts
 */

import '../backend/src/utils/env.js'
import { query, pool } from '../backend/src/db/index.js'

async function checkReadiness() {
  try {
    console.log('🔍 Final Readiness Check Before Sending Applications...\n')
    
    let allReady = true

    // 1. Check Email Watcher
    console.log('1️⃣ Email Watcher Configuration:')
    const enableEmailReader = process.env.ENABLE_EMAIL_READER !== 'false'
    const imapHost = process.env.IMAP_HOST
    const imapUser = process.env.IMAP_USER
    const imapPass = process.env.IMAP_PASS ? '***configured***' : 'NOT SET'
    const imapPollMs = process.env.IMAP_POLL_MS || '5000'
    
    console.log(`   ENABLE_EMAIL_READER: ${enableEmailReader ? '✅ YES' : '❌ NO'}`)
    console.log(`   IMAP_HOST: ${imapHost || '❌ NOT SET'}`)
    console.log(`   IMAP_USER: ${imapUser || '❌ NOT SET'}`)
    console.log(`   IMAP_PASS: ${imapPass}`)
    console.log(`   Poll Interval: ${parseInt(imapPollMs) / 1000}s`)
    
    if (!enableEmailReader || !imapHost || !imapUser || !imapPass.includes('configured')) {
      console.log('   ⚠️  Email watcher may not be active!')
      allReady = false
    } else {
      console.log('   ✅ Email watcher configured correctly')
    }

    // 2. Check Email Service
    console.log('\n2️⃣ Email Service Configuration:')
    const useResend = process.env.USE_RESEND === 'true'
    const resendApiKey = process.env.RESEND_API_KEY ? '***configured***' : 'NOT SET'
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'NOT SET'
    const resendDomain = process.env.RESEND_DOMAIN || 'NOT SET'
    
    console.log(`   USE_RESEND: ${useResend ? '✅ YES' : '❌ NO'}`)
    console.log(`   RESEND_API_KEY: ${resendApiKey}`)
    console.log(`   RESEND_FROM_EMAIL: ${resendFromEmail}`)
    console.log(`   RESEND_DOMAIN: ${resendDomain}`)
    
    if (useResend && resendFromEmail.includes('optiohire.com')) {
      console.log('   ✅ Using verified optiohire.com domain')
    } else if (resendFromEmail.includes('gmail.com')) {
      console.log('   ⚠️  Using gmail.com (will fallback to SMTP)')
    }
    
    if (!useResend && !process.env.SMTP_HOST) {
      console.log('   ⚠️  No email service configured!')
      allReady = false
    } else {
      console.log('   ✅ Email service configured')
    }

    // 3. Check Active Job Postings
    console.log('\n3️⃣ Active Job Postings:')
    const { rows: activeJobs } = await query<{
      job_posting_id: string
      job_title: string
      company_name: string
      status: string
    }>(
      `SELECT 
        jp.job_posting_id,
        jp.job_title,
        c.company_name,
        jp.status
      FROM job_postings jp
      JOIN companies c ON jp.company_id = c.company_id
      WHERE jp.status = 'ACTIVE'
      ORDER BY jp.created_at DESC
      LIMIT 10`
    )

    console.log(`   Found ${activeJobs.length} active job posting(s)`)
    if (activeJobs.length > 0) {
      activeJobs.forEach((job, idx) => {
        console.log(`   ${idx + 1}. ${job.job_title} at ${job.company_name}`)
        console.log(`      Expected subject format: "${job.job_title} at ${job.company_name}"`)
      })
    } else {
      console.log('   ⚠️  No active job postings found!')
      console.log('   💡 Create a job posting first, then send applications')
      allReady = false
    }

    // 4. Check Database Connection
    console.log('\n4️⃣ Database Connection:')
    try {
      const { rows } = await query('SELECT NOW() as current_time')
      console.log(`   ✅ Database connected (Current time: ${rows[0].current_time})`)
    } catch (err: any) {
      console.log(`   ❌ Database connection failed: ${err.message}`)
      allReady = false
    }

    // 5. Check Backend Health
    console.log('\n5️⃣ Backend Health:')
    try {
      const healthResponse = await fetch('http://localhost:3001/health')
      if (healthResponse.ok) {
        const health = await healthResponse.json()
        const emailReader = health.emailReader || {}
        console.log(`   ✅ Backend is running`)
        console.log(`   Email Watcher Enabled: ${emailReader.enabled ? 'YES' : 'NO'}`)
        console.log(`   Email Watcher Running: ${emailReader.running ? 'YES' : 'NO'}`)
        console.log(`   Last Processed: ${emailReader.lastProcessedAt || 'never'}`)
        
        if (!emailReader.enabled || !emailReader.running) {
          console.log('   ⚠️  Email watcher is not active!')
          allReady = false
        }
      } else {
        console.log(`   ⚠️  Backend health check failed (status: ${healthResponse.status})`)
        allReady = false
      }
    } catch (err: any) {
      console.log(`   ⚠️  Could not reach backend: ${err.message}`)
      console.log('   💡 Make sure backend is running: cd backend && npm run dev')
      allReady = false
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    if (allReady) {
      console.log('✅ ALL SYSTEMS READY!')
      console.log('='.repeat(60))
      console.log('\n📧 Ready to receive applications!')
      console.log('\n📝 Instructions:')
      console.log('   1. Send email to: applicationsoptiohire@gmail.com')
      console.log('   2. Subject format: "Job Title at Company Name"')
      console.log('      Example: "Sales Role at Cres Dynamics"')
      console.log('   3. Attach CV: PDF or DOCX file')
      console.log('   4. Wait 5-10 seconds')
      console.log('   5. Check dashboard → View Candidates')
      console.log('   6. Candidate will appear ranked with score and status')
      console.log('   7. Candidate will receive shortlist/rejection email')
    } else {
      console.log('⚠️  SOME ISSUES FOUND')
      console.log('='.repeat(60))
      console.log('\n❌ Please fix the issues above before sending applications')
    }

    await pool.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

checkReadiness()
