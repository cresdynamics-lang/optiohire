import { query } from './src/db/index.js'
import dotenv from 'dotenv'

dotenv.config()

async function check() {
  try {
    const { rows } = await query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'candidate_profiles'`)
    console.log("COLUMNS IN DB:", rows)
    
    // Also try the update query!
    const mockProfileId = '00000000-0000-0000-0000-000000000000'
    try {
      await query(
        `UPDATE candidate_profiles
         SET bio = COALESCE($2, bio),
             job_category = COALESCE($3, job_category),
             cv_url = COALESCE($4, cv_url),
             cover_letter_url = COALESCE($5, cover_letter_url),
             recommendation_letter_url = COALESCE($6, recommendation_letter_url),
             updated_at = NOW()
         WHERE profile_id = $1
         RETURNING *`,
        [mockProfileId, null, null, null, null, null]
      )
      console.log("Query is syntactically VALID!")
    } catch (e) {
      console.error("QUERY ERROR:", e.message)
    }
  } catch(e) {
    console.error("DB connection error", e)
  }
  process.exit(0)
}

check()
