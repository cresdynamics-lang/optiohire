import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'

/**
 * Log admin actions for audit trail
 */
export async function logAdminAction(
  req: AuthRequest,
  actionType: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const adminUserId = req.userId
    const ipAddress = req.ip || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    await query(
      `INSERT INTO admin_action_logs (admin_user_id, action_type, entity_type, entity_id, action_details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        adminUserId,
        actionType,
        entityType,
        entityId || null,
        JSON.stringify(details || {}),
        ipAddress || null,
        userAgent || null
      ]
    )
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Don't throw - logging failures shouldn't break the operation
  }
}

/**
 * Track time/activity for analytics
 */
export async function trackActivity(
  userId: string | null,
  actionType: string,
  endpoint?: string,
  method?: string,
  responseTimeMs?: number,
  statusCode?: number,
  metadata?: Record<string, any>
) {
  try {
    const ipAddress = null // Can be extracted from request if needed
    const userAgent = null

    await query(
      `INSERT INTO time_tracking (user_id, action_type, endpoint, method, response_time_ms, status_code, metadata, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        userId,
        actionType,
        endpoint || null,
        method || null,
        responseTimeMs || null,
        statusCode || null,
        JSON.stringify(metadata || {}),
        ipAddress,
        userAgent
      ]
    )
  } catch (error) {
    console.error('Failed to track activity:', error)
    // Don't throw - tracking failures shouldn't break the operation
  }
}

