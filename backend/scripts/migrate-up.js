import 'dotenv/config';
import { execSync } from 'child_process';

try {
  execSync('npx node-pg-migrate up', { stdio: 'inherit' });
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
