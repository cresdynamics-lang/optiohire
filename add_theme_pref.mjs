import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, 'backend', '.env') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function run() {
  try {
    console.log('Adding theme_preference to users table...')
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(20) DEFAULT 'system';
    `)
    console.log('Done!')
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await pool.end()
  }
}

run()
