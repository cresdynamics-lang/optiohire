/**
 * Check applications for Sales role
 * Run: cd backend && npx tsx ../scripts/check-applications.ts
 */

import { query, pool } from '../backend/src/db/index.js'

async function checkApplications() {
  try {
    console.log('🔍 Checking Sales job and applications...\n')

    // 1. Find Sales jobs
    const { rows: jobs } = await query<{
      job_posting_id: string
      job_title: string
      status: string
      company_id: string
      created_at: string
    }>(
      `SELECT job_posting_id, job_title, status, company_id, created_at 
       FROM job_postings 
       WHERE LOWER(job_title) LIKE $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      ['%sales%']
    )

    if (jobs.length === 0) {
      console.log('❌ No Sales jobs found in database')
      await pool.end()
      return
    }

    console.log(`✅ Found ${jobs.length} Sales job(s):\n`)
    jobs.forEach((job, idx) => {
      console.log(`${idx + 1}. Job ID: ${job.job_posting_id}`)
      console.log(`   Title: ${job.job_title}`)
      console.log(`   Status: ${job.status}`)
      console.log(`   Created: ${job.created_at}`)
      console.log('')
    })

    // 2. Check applications for each job
    for (const job of jobs) {
      console.log(`\n📋 Checking applications for: ${job.job_title} (${job.job_posting_id})`)
      
      const { rows: apps } = await query<{
        application_id: string
        candidate_name: string | null
        email: string
        ai_score: number | null
        ai_status: string | null
        created_at: string
        resume_url: string | null
      }>(
        `SELECT 
          application_id,
          candidate_name,
          email,
          ai_score,
          ai_status,
          created_at,
          resume_url
         FROM applications 
         WHERE job_posting_id = $1 
         ORDER BY created_at DESC`,
        [job.job_posting_id]
      )

      if (apps.length === 0) {
        console.log(`   ⚠️  No applications found for this job`)
      } else {
        console.log(`   ✅ Found ${apps.length} application(s):\n`)
        apps.forEach((app, idx) => {
          console.log(`   ${idx + 1}. Application ID: ${app.application_id}`)
          console.log(`      Candidate: ${app.candidate_name || 'N/A'}`)
          console.log(`      Email: ${app.email}`)
          console.log(`      Score: ${app.ai_score ?? 'Not scored'}`)
          console.log(`      Status: ${app.ai_status || 'PENDING'}`)
          console.log(`      Created: ${app.created_at}`)
          console.log(`      Resume: ${app.resume_url ? 'Yes' : 'No'}`)
          console.log('')
        })
      }
    }

    // 3. Check all recent applications (last 24 hours)
    console.log('\n📧 Checking all recent applications (last 24 hours)...\n')
    const { rows: recentApps } = await query<{
      application_id: string
      job_title: string
      candidate_name: string | null
      email: string
      ai_score: number | null
      ai_status: string | null
      created_at: string
    }>(
      `SELECT 
        a.application_id,
        jp.job_title,
        a.candidate_name,
        a.email,
        a.ai_score,
        a.ai_status,
        a.created_at
       FROM applications a
       LEFT JOIN job_postings jp ON a.job_posting_id = jp.job_posting_id
       WHERE a.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY a.created_at DESC`,
      []
    )

    if (recentApps.length === 0) {
      console.log('   ⚠️  No applications created in the last 24 hours')
    } else {
      console.log(`   ✅ Found ${recentApps.length} recent application(s):\n`)
      recentApps.forEach((app, idx) => {
        console.log(`   ${idx + 1}. ${app.candidate_name || app.email}`)
        console.log(`      Job: ${app.job_title || 'Unknown'}`)
        console.log(`      Email: ${app.email}`)
        console.log(`      Score: ${app.ai_score ?? 'Not scored'}`)
        console.log(`      Status: ${app.ai_status || 'PENDING'}`)
        console.log(`      Created: ${app.created_at}`)
        console.log('')
      })
    }

    // 4. Check company info for Cres Dynamics
    console.log('\n🏢 Checking Cres Dynamics company...\n')
    const { rows: companies } = await query<{
      company_id: string
      company_name: string
      company_email: string
      hr_email: string
    }>(
      `SELECT company_id, company_name, company_email, hr_email
       FROM companies
       WHERE LOWER(company_name) LIKE $1`,
      ['%cres dynamics%']
    )

    if (companies.length > 0) {
      companies.forEach((comp, idx) => {
        console.log(`${idx + 1}. Company: ${comp.company_name}`)
        console.log(`   ID: ${comp.company_id}`)
        console.log(`   Email: ${comp.company_email}`)
        console.log(`   HR Email: ${comp.hr_email}`)
        console.log('')
      })
    }

    await pool.end()
  } catch (err) {
    console.error('❌ Error:', err)
    await pool.end()
    process.exit(1)
  }
}

checkApplications()
