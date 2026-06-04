import { pool, query } from './src/db/index.js';
import bcrypt from 'bcrypt';

async function run() {
  console.log('Seeding test accounts...');

  // Admin (role=admin, no company_role)
  const adminExists = await query(`SELECT email FROM users WHERE role='admin' LIMIT 1`);
  if (adminExists.rows.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await query(`INSERT INTO users (user_id, email, password_hash, role) VALUES (gen_random_uuid(), 'admin@optiohire.com', $1, 'admin')`, [hash]);
    console.log('✅ Admin created: admin@optiohire.com / admin123');
  } else {
    console.log('✅ Admin exists: ' + adminExists.rows[0].email);
  }

  // HR (role=user, company_role=hr)
  const hrExists = await query(`SELECT email FROM users WHERE company_role='hr' LIMIT 1`);
  if (hrExists.rows.length === 0) {
    const hash = await bcrypt.hash('hr123', 10);
    await query(`INSERT INTO users (user_id, email, password_hash, role, company_role) VALUES (gen_random_uuid(), 'hr@optiohire.com', $1, 'user', 'hr')`, [hash]);
    console.log('✅ HR created: hr@optiohire.com / hr123');
  } else {
    console.log('✅ HR exists: ' + hrExists.rows[0].email);
  }

  // Candidate/Student (role=user, company_role=candidate)
  const candExists = await query(`SELECT email FROM users WHERE company_role='candidate' LIMIT 1`);
  if (candExists.rows.length === 0) {
    const hash = await bcrypt.hash('student123', 10);
    await query(`INSERT INTO users (user_id, email, password_hash, role, company_role) VALUES (gen_random_uuid(), 'student@optiohire.com', $1, 'user', 'candidate')`, [hash]);
    console.log('✅ Student created: student@optiohire.com / student123');
  } else {
    console.log('✅ Student exists: ' + candExists.rows[0].email);
  }

  await pool.end();
}
run();
