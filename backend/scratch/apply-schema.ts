import { query } from '../src/db/index.js';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  try {
    const sqlPath = path.resolve('src/db/admin_schema.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    await query(sql);
    console.log('Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema:', err);
    process.exit(1);
  }
}

main();
