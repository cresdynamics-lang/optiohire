import { query, pool } from './src/db/index.js'
async function run() {
  try {
    const r = await query("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%interview%'")
    r.rows.forEach((x: any) => console.log(x.table_name))
  } finally {
    await pool.end()
  }
}
run()
