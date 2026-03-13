/**
 * Create Sales job posting at Cres Dynamics directly in database
 * Run: cd backend && npx tsx ../scripts/create-sales-job-ts.ts
 */

import { query, pool } from '../backend/src/db/index.js'

async function createSalesJob() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Find or create Cres Dynamics company
    let companyResult = await client.query(
      `SELECT company_id FROM companies 
       WHERE LOWER(company_name) = LOWER($1) 
       OR company_email = $2 
       LIMIT 1`,
      ['Cres Dynamics', 'hr@cresdynamics.com']
    )

    let companyId
    if (companyResult.rows.length > 0) {
      companyId = companyResult.rows[0].company_id
      console.log(`✅ Found existing company: Cres Dynamics (ID: ${companyId})`)
    } else {
      // Create company
      const insertCompany = await client.query(
        `INSERT INTO companies (company_name, company_email, hr_email, hiring_manager_email, company_domain, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, now(), now())
         RETURNING company_id`,
        ['Cres Dynamics', 'hr@cresdynamics.com', 'hr@cresdynamics.com', 'hr@cresdynamics.com', 'cresdynamics.com']
      )
      companyId = insertCompany.rows[0].company_id
      console.log(`✅ Created company: Cres Dynamics (ID: ${companyId})`)
    }

    // 2. Create Sales job posting
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 30) // 30 days from now

    // Skills as array format for PostgreSQL
    const skillsArray = ['Sales', 'Customer Relations', 'Communication', 'Negotiation', 'CRM']

    const jobResult = await client.query(
      `INSERT INTO job_postings 
       (company_id, job_title, job_description, responsibilities, skills_required,
        application_deadline, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::text[], $6, 'ACTIVE', now(), now())
       RETURNING job_posting_id, job_title, status`,
      [
        companyId,
        'Sales',
        'We are looking for an experienced Sales professional to join our team. The ideal candidate will have a proven track record in sales, excellent communication skills, and the ability to build strong client relationships. Responsibilities include identifying new business opportunities, managing client accounts, and achieving sales targets.',
        'We are looking for an experienced Sales professional to join our team. The ideal candidate will have a proven track record in sales, excellent communication skills, and the ability to build strong client relationships. Responsibilities include identifying new business opportunities, managing client accounts, and achieving sales targets.',
        skillsArray,
        deadline.toISOString()
      ]
    )

    const jobId = jobResult.rows[0].job_posting_id
    console.log(`✅ Created job posting: Sales (ID: ${jobId})`)
    console.log(`   Company: Cres Dynamics`)
    console.log(`   Status: ACTIVE`)
    console.log(`   Deadline: ${deadline.toISOString()}`)

    await client.query('COMMIT')

    console.log('')
    console.log('📧 Email Watcher will now match emails with:')
    console.log('   - Subject containing "Sales"')
    console.log('   - Subject containing "Cres Dynamics"')
    console.log('   - Subject containing "Sales at Cres Dynamics"')
    console.log('   - Or any combination of these keywords')
    console.log('')
    console.log('✅ Job posting created successfully!')

    return { companyId, jobId }
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('❌ Error creating job posting:', error.message || error)
    throw error
  } finally {
    client.release()
  }
}

createSalesJob()
  .then(() => {
    console.log('')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
