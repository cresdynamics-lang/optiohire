import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  try {
    const { rows } = await pool.query(`
      SELECT
         a.application_id,
         a.created_at,
         a.updated_at,
         a.ai_score,
         a.ai_status,
         a.reasoning,
         a.resume_url,
         a.parsed_resume_json,
         a.phone,
         jp.job_posting_id,
         jp.job_title,
         c.company_name
       FROM applications a
       JOIN job_postings jp ON jp.job_posting_id = a.job_posting_id
       LEFT JOIN companies c ON c.company_id = a.company_id
       LIMIT 1
    `);
    console.log('Query success:', rows);
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    await pool.end();
  }
}
run();
