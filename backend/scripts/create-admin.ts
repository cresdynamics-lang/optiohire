/**
 * Script to create the first admin user
 * Usage: tsx scripts/create-admin.ts <email> <password>
 */

import 'dotenv/config'
import bcrypt from 'bcrypt'
import { query } from '../src/db/index.js'

const SALT_ROUNDS = 10

async function createAdmin(email: string, password: string) {
  try {
    // Check if user exists
    const { rows: existing } = await query<{ user_id: string; role: string }>(
      `SELECT user_id, role FROM users WHERE email = $1`,
      [email.toLowerCase()]
    )

    if (existing.length > 0) {
      // Update existing user to admin
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      await query(
        `UPDATE users SET password_hash = $1, role = 'admin', is_active = true, updated_at = now() WHERE user_id = $2`,
        [hash, existing[0].user_id]
      )
      console.log(`✅ Updated user ${email} to admin`)
      return
    }

    // Create new admin user
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    const { rows } = await query<{ user_id: string }>(
      `INSERT INTO users (email, password_hash, role, is_active) 
       VALUES ($1, $2, 'admin', true) 
       RETURNING user_id`,
      [email.toLowerCase(), hash]
    )

    console.log(`✅ Created admin user: ${email}`)
    console.log(`   User ID: ${rows[0].user_id}`)
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: tsx scripts/create-admin.ts <email> <password>')
  process.exit(1)
}

createAdmin(email, password)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

