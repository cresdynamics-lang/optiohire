import { query, pool } from './src/db/index.js';

async function migrateSecurity() {
  console.log('Running security table migration...');
  
  const sql = `
  CREATE TABLE IF NOT EXISTS security_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scan_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      severity VARCHAR(50) NOT NULL,
      issue_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      affected_component VARCHAR(100),
      remediation_plan TEXT,
      status VARCHAR(50) DEFAULT 'open',
      resolved_at TIMESTAMP WITH TIME ZONE,
      resolved_by VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity);
  CREATE INDEX IF NOT EXISTS idx_security_audit_logs_scan_date ON security_audit_logs(scan_date DESC);
  `;
  
  try {
    await query(sql);
    console.log('✅ security_audit_logs table created successfully!');
  } catch (err) {
    console.error('❌ Failed to create security_audit_logs:', err);
  } finally {
    await pool.end();
  }
}

migrateSecurity();
