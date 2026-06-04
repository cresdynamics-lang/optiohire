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

// SSL configuration
const useSSL = process.env.DB_SSL !== 'false'

export const pool = new Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  max: 20,
})

// --- TEST MOCK LOGIC ---
const isTest = process.env.NODE_ENV === 'test';

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  if (isTest) {
    const lowerText = text.toLowerCase();
    console.log(`[DB MOCK] Query: ${text.substring(0, 60)}...`);
    
    // Auth & User queries
    if (lowerText.includes('from users')) {
      return { rows: [{ user_id: 'hr_user_1', email: 'hr@company.com', role: 'user', is_active: true }] as any, rowCount: 1 };
    }
    
    // Column checks
    if (lowerText.includes('information_schema.columns')) {
      return { rows: [{ column_name: 'user_id' }] as any, rowCount: 1 };
    }
    
    // Company queries
    if (lowerText.includes('from companies') || lowerText.includes('insert into companies') || lowerText.includes('update companies')) {
      return { rows: [{ company_id: 'comp_1', company_name: 'Tech Corp', hr_email: 'hr@company.com', company_email: 'contact@techcorp.com' }] as any, rowCount: 1 };
    }
    
    // Job Posting queries
    if (lowerText.includes('from job_postings') || lowerText.includes('insert into job_postings') || lowerText.includes('update job_postings')) {
      return { rows: [{ job_posting_id: 'job_123', company_id: 'comp_1', status: 'ACTIVE', job_title: 'Software Engineer' }] as any, rowCount: 1 };
    }
    
    // Application queries
    if (lowerText.includes('from applications') || lowerText.includes('insert into applications') || lowerText.includes('update applications')) {
      // Check for duplicate application (email check)
      if (lowerText.includes('and email = $2')) {
        return { rows: [], rowCount: 0 };
      }
      return { rows: [{ application_id: 'app_123', email: 'john@doe.com', candidate_name: 'John Doe', job_title: 'Software Engineer', company_name: 'Tech Corp', reasoning: 'Good match' }] as any, rowCount: 1 };
    }
    
    // Transaction queries
    if (lowerText === 'begin' || lowerText === 'commit' || lowerText === 'rollback') {
      return { rows: [], rowCount: 0 };
    }

    return { rows: [], rowCount: 0 };
  }

  const client = await pool.connect()
  try {
    const res = await client.query(text, params)
    return { rows: res.rows as T[], rowCount: res.rowCount || 0 }
  } finally {
    client.release()
  }
}

// Override pool.connect for testing
if (isTest) {
  pool.connect = (async () => {
    console.log('[DB MOCK] pool.connect called');
    return {
      query: (text: string, params?: any[]) => query(text, params),
      release: () => { console.log('[DB MOCK] client.release called'); },
      on: () => {},
    };
  }) as any;
}
