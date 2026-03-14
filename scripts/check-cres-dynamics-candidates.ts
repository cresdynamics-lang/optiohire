/**
 * Check Cres Dynamics candidates display on dashboard
 * Run: cd backend && npx tsx ../scripts/check-cres-dynamics-candidates.ts
 */

import '../backend/src/utils/env.js'
import { query, pool } from '../backend/src/db/index.js'

async function checkCandidates() {
  try {
    console.log('🔍 Checking Cres Dynamics Dashboard - View Candidates\n')
    
    // 1. Find Cres Dynamics company and jobs
    console.log('1️⃣ Finding Cres Dynamics Jobs...')
    const { rows: cresJobs } = await query<{
      job_posting_id: string
      job_title: string
      status: string
      company_id: string
      company_name: string
      application_count: string
    }>(
      `SELECT 
        jp.job_posting_id,
        jp.job_title,
        jp.status,
        c.company_id,
        c.company_name,
        (SELECT COUNT(*)::text FROM applications a WHERE a.job_posting_id = jp.job_posting_id) as application_count
      FROM job_postings jp
      JOIN companies c ON jp.company_id = c.company_id
      WHERE LOWER(c.company_name) LIKE LOWER($1)
      ORDER BY jp.created_at DESC`,
      ['%Cres Dynamics%']
    )
    
    if (cresJobs.length === 0) {
      console.log('   ❌ No jobs found for Cres Dynamics')
      console.log('   💡 Create a job posting first')
      await pool.end()
      return
    }
    
    console.log(`   ✅ Found ${cresJobs.length} job(s) for Cres Dynamics:\n`)
    cresJobs.forEach((job, idx) => {
      console.log(`   ${idx + 1}. ${job.job_title}`)
      console.log(`      Status: ${job.status}`)
      console.log(`      Job ID: ${job.job_posting_id}`)
      console.log(`      Applications: ${job.application_count}`)
      console.log('')
    })
    
    // 2. Check applications for each job
    for (const job of cresJobs) {
      console.log(`\n2️⃣ Applications for "${job.job_title}":`)
      
      const { rows: apps } = await query<{
        application_id: string
        candidate_name: string | null
        email: string
        ai_score: number | null
        ai_status: string | null
        created_at: Date
        rank: number
      }>(
        `SELECT 
          application_id,
          candidate_name,
          email,
          ai_score,
          ai_status,
          created_at,
          ROW_NUMBER() OVER (
            ORDER BY 
              CASE COALESCE(UPPER(TRIM(ai_status::text)), '')
                WHEN 'SHORTLIST' THEN 1
                WHEN 'FLAG' THEN 2
                WHEN 'REJECT' THEN 3
                ELSE 4
              END,
              ai_score DESC NULLS LAST,
              created_at ASC
          ) as rank
        FROM applications
        WHERE job_posting_id = $1
        ORDER BY 
          CASE COALESCE(UPPER(TRIM(ai_status::text)), '')
            WHEN 'SHORTLIST' THEN 1
            WHEN 'FLAG' THEN 2
            WHEN 'REJECT' THEN 3
            ELSE 4
          END,
          ai_score DESC NULLS LAST,
          created_at ASC`,
        [job.job_posting_id]
      )
      
      if (apps.length === 0) {
        console.log(`   ⚠️  No applications yet for "${job.job_title}"`)
        console.log(`   💡 Send an email to applicationsoptiohire@gmail.com`)
        console.log(`   💡 Subject: "${job.job_title} at ${job.company_name}"`)
        console.log(`   💡 Attach: CV.pdf or CV.docx`)
      } else {
        console.log(`   ✅ Found ${apps.length} application(s):\n`)
        apps.forEach((app, idx) => {
          const statusBadge = app.ai_status === 'SHORTLIST' ? '🟢 SHORTLIST' :
                             app.ai_status === 'FLAG' ? '🟡 FLAG' :
                             app.ai_status === 'REJECT' ? '🔴 REJECT' :
                             '⚪ PENDING'
          
          console.log(`   Rank #${app.rank}: ${app.candidate_name || 'Unknown'}`)
          console.log(`      Email: ${app.email}`)
          console.log(`      Status: ${statusBadge}`)
          console.log(`      Score: ${app.ai_score !== null ? app.ai_score.toFixed(1) : 'Not scored'}`)
          console.log(`      Created: ${app.created_at.toISOString()}`)
          console.log('')
        })
      }
    }
    
    // 3. Test API endpoint (simulate dashboard call)
    console.log('\n3️⃣ Testing Dashboard API Endpoint...')
    const firstJob = cresJobs[0]
    console.log(`   Testing: GET /api/hr/candidates?jobId=${firstJob.job_posting_id}`)
    
    try {
      const apiResponse = await fetch(`http://localhost:3001/api/hr/candidates?jobId=${firstJob.job_posting_id}`, {
        headers: {
          'Authorization': 'Bearer test-token' // This will fail auth, but we can check if endpoint exists
        }
      })
      
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        console.log('   ✅ API endpoint exists (auth required - expected)')
      } else if (apiResponse.ok) {
        const data = await apiResponse.json()
        console.log(`   ✅ API endpoint working - returns ${Array.isArray(data) ? data.length : 'data'} candidate(s)`)
      } else {
        console.log(`   ⚠️  API endpoint returned status: ${apiResponse.status}`)
      }
    } catch (err: any) {
      console.log(`   ⚠️  Could not test API endpoint: ${err.message}`)
      console.log('   💡 Make sure backend is running: cd backend && npm run dev')
    }
    
    // 4. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Cres Dynamics Jobs: ${cresJobs.length}`)
    
    const totalApps = cresJobs.reduce((sum, job) => sum + parseInt(job.application_count), 0)
    console.log(`✅ Total Applications: ${totalApps}`)
    
    if (totalApps > 0) {
      console.log('\n✅ Dashboard "View Candidates" will display:')
      console.log('   - Ranked candidates (by status and score)')
      console.log('   - Candidate name, email, score, status')
      console.log('   - Auto-refreshes every 30 seconds')
      console.log('\n📱 To View:')
      console.log(`   Dashboard → Job → "View Candidates"`)
      console.log(`   URL: /dashboard/job/${firstJob.job_posting_id}/shortlisted`)
    } else {
      console.log('\n⚠️  No applications yet')
      console.log('   Send test email to: applicationsoptiohire@gmail.com')
      console.log(`   Subject: "${firstJob.job_title} at Cres Dynamics"`)
      console.log('   Attach: CV.pdf or CV.docx')
    }
    
    await pool.end()
  } catch (err: any) {
    console.error('❌ Error:', err.message)
    await pool.end()
    process.exit(1)
  }
}

checkCandidates()
