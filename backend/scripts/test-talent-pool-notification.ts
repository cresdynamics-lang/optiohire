import 'dotenv/config'
import { query } from '../src/db/index.js'
import { runNightlyTalentPoolScan } from '../src/cron/talentPoolScanner.js'

const TEST_COMPANY_DOMAIN = 'optiohire-test.com'
const TEST_JOB_TITLE = 'Talent Pool Notification Test Role'
const TEST_CANDIDATE_EMAILS = ['fake+talent1@optiohire-test.com', 'fake+talent2@optiohire-test.com']

async function ensureTestCompany() {
  const { rows } = await query(
    `SELECT company_id FROM companies WHERE company_domain = $1 LIMIT 1`,
    [TEST_COMPANY_DOMAIN]
  )

  if (rows.length > 0) {
    return rows[0].company_id
  }

  const result = await query(
    `INSERT INTO companies (company_name, company_email, hr_email, hiring_manager_email, company_domain, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING company_id`,
    ['OptioHire Test Company', 'jobs@optiohire-test.com', 'hr@optiohire-test.com', 'manager@optiohire-test.com', TEST_COMPANY_DOMAIN]
  )

  return result.rows[0].company_id
}

async function ensureTestJobPosting(companyId: string) {
  const { rows } = await query(
    `SELECT job_posting_id FROM job_postings WHERE company_id = $1 AND job_title = $2 LIMIT 1`,
    [companyId, TEST_JOB_TITLE]
  )

  const jobDescription = 'A test job used to verify talent pool match notifications and scoring integration.'
  const responsibilities = 'Review candidate profiles, evaluate talent pool notifications, and confirm match email logging.'
  const skillsRequired = ['Python', 'SQL', 'Data Analysis', 'Machine Learning']

  if (rows.length > 0) {
    const jobPostingId = rows[0].job_posting_id
    await query(
      `UPDATE job_postings
       SET job_description = $1,
           responsibilities = $2,
           skills_required = $3,
           status = 'ACTIVE',
           updated_at = NOW()
       WHERE job_posting_id = $4`,
      [jobDescription, responsibilities, skillsRequired, jobPostingId]
    )
    return jobPostingId
  }

  const result = await query(
    `INSERT INTO job_postings (company_id, job_title, job_description, responsibilities, skills_required, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
     RETURNING job_posting_id`,
    [companyId, TEST_JOB_TITLE, jobDescription, responsibilities, skillsRequired]
  )

  return result.rows[0].job_posting_id
}

async function upsertTalentPoolProfile(profile: {
  candidate_name: string
  email: string
  phone: string
  resume_url: string | null
  parsed_resume_json: Record<string, unknown>
  skills: string[]
  experience_summary: string
}) {
  const { rows } = await query(`SELECT talent_id FROM talent_pool WHERE email = $1 LIMIT 1`, [profile.email])

  if (rows.length > 0) {
    await query(
      `UPDATE talent_pool
       SET candidate_name = $1,
           phone = $2,
           resume_url = $3,
           parsed_resume_json = $4::jsonb,
           skills = $5,
           experience_summary = $6,
           updated_at = NOW()
       WHERE talent_id = $7`,
      [
        profile.candidate_name,
        profile.phone,
        profile.resume_url,
        JSON.stringify(profile.parsed_resume_json),
        profile.skills,
        profile.experience_summary,
        rows[0].talent_id
      ]
    )
    return
  }

  await query(
    `INSERT INTO talent_pool (candidate_name, email, phone, resume_url, parsed_resume_json, skills, experience_summary, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, NOW(), NOW())`,
    [
      profile.candidate_name,
      profile.email,
      profile.phone,
      profile.resume_url,
      JSON.stringify(profile.parsed_resume_json),
      profile.skills,
      profile.experience_summary
    ]
  )
}

async function setupTestData() {
  const companyId = await ensureTestCompany()
  const jobPostingId = await ensureTestJobPosting(companyId)

  await upsertTalentPoolProfile({
    candidate_name: 'Alice Candidate',
    email: TEST_CANDIDATE_EMAILS[0],
    phone: '+1234567890',
    resume_url: null,
    parsed_resume_json: { summary: '3 years of data analysis using Python and SQL, strong experience with machine learning models.' },
    skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization'],
    experience_summary: 'Data analyst with 3 years of experience in Python, SQL, and ML model development.'
  })

  await upsertTalentPoolProfile({
    candidate_name: 'Bob Test',
    email: TEST_CANDIDATE_EMAILS[1],
    phone: '+1234567891',
    resume_url: null,
    parsed_resume_json: { summary: '2 years of software engineering experience focused on JavaScript, APIs, and test automation.' },
    skills: ['JavaScript', 'Node.js', 'API Development'],
    experience_summary: 'Software engineer with backend API and automation experience.'
  })

  return { candidateEmails: TEST_CANDIDATE_EMAILS, jobPostingId }
}

async function logResults(candidateEmails: string[]) {
  const { rows: matchRows } = await query(
    `SELECT t.email AS candidate_email, jp.job_title, c.company_name, tpm.final_score, tpm.tier, tpm.matched_at
     FROM talent_pool_matches tpm
     JOIN talent_pool t ON tpm.candidate_id = t.talent_id
     JOIN job_postings jp ON tpm.job_id = jp.job_posting_id
     JOIN companies c ON jp.company_id = c.company_id
     WHERE t.email = ANY($1::text[])
     ORDER BY tpm.final_score DESC`,
    [candidateEmails]
  )

  console.log(`\n=== Talent Pool Match Results (${matchRows.length}) ===`)
  if (matchRows.length === 0) {
    console.warn('⚠️ No talent pool matches were created for the seeded candidate profiles.')
  } else {
    matchRows.forEach((row: any) => {
      console.log(`- ${row.candidate_email} -> ${row.job_title} at ${row.company_name} [score=${row.final_score}, tier=${row.tier}, matched_at=${row.matched_at}]`)
    })
  }

  const { rows: emailRows } = await query(
    `SELECT email_id, recipient_email, subject, status, sent_at, created_at
     FROM email_logs
     WHERE email_type = 'talent_pool_match'
       AND recipient_email = ANY($1::text[])
     ORDER BY created_at DESC
     LIMIT 10`,
    [candidateEmails]
  )

  console.log(`\n=== Talent Pool Match Notification Emails (${emailRows.length}) ===`)
  if (emailRows.length === 0) {
    console.warn('⚠️ No talent pool match notification emails were recorded for seeded candidates.')
  } else {
    emailRows.forEach((row: any) => {
      console.log(`- ${row.subject} -> ${row.recipient_email} [${row.status}] sent_at=${row.sent_at || 'N/A'}`)
    })
  }
}

async function main() {
  console.log('Starting talent pool notification end-to-end test...')
  const { candidateEmails } = await setupTestData()

  try {
    await runNightlyTalentPoolScan()
    console.log('✅ Talent pool scan completed successfully.')
  } catch (error: any) {
    console.error('❌ Talent pool scan failed:', error?.message || error)
    process.exit(1)
  }

  try {
    await logResults(candidateEmails)
  } catch (error: any) {
    console.error('❌ Failed to inspect talent pool notification results:', error?.message || error)
    process.exit(1)
  }

  console.log('\n✅ Talent pool notification test complete.')
}

main().catch(error => {
  console.error('Unexpected error during talent pool notification test:', error)
  process.exit(1)
})
