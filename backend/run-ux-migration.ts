import fs from 'fs'
import path from 'path'
import { query, pool } from './src/db/index.js'

async function runMigration() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'src/db/ux_schema_updates.sql'), 'utf8')
    await query(sql)
    console.log('Migration executed successfully')
  } catch (err) {
    console.error('Migration failed:', err)
  } finally {
    await pool.end()
  }
}

runMigration()
