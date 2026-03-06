/**
 * Run complete database schema (tables, indexes) including email_verification_codes and email_logs.
 * Uses DATABASE_URL from backend/.env. No psql required.
 *
 * Prerequisite: Database and user must exist. If not, run one of:
 *
 *   ./setup-postgres.sh
 *
 *   # Or manually (with psql):
 *   psql -U postgres -c "CREATE DATABASE optiohire;"
 *   psql -U postgres -c "CREATE USER optiohire_user WITH PASSWORD 'optiohire_pass_2024';"
 *   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE optiohire TO optiohire_user;"
 *   psql -U postgres -d optiohire -c "GRANT ALL ON SCHEMA public TO optiohire_user;"
 *
 * Usage (from backend directory):
 *   npm run db:schema
 *   # or: npx tsx scripts/run-schema.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load backend/.env (script is in backend/scripts/)
const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Set it in backend/.env')
  process.exit(1)
}

const schemaPath = path.resolve(__dirname, '../src/db/complete_schema.sql')
if (!fs.existsSync(schemaPath)) {
  console.error('Schema file not found:', schemaPath)
  process.exit(1)
}

const sql = fs.readFileSync(schemaPath, 'utf8')

async function main() {
  const client = new pg.Client({ connectionString })
  try {
    await client.connect()
    console.log('Connected to database. Applying schema...')
    await client.query(sql)
    console.log('Schema applied successfully.')
    console.log('Tables include: users, companies, job_postings, applications, email_verification_codes, email_logs, etc.')
  } catch (err: any) {
    console.error('Schema apply failed:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
