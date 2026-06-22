import { query } from './backend/src/db/index.js';

async function checkEmails() {
  try {
    const { rows } = await query(`
      SELECT status, COUNT(*) 
      FROM email_logs 
      WHERE email_type = 'ProfileCompletionReminder' 
      GROUP BY status
    `);
    console.log('ProfileCompletionReminder logs:', rows);

    const { rows: failedRows } = await query(`
      SELECT * 
      FROM email_logs 
      WHERE email_type = 'ProfileCompletionReminder' 
        AND status = 'failed' 
      LIMIT 1
    `);
    console.log('Sample failed log:', failedRows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkEmails();
