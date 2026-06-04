import { query, pool } from './src/db/index.js';
async function run() {
  const { rows } = await query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('--- PRODUCTION TABLES (' + rows.length + ') ---');
  rows.forEach(r => console.log('- ' + r.table_name));
  
  const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='applications'");
  const hasRej = cols.rows.some(c => c.column_name === 'interview_rejection_reason');
  const hasTime = cols.rows.some(c => c.column_name === 'interview_time');
  console.log('------------------------------');
  console.log('Migrations Active:');
  console.log('Rejection Column:', hasRej);
  console.log('Interview Time Column:', hasTime);
  
  await pool.end();
}
run();
