import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

const SALT_ROUNDS = 10

/**
 * Auto-provisions a candidate user account when an application is processed.
 * 
 * Flow:
 * 1. Check if a user already exists with this email.
 * 2. If yes, return existing user info (no temp password — they already have one).
 * 3. If no, create a new user with role='candidate', a random temp password,
 *    and return the credentials so the email can include them.
 */
export async function provisionCandidateAccount(data: {
  email: string
  candidateName: string
}): Promise<{
  userId: string
  isNewAccount: boolean
  temporaryPassword: string | null
}> {
  const normalizedEmail = data.email.toLowerCase().trim()

  try {
    // 1. Check if user already exists
    const { rows: existing } = await query<{ user_id: string; role: string }>(
      `SELECT user_id, role FROM users WHERE email = $1`,
      [normalizedEmail]
    )

    if (existing.length > 0) {
      logger.info(`[CandidateProvisioning] User already exists for ${normalizedEmail}, skipping creation`)
      return {
        userId: existing[0].user_id,
        isNewAccount: false,
        temporaryPassword: null,
      }
    }

    // 2. Generate a secure temporary password (8 chars, readable)
    const temporaryPassword = crypto.randomBytes(4).toString('hex') // e.g. "a3f1b2c9"
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS)

    // 3. Build insert query — check which columns exist
    const { rows: colCheck } = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('name', 'company_role')
    `)

    const hasNameColumn = colCheck.some((r: any) => r.column_name === 'name')
    const hasCompanyRoleColumn = colCheck.some((r: any) => r.column_name === 'company_role')

    const columns: string[] = ['email', 'password_hash', 'role', 'is_active']
    const placeholders: string[] = ['$1', '$2', '$3', '$4']
    const params: any[] = [normalizedEmail, passwordHash, 'candidate', true]
    let paramIndex = 5

    if (hasNameColumn && data.candidateName) {
      columns.push('name')
      placeholders.push(`$${paramIndex++}`)
      params.push(data.candidateName.trim())
    }

    if (hasCompanyRoleColumn) {
      columns.push('company_role')
      placeholders.push(`$${paramIndex++}`)
      params.push('candidate')
    }

    const { rows } = await query<{ user_id: string }>(
      `INSERT INTO users (${columns.join(', ')}) 
       VALUES (${placeholders.join(', ')}) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING user_id`,
      params
    )

    if (rows.length === 0) {
      // Race condition: another process created the user between our check and insert
      const { rows: fallback } = await query<{ user_id: string }>(
        `SELECT user_id FROM users WHERE email = $1`,
        [normalizedEmail]
      )
      return {
        userId: fallback[0]?.user_id || '',
        isNewAccount: false,
        temporaryPassword: null,
      }
    }

    const userId = rows[0].user_id
    logger.info(`[CandidateProvisioning] Created candidate account for ${normalizedEmail} (user_id: ${userId})`)

    // 4. Create candidate_profiles row if the table exists
    try {
      const { rows: tableCheck } = await query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'candidate_profiles'
        ) AS exists
      `)

      if (tableCheck[0]?.exists) {
        await query(
          `INSERT INTO candidate_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
          [userId]
        )
        logger.info(`[CandidateProvisioning] Created candidate_profiles row for ${userId}`)
      }
    } catch (profileErr) {
      logger.warn(`[CandidateProvisioning] Could not create candidate_profiles row:`, profileErr)
      // Non-fatal — the user account was still created
    }

    return {
      userId,
      isNewAccount: true,
      temporaryPassword,
    }
  } catch (err) {
    logger.error(`[CandidateProvisioning] Failed to provision candidate account for ${normalizedEmail}:`, err)
    // Don't throw — this is a non-critical enhancement. The application was already saved.
    return {
      userId: '',
      isNewAccount: false,
      temporaryPassword: null,
    }
  }
}
