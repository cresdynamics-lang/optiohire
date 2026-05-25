import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

async function main() {
  if (!connectionString) {
    console.error('DATABASE_URL not set in .env');
    return;
  }
  const client = new pg.Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB');
    const res = await client.query('SELECT * FROM users WHERE email = $1', ['admin@optiohire.com']);
    if (res.rows.length === 0) {
      console.log('Admin user NOT found!');
    } else {
      const user = res.rows[0];
      console.log('Admin user found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        company_role: user.company_role,
        password_hash: user.password_hash
      });
      // Test password comparison
      const match = await bcrypt.compare('OptiohIre@Admin123', user.password_hash);
      console.log('Password match test (OptiohIre@Admin123):', match);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

main();
