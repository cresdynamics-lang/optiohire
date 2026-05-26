const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedUser() {
  try {
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_verified)
      VALUES ('candidate@optiohire.com', '$2b$10$Y3H8M.3R.qIeH.x2mU/a7u4/G05lD4v7H3hD2J.q5t1wG/g5c6k3O', 'candidate', 'Test', 'Candidate', true)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = '$2b$10$Y3H8M.3R.qIeH.x2mU/a7u4/G05lD4v7H3hD2J.q5t1wG/g5c6k3O',
        role = 'candidate';
        
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_verified)
      VALUES ('company@optiohire.com', '$2b$10$Y3H8M.3R.qIeH.x2mU/a7u4/G05lD4v7H3hD2J.q5t1wG/g5c6k3O', 'company', 'Test', 'Company', true)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = '$2b$10$Y3H8M.3R.qIeH.x2mU/a7u4/G05lD4v7H3hD2J.q5t1wG/g5c6k3O',
        role = 'company';
    `);
    console.log('Candidate and Company accounts seeded.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUser();
