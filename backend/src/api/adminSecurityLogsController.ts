import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

export async function getSecurityLogs(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0
    
    // Check if the table exists (fallback for pending migrations)
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'security_audit_logs'
      );
    `)
    
    if (!tableCheck.rows[0]?.exists) {
       return res.json({ logs: [], total: 0, warning: 'Table not migrated yet' })
    }

    const { rows: logs, rowCount } = await query(
      `SELECT * FROM security_audit_logs ORDER BY scan_date DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const countQuery = await query(`SELECT count(*) FROM security_audit_logs`)
    const total = parseInt(countQuery.rows[0].count, 10)

    return res.json({
      logs,
      total,
    })
  } catch (error) {
    logger.error('Failed to fetch security logs:', error)
    return res.status(500).json({ error: 'Failed to fetch security logs' })
  }
}
