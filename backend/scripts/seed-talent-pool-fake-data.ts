import 'dotenv/config'
import { query } from '../src/db/index.js'
import { runNightlyTalentPoolScan } from '../src/cron/talentPoolScanner.js'

async function ensureCompany() {
  const domain = 'optiohire.com'
  const existing = await query('SELECT company_id FROM companies WHERE company_domain = $1 LIMIT 1', [domain])

  if (existing.rows.length > 0) {
    return existing.rows[0].company_id
  }

  const inserted = await query(
    `INSERT INTO companies (company_name, company_email, hr_email, hiring_manager_email, company_domain, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING company_id`,
    ['OptioHire Test Company', 'jobs@optiohire.com', 'hr@optiohire.com', 'manager@optiohire.com', domain]
  )

  return inserted.rows[0].company_id
}

async function ensureJobPosting(companyId: string) {
  const jobTitle = 'Junior Data Scientist'
  const jobDescription = 'Analyze datasets, build predictive models, and prepare reports for internal stakeholders.'
  const responsibilities = 'Work with Python, SQL, and data visualization tools. Create analytics dashboards and support model deployment.'
  const skillsRequired = ['Python', 'SQL', 'Data Analysis', 'Machine Learning']

  const existing = await query(
    `SELECT job_posting_id FROM job_postings WHERE company_id = $1 AND job_title = $2 LIMIT 1`,
    [companyId, jobTitle]
  )

  if (existing.rows.length > 0) {
    await query(
      `UPDATE job_postings SET job_description = $1, responsibilities = $2, skills_required = $3, status = 'ACTIVE', updated_at = NOW()
       WHERE job_posting_id = $4`,
      [jobDescription, responsibilities, skillsRequired, existing.rows[0].job_posting_id]
    )
    return existing.rows[0].job_posting_id
  }

  const inserted = await query(
    `INSERT INTO job_postings (company_id, job_title, job_description, responsibilities, skills_required, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
     RETURNING job_posting_id`,
    [companyId, jobTitle, jobDescription, responsibilities, skillsRequired]
  )

  return inserted.rows[0].job_posting_id
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
  const existing = await query('SELECT talent_id FROM talent_pool WHERE email = $1 LIMIT 1', [profile.email])

  if (existing.rows.length > 0) {
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
        existing.rows[0].talent_id
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

async function main() {
  console.log('Seeding fake talent pool profiles for local testing...')

  const companyId = await ensureCompany()
  console.log(`Using company_id=${companyId}`)

  const jobPostingId = await ensureJobPosting(companyId)
  console.log(`Using job_posting_id=${jobPostingId}`)

  const fakeProfiles = [
    {
      candidate_name: 'Alice Candidate',
      email: 'fake+talent1@optiohire.com',
      phone: '+1234567890',
      resume_url: null,
      parsed_resume_json: { summary: '3 years of data analysis using Python and SQL, strong experience with machine learning models.' },
      skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization'],
      experience_summary: 'Data analyst with 3 years of experience in Python, SQL, and ML model development.'
    },
    {
      candidate_name: 'Bob Test',
      email: 'fake+talent2@optiohire.com',
      phone: '+1234567891',
      resume_url: null,
      parsed_resume_json: { summary: '2 years of software engineering experience focused on JavaScript, APIs, and test automation.' },
      skills: ['JavaScript', 'Node.js', 'API Development'],
      experience_summary: 'Software engineer with backend API and automation experience.'
    }
  ]

  for (const profile of fakeProfiles) {
    await upsertTalentPoolProfile(profile)
    console.log(`Seeded talent pool profile: ${profile.email}`)
  }

  console.log('Running a talent pool scan after seeding...')
  await runNightlyTalentPoolScan()
  console.log('Talent pool scan completed.')

  const { rows: matches } = await query(
    `SELECT t.email AS candidate_email, jp.job_title, c.company_name, tpm.final_score, tpm.tier
     FROM talent_pool_matches tpm
     JOIN talent_pool t ON tpm.candidate_id = t.talent_id
     JOIN job_postings jp ON tpm.job_id = jp.job_posting_id
     JOIN companies c ON jp.company_id = c.company_id
     WHERE t.email = ANY($1::text[])
     ORDER BY tpm.final_score DESC`,
    [fakeProfiles.map(p => p.email)]
  )

  console.log('Talent pool matches for seeded profiles:')
  if (matches.length === 0) {
    console.warn('No matches were created. Check the scan logic and seeded data.')
  } else {
    for (const match of matches) {
      console.log(`- ${match.candidate_email} -> ${match.job_title} at ${match.company_name} (${match.tier}, ${match.final_score})`)
    }
  }
}

main().catch(error => {
  console.error('Error seeding fake talent pool data:', error)
  process.exit(1)
})
