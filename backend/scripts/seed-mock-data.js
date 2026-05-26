import { query } from '../src/db/index.js'
import bcrypt from 'bcrypt'

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password', 10)

    console.log('Seeding candidate user...')
    const candidateRes = await query(`
      INSERT INTO users (email, password_hash, role, name, is_active, company_role)
      VALUES ($1, $2, 'user', 'Candidate User', true, 'candidate')
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = 'Candidate User'
      RETURNING user_id;
    `, ['candidate@optiohire.com', passwordHash])
    const candidateId = candidateRes.rows[0].user_id

    console.log('Seeding company user...')
    const companyUserRes = await query(`
      INSERT INTO users (email, password_hash, role, name, is_active, company_role)
      VALUES ($1, $2, 'user', 'Company Admin', true, 'hr')
      ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = 'Company Admin'
      RETURNING user_id;
    `, ['company@optiohire.com', passwordHash])
    const companyUserId = companyUserRes.rows[0].user_id

    console.log('Seeding company details...')
    const companyRes = await query(`
      INSERT INTO companies (user_id, company_name, company_email, hr_email, hiring_manager_email, company_domain)
      VALUES ($1, 'Acme Corp', 'contact@acmecorp.com', 'hr@acmecorp.com', 'manager@acmecorp.com', 'acmecorp.com')
      ON CONFLICT DO NOTHING
      RETURNING company_id;
    `, [companyUserId])

    let companyId;
    if (companyRes.rows.length > 0) {
      companyId = companyRes.rows[0].company_id
    } else {
      const existingCompany = await query(`SELECT company_id FROM companies WHERE user_id = $1`, [companyUserId])
      companyId = existingCompany.rows[0].company_id
    }

    console.log('Seeding job postings...')
    await query(`
      INSERT INTO job_postings (company_id, job_title, job_description, responsibilities, skills_required, status)
      VALUES 
      ($1, 'Software Engineer', 'We are looking for a skilled Software Engineer to join our team.', 'Develop features, write tests.', ARRAY['React', 'Node.js', 'PostgreSQL'], 'ACTIVE'),
      ($1, 'Product Manager', 'Lead our product initiatives.', 'Roadmap planning, user research.', ARRAY['Agile', 'Jira', 'Communication'], 'ACTIVE'),
      ($1, 'Data Scientist', 'Analyze complex datasets.', 'Build models, perform analytics.', ARRAY['Python', 'Machine Learning', 'SQL'], 'ACTIVE')
    `, [companyId])

    console.log('Mock data seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding mock data:', error)
    process.exit(1)
  }
}

seed()
