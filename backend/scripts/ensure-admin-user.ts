/**
 * One-time script: ensure admin@optiohire.com exists with role=admin and known password.
 * Run from backend: npx tsx scripts/ensure-admin-user.ts
 * Requires: DATABASE_URL and optional JWT_SECRET in .env
 */
import 'dotenv/config'
import bcrypt from 'bcrypt'
import pg from 'pg'

const ADMIN_EMAIL = 'admin@optiohire.com'
const ADMIN_PASSWORD = 'OptioHire@Admin'
const ADMIN_NAME = 'Admin Manager'
const SALT_ROUNDS = 10

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Set it in backend/.env')
    process.exit(1)
  }

  const pool = new pg.Pool({ connectionString })
  const client = await pool.connect()

  try {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS)

    const { rows: existing } = await client.query(
      `SELECT user_id, role, password_hash FROM users WHERE email = $1`,
      [ADMIN_EMAIL.toLowerCase()]
    )

    if (existing.length > 0) {
      await client.query(
        `UPDATE users SET role = 'admin', is_active = true, password_hash = $1, name = $2 WHERE email = $3`,
        [hash, ADMIN_NAME, ADMIN_EMAIL.toLowerCase()]
      )
      console.log('Admin user updated: admin@optiohire.com (password set to OptioHire@Admin)')
    } else {
      await client.query(
        `INSERT INTO users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, 'admin', true)`,
        [ADMIN_EMAIL.toLowerCase(), hash, ADMIN_NAME]
      )
      console.log('Admin user created: admin@optiohire.com / OptioHire@Admin')
    }
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
