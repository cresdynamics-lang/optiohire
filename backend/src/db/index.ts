import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

// Load .env file before reading DATABASE_URL
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../../.env')
dotenv.config({ path: envPath })

const { Pool } = pg

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

// Debug: Log connection string (mask password)
const maskedUrl = connectionString.replace(/:([^:@]+)@/, ':***@')
console.log('[DB] Connection string loaded:', maskedUrl)
console.log('[DB] DB_SSL:', process.env.DB_SSL)

// SSL configuration:
// - Local PostgreSQL: Set DB_SSL=false (no SSL needed)
// - Remote PostgreSQL: Set DB_SSL=true (SSL required)
const useSSL = process.env.DB_SSL !== 'false'

export const pool = new Pool({
  connectionString,
  // SSL only for remote connections, not local PostgreSQL
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  // Connection pool settings - optimized for performance
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '5', 10), // Minimum pool size
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000', 10), // 10 seconds
  // Statement timeout (prevent long-running queries)
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10), // 30 seconds
})

// Test connection on startup
pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err)
})

// Test connection
pool.connect()
  .then((client) => {
    console.log('[DB] ✅ Database connection successful')
    client.release()
  })
  .catch((err) => {
    console.error('[DB] ❌ Database connection failed:', err.message)
    console.error('[DB] Connection string (masked):', maskedUrl)
  })

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return { rows: res.rows as T[] }
  } catch (error: any) {
    console.error('[DB] Query error:', error.message)
    console.error('[DB] Query:', text.substring(0, 100))
    throw error
  } finally {
    client.release()
  }
}


