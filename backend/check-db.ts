import { query, pool } from './src/db/index.js'
async function run() {
  const { rows: tables } = await query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)
  console.log('Tables found: ', tables.length)
  
  const { rows: cols } = await query(`SELECT column_name FROM information_schema.columns WHERE table_name='applications'`)
  const hasRejection = cols.some(c => c.column_name === 'interview_rejection_reason')
  const hasInterviewTime = cols.some(c => c.column_name === 'interview_time')
  console.log('Applications table has interview_rejection_reason:', hasRejection)
  console.log('Applications table has interview_time:', hasInterviewTime)
  
  await pool.end()
}
run()
