import { pool } from './src/db/index.js';
import * as fs from 'fs';
import * as path from 'path';

async function migrate() {
    console.log('Running demos schema migration...');
    const schemaPath = path.join(process.cwd(), 'src/db/demos_schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    try {
        await pool.query(sql);
        console.log('Successfully ran demos schema migration.');
    } catch (err) {
        console.error('Error running demos schema migration:', err);
    } finally {
        await pool.end();
    }
}

migrate();
