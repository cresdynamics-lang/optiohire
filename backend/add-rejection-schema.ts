import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

async function runMigration() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    console.log('Adding interview_rejection_reason to applications...')
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS interview_rejection_reason text;
    `)
    await client.query('COMMIT')
    console.log('Migration successful!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
