import { pool } from './backend/src/db/index.js';

async function main() {
  const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'job_postings'`);
  console.log(res.rows);
  process.exit(0);
}

main().catch(console.error);
