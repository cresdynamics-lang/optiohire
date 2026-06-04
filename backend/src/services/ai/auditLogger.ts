import { query } from '../../db/index.js'
import { logger } from '../../utils/logger.js'

export interface AuditLogEntry {
  candidateEmail?: string
  jobId?: string
  severity: 'NONE' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  actionTaken: 'PROCESSED' | 'FLAGGED' | 'AUTO_REJECTED'
  detectedPatterns: string[]
  aiScoreOriginal?: number
  ruleScore?: number
  divergenceFlag?: boolean
}

export async function saveAuditLog(entry: AuditLogEntry) {
  try {
    const sql = `
      INSERT INTO security_audit_logs 
        (candidate_email, job_id, severity, action_taken, detected_patterns, ai_score_original, rule_score, divergence_flag)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
    `
    const params = [
      entry.candidateEmail || null,
      entry.jobId || null,
      entry.severity,
      entry.actionTaken,
      entry.detectedPatterns,
      entry.aiScoreOriginal || null,
      entry.ruleScore || null,
      entry.divergenceFlag || false
    ]
    
    // We swallow errors here so a failed DB log insert doesn't crash the pipeline,
    // but we write it to the local system logger as a fallback.
    await query(sql, params).catch(e => {
      logger.error('Failed to insert into security_audit_logs, falling back to local logger', e)
      logger.warn(`[SECURITY_AUDIT_FALLBACK] ${JSON.stringify(entry)}`)
    })
  } catch (error) {
    logger.error('Audit log save failed entirely', error)
  }
}
