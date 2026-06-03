import { pool, query } from './src/db/index.js';
import bcrypt from 'bcrypt';

async function run() {
  // Get allowed company_role values
  const c = await query(`SELECT pg_get_constraintdef(cc.oid) AS def
    FROM pg_constraint cc
    JOIN pg_class t ON t.oid = cc.conrelid
    WHERE t.relname = 'users' AND cc.contype = 'c'`);
  console.log('Constraints:', c.rows.map(r => r.def));

  // Also show existing roles
  const roles = await query(`SELECT DISTINCT company_role FROM users LIMIT 10`);
  console.log('Existing roles:', roles.rows);

  await pool.end();
}
run();
