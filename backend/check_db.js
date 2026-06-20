require('dotenv').config();
const { Client } = require('pg');

async function checkPendingCerts() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT c.*, s.skill_name, p.user_id, NULL::text as candidate_name, u.email as candidate_email
      FROM certificate_approvals c
      JOIN candidate_skills s ON c.skill_id = s.skill_id
      JOIN candidate_profiles p ON s.profile_id = p.profile_id
      JOIN users u ON p.user_id = u.user_id
      WHERE c.status = 'PENDING'
      ORDER BY c.submitted_at ASC
    `);
    console.log("Certificate query success:", res.rowCount);
  } catch(e) {
    console.error("Certificate query error:", e.message);
  } finally {
    await client.end();
  }
}

async function checkUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(`SELECT role, COUNT(*) FROM users GROUP BY role`);
    console.log("Users roles:", res.rows);
  } catch(e) {
    console.error("Users query error:", e.message);
  } finally {
    await client.end();
  }
}

checkPendingCerts().then(checkUsers);
