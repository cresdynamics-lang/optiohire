import { query } from '../src/db/index.js';

async function seed() {
  try {
    console.log('Starting seed...');
    let { rows: companies } = await query('SELECT company_id FROM companies LIMIT 1');
    let companyId;
    if (companies.length === 0) {
      const res = await query(`
        INSERT INTO companies (company_name, company_email, hr_email, hiring_manager_email, company_domain, company_logo_url) 
        VALUES ('Safaricom', 'hr@safaricom.co.ke', 'hr@safaricom.co.ke', 'manager@safaricom.co.ke', 'safaricom.co.ke', 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Safaricom_logo.svg/1200px-Safaricom_logo.svg.png') RETURNING company_id
      `);
      companyId = res.rows[0].company_id;
    } else {
      companyId = companies[0].company_id;
    }

    const jobs = [
      { title: 'Senior React Developer', desc: 'Build modern UIs for our new telco app. Must be highly skilled in React and Next.js.', req: 'React, Next.js, Tailwind' },
      { title: 'Product Manager', desc: 'Lead cross-functional teams to deliver high-impact features. Manage the entire product lifecycle.', req: 'Agile, Jira, Product Strategy' },
      { title: 'Data Scientist', desc: 'Analyze big data to drive predictive modeling. Experience with machine learning is a must.', req: 'Python, SQL, Machine Learning' },
      { title: 'HR Manager', desc: 'Manage talent acquisition and employee relations. Experience in tech recruiting preferred.', req: 'HR, Recruitment, Talent Management' }
    ];

    for (const job of jobs) {
      await query(`
        INSERT INTO job_postings (company_id, job_title, job_description, responsibilities, skills_required, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW())
      `, [
        companyId, 
        job.title, 
        job.desc, 
        'Deliver great work\nCollaborate with team', 
        job.req.split(', '), 
      ]);
    }
    console.log('Seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
