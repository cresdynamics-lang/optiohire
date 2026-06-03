import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.join(process.cwd(), '.env') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
})

async function runMigrations() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Interview rejection reason column
    console.log('1. Adding interview_rejection_reason to applications...')
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS interview_rejection_reason text;
    `)

    // 2. Interview time column
    console.log('2. Adding interview_time to applications...')
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS interview_time timestamptz;
    `)

    // 3. Interview link column
    console.log('3. Adding interview_link to applications...')
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS interview_link text;
    `)

    // 4. Interview reminders column
    console.log('4. Adding interview_reminders to applications...')
    await client.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS interview_reminders text[];
    `)

    // 5. Job poster url column on job_postings
    console.log('5. Adding job_poster_url to job_postings...')
    await client.query(`
      ALTER TABLE job_postings 
      ADD COLUMN IF NOT EXISTS job_poster_url text;
    `)

    // 6. UX schema updates (candidate profiles, missions, etc)
    const uxSqlPath = path.join(process.cwd(), 'src/db/ux_schema_updates.sql')
    if (fs.existsSync(uxSqlPath)) {
      console.log('6. Running UX schema updates (candidate profiles, missions)...')
      const sql = fs.readFileSync(uxSqlPath, 'utf8')
      await client.query(sql)
    } else {
      console.log('6. Skipping UX schema (file not found)')
    }

    // 7. Candidate schema (candidate_profiles table etc)
    const candSqlPath = path.join(process.cwd(), 'src/db/candidate_schema.sql')
    if (fs.existsSync(candSqlPath)) {
      console.log('7. Running candidate schema updates...')
      const sql = fs.readFileSync(candSqlPath, 'utf8')
      await client.query(sql)
    } else {
      console.log('7. Skipping candidate schema (file not found)')
    }

    await client.query('COMMIT')
    console.log('\n✅ All migrations completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\n❌ Migration failed — rolled back:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
