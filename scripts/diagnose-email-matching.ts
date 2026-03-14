/**
 * Diagnose email matching for Sales Role job
 * Run: cd backend && npx tsx ../scripts/diagnose-email-matching.ts
 */

import { query, pool } from '../backend/src/db/index.js'

async function diagnoseMatching() {
  try {
    console.log('🔍 Diagnosing email matching for Sales Role...\n')

    // Get the Sales Role job
    const { rows: jobs } = await query<{
      job_posting_id: string
      job_title: string
      company_name: string
      status: string
    }>(
      `SELECT jp.job_posting_id, jp.job_title, c.company_name, jp.status
       FROM job_postings jp
       JOIN companies c ON jp.company_id = c.company_id
       WHERE LOWER(jp.job_title) LIKE $1
       ORDER BY jp.created_at DESC
       LIMIT 1`,
      ['%sales%']
    )

    if (jobs.length === 0) {
      console.log('❌ No Sales job found')
      await pool.end()
      return
    }

    const job = jobs[0]
    console.log(`✅ Found job:`)
    console.log(`   Title: "${job.job_title}"`)
    console.log(`   Company: "${job.company_name}"`)
    console.log(`   Status: ${job.status}`)
    console.log(`   ID: ${job.job_posting_id}\n`)

    // Test various email subjects
    const testSubjects = [
      'Sales',
      'Sales Role',
      'Sales at Cres Dynamics',
      'Sales Role at Cres Dynamics',
      'Application for Sales',
      'Application for Sales Role',
      'Cres Dynamics - Sales',
      'Cres Dynamics - Sales Role',
      'Job Application - Sales',
      'Re: Sales Role',
      'Fwd: Sales at Cres Dynamics'
    ]

    console.log('📧 Testing email subject matching:\n')
    
    for (const subject of testSubjects) {
      const normalizedSubject = subject.toLowerCase().trim().replace(/\s+/g, ' ')
      const jobTitleLower = job.job_title.toLowerCase()
      const companyNameLower = job.company_name.toLowerCase()
      
      // Check exact match
      const exactMatch = normalizedSubject === `${jobTitleLower} at ${companyNameLower}`
      
      // Check if contains "job title at company name"
      const containsFullMatch = normalizedSubject.includes(`${jobTitleLower} at ${companyNameLower}`)
      
      // Check if contains both title and company (any order)
      const containsBoth = normalizedSubject.includes(jobTitleLower) && normalizedSubject.includes(companyNameLower)
      
      // Check if contains full job title
      const containsTitle = normalizedSubject.includes(jobTitleLower)
      
      // Check if contains company name
      const containsCompany = normalizedSubject.includes(companyNameLower)
      
      // Check if contains "Sales" keyword
      const containsSalesKeyword = normalizedSubject.includes('sales')
      
      let matchScore = 0
      let matchReason = ''
      
      if (exactMatch) {
        matchScore = 10
        matchReason = 'Exact match'
      } else if (normalizedSubject.startsWith(`${jobTitleLower} at ${companyNameLower}`)) {
        matchScore = 9
        matchReason = 'Starts with full match'
      } else if (containsFullMatch) {
        matchScore = 8
        matchReason = 'Contains full match'
      } else if (containsBoth) {
        matchScore = 7
        matchReason = 'Contains both title and company'
      } else if (containsTitle) {
        matchScore = 6
        matchReason = 'Contains full job title'
      } else if (containsCompany) {
        matchScore = 5
        matchReason = 'Contains company name'
      } else if (containsSalesKeyword) {
        matchScore = 1
        matchReason = 'Contains "sales" keyword'
      }
      
      const willMatch = matchScore >= 1
      const icon = willMatch ? '✅' : '❌'
      
      console.log(`${icon} "${subject}"`)
      if (willMatch) {
        console.log(`   Score: ${matchScore} - ${matchReason}`)
      } else {
        console.log(`   No match`)
      }
      console.log('')
    }

    console.log('\n💡 Recommendations:')
    console.log('   - Use subject: "Sales Role at Cres Dynamics" (best match)')
    console.log('   - Or: "Sales at Cres Dynamics"')
    console.log('   - Or: "Sales Role" (if only one Sales Role job exists)')
    console.log('   - Or: "Sales" (will match but may be ambiguous)')
    console.log('   - Make sure email has CV attachment (PDF or DOCX)')
    console.log('   - Send to: applicationsoptiohire@gmail.com')

    await pool.end()
  } catch (err) {
    console.error('❌ Error:', err)
    await pool.end()
    process.exit(1)
  }
}

diagnoseMatching()
