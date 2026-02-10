import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logAdminAction } from '../utils/adminLogger.js'
import { EmailService } from '../services/emailService.js'

// ============================================================================
// SIGNUP QUEUE MANAGEMENT
// ============================================================================

export async function getPendingSignups(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', status = 'pending' } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const { rows } = await query(
      `SELECT sq.*, u.email, u.name, u.created_at as user_created_at,
              c.company_name, c.company_email
       FROM signup_queue sq
       JOIN users u ON u.user_id = sq.user_id
       LEFT JOIN companies c ON c.user_id = u.user_id
       WHERE sq.status = $1
       ORDER BY sq.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, Number(limit), offset]
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM signup_queue WHERE status = $1`,
      [status]
    )

    return res.json({
      signups: rows,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    console.error('Get pending signups error:', err)
    return res.status(500).json({ error: 'Failed to fetch pending signups' })
  }
}

export async function approveSignup(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const { reason } = req.body || {}

    // Update user to active
    await query(
      `UPDATE users SET is_active = true WHERE user_id = $1`,
      [userId]
    )

    // Update signup queue
    await query(
      `UPDATE signup_queue 
       SET status = 'approved', reviewed_by = $1, reviewed_at = now()
       WHERE user_id = $2`,
      [req.userId, userId]
    )

    await logAdminAction(req, 'approve_signup', 'user', userId, { reason })

    return res.json({ success: true, message: 'Signup approved successfully' })
  } catch (err) {
    console.error('Approve signup error:', err)
    return res.status(500).json({ error: 'Failed to approve signup' })
  }
}

export async function rejectSignup(req: AuthRequest, res: Response) {
  try {
    const { userId } = req.params
    const { reason } = req.body || {}

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    // Deactivate user
    await query(
      `UPDATE users SET is_active = false WHERE user_id = $1`,
      [userId]
    )

    // Update signup queue
    await query(
      `UPDATE signup_queue 
       SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
       WHERE user_id = $3`,
      [reason, req.userId, userId]
    )

    await logAdminAction(req, 'reject_signup', 'user', userId, { reason })

    return res.json({ success: true, message: 'Signup rejected successfully' })
  } catch (err) {
    console.error('Reject signup error:', err)
    return res.status(500).json({ error: 'Failed to reject signup' })
  }
}

export async function bulkApproveSignups(req: AuthRequest, res: Response) {
  try {
    const { userIds } = req.body || {}
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' })
    }

    await query(
      `UPDATE users SET is_active = true WHERE user_id = ANY($1)`,
      [userIds]
    )

    await query(
      `UPDATE signup_queue 
       SET status = 'approved', reviewed_by = $1, reviewed_at = now()
       WHERE user_id = ANY($2)`,
      [req.userId, userIds]
    )

    await logAdminAction(req, 'bulk_approve_signups', 'user', undefined, { count: userIds.length })

    return res.json({ success: true, message: `${userIds.length} signups approved` })
  } catch (err) {
    console.error('Bulk approve signups error:', err)
    return res.status(500).json({ error: 'Failed to bulk approve signups' })
  }
}

export async function bulkRejectSignups(req: AuthRequest, res: Response) {
  try {
    const { userIds, reason } = req.body || {}
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds array is required' })
    }
    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' })
    }

    await query(
      `UPDATE users SET is_active = false WHERE user_id = ANY($1)`,
      [userIds]
    )

    await query(
      `UPDATE signup_queue 
       SET status = 'rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = now()
       WHERE user_id = ANY($3)`,
      [reason, req.userId, userIds]
    )

    await logAdminAction(req, 'bulk_reject_signups', 'user', undefined, { count: userIds.length, reason })

    return res.json({ success: true, message: `${userIds.length} signups rejected` })
  } catch (err) {
    console.error('Bulk reject signups error:', err)
    return res.status(500).json({ error: 'Failed to bulk reject signups' })
  }
}

// ============================================================================
// EMAIL MANAGEMENT
// ============================================================================

export async function getEmailLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', status, emailType, recipient, startDate, endDate } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE 1=1'
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`
      params.push(status)
    }
    if (emailType) {
      whereClause += ` AND email_type = $${paramIndex++}`
      params.push(emailType)
    }
    if (recipient) {
      whereClause += ` AND recipient_email ILIKE $${paramIndex++}`
      params.push(`%${recipient}%`)
    }
    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`
      params.push(endDate)
    }

    const { rows } = await query(
      `SELECT * FROM email_logs 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM email_logs ${whereClause}`,
      params.slice(2)
    )

    return res.json({
      emails: rows,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    console.error('Get email logs error:', err)
    return res.status(500).json({ error: 'Failed to fetch email logs' })
  }
}

export async function getEmailStats(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query
    let whereClause = ''
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    const { rows } = await query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
       FROM email_logs ${whereClause}`,
      params
    )

    return res.json({ stats: rows[0] })
  } catch (err) {
    console.error('Get email stats error:', err)
    return res.status(500).json({ error: 'Failed to fetch email statistics' })
  }
}

export async function resendEmail(req: AuthRequest, res: Response) {
  try {
    const { emailId } = req.params

    const { rows } = await query(
      `SELECT * FROM email_logs WHERE email_id = $1`,
      [emailId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Email log not found' })
    }

    const emailLog = rows[0]

    // Resend email using EmailService
    const emailService = new EmailService()
    await emailService.sendEmail({
      to: emailLog.recipient_email,
      subject: emailLog.subject,
      html: emailLog.metadata?.html || '',
      text: emailLog.metadata?.text || ''
    })

    await logAdminAction(req, 'resend_email', 'email', emailId, { recipient: emailLog.recipient_email })

    return res.json({ success: true, message: 'Email resent successfully' })
  } catch (err) {
    console.error('Resend email error:', err)
    return res.status(500).json({ error: 'Failed to resend email' })
  }
}

// ============================================================================
// SYSTEM SETTINGS MANAGEMENT
// ============================================================================

export async function getSystemSettings(req: Request, res: Response) {
  try {
    const { category } = req.query

    let whereClause = ''
    const params: any[] = []
    if (category) {
      whereClause = 'WHERE category = $1'
      params.push(category)
    }

    const { rows } = await query(
      `SELECT * FROM system_settings ${whereClause} ORDER BY category, setting_key`,
      params
    )

    return res.json({ settings: rows })
  } catch (err) {
    console.error('Get system settings error:', err)
    return res.status(500).json({ error: 'Failed to fetch system settings' })
  }
}

export async function updateSystemSetting(req: AuthRequest, res: Response) {
  try {
    const { settingKey } = req.params
    const { settingValue, description } = req.body || {}

    if (!settingValue) {
      return res.status(400).json({ error: 'settingValue is required' })
    }

    await query(
      `UPDATE system_settings 
       SET setting_value = $1, description = COALESCE($2, description), updated_by = $3, updated_at = now()
       WHERE setting_key = $4`,
      [JSON.stringify(settingValue), description, req.userId, settingKey]
    )

    await logAdminAction(req, 'update_setting', 'system_setting', settingKey, { value: settingValue })

    return res.json({ success: true, message: 'Setting updated successfully' })
  } catch (err) {
    console.error('Update system setting error:', err)
    return res.status(500).json({ error: 'Failed to update system setting' })
  }
}

export async function getFeatureFlags(req: Request, res: Response) {
  try {
    const { rows } = await query(
      `SELECT setting_key, setting_value, description 
       FROM system_settings 
       WHERE category = 'features'`
    )

    const flags: Record<string, boolean> = {}
    rows.forEach((row: any) => {
      flags[row.setting_key] = JSON.parse(row.setting_value)
    })

    return res.json({ featureFlags: flags })
  } catch (err) {
    console.error('Get feature flags error:', err)
    return res.status(500).json({ error: 'Failed to fetch feature flags' })
  }
}

export async function updateFeatureFlag(req: AuthRequest, res: Response) {
  try {
    const { flagKey } = req.params
    const { value } = req.body || {}

    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'value must be a boolean' })
    }

    await query(
      `UPDATE system_settings 
       SET setting_value = $1, updated_by = $2, updated_at = now()
       WHERE setting_key = $3 AND category = 'features'`,
      [JSON.stringify(value), req.userId, flagKey]
    )

    await logAdminAction(req, 'update_feature_flag', 'system_setting', flagKey, { value })

    return res.json({ success: true, message: 'Feature flag updated successfully' })
  } catch (err) {
    console.error('Update feature flag error:', err)
    return res.status(500).json({ error: 'Failed to update feature flag' })
  }
}

// ============================================================================
// TIME TRACKING & ACTIVITY
// ============================================================================

export async function getActivityLogs(req: Request, res: Response) {
  try {
    const { page = '1', limit = '50', userId, actionType, startDate, endDate } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let whereClause = 'WHERE 1=1'
    const params: any[] = [Number(limit), offset]
    let paramIndex = 3

    if (userId) {
      whereClause += ` AND user_id = $${paramIndex++}`
      params.push(userId)
    }
    if (actionType) {
      whereClause += ` AND action_type = $${paramIndex++}`
      params.push(actionType)
    }
    if (startDate) {
      whereClause += ` AND created_at >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramIndex++}`
      params.push(endDate)
    }

    const { rows } = await query(
      `SELECT tt.*, u.email as user_email, u.name as user_name
       FROM time_tracking tt
       LEFT JOIN users u ON u.user_id = tt.user_id
       ${whereClause}
       ORDER BY tt.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    )

    const { rows: countRows } = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM time_tracking ${whereClause}`,
      params.slice(2)
    )

    return res.json({
      activities: rows,
      total: Number(countRows[0].count),
      page: Number(page),
      limit: Number(limit)
    })
  } catch (err) {
    console.error('Get activity logs error:', err)
    return res.status(500).json({ error: 'Failed to fetch activity logs' })
  }
}

export async function getPerformanceMetrics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query
    let whereClause = ''
    const params: any[] = []

    if (startDate && endDate) {
      whereClause = 'WHERE created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    const { rows } = await query(
      `SELECT 
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms) as median_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count
       FROM time_tracking
       WHERE response_time_ms IS NOT NULL ${whereClause}`,
      params
    )

    return res.json({ metrics: rows[0] })
  } catch (err) {
    console.error('Get performance metrics error:', err)
    return res.status(500).json({ error: 'Failed to fetch performance metrics' })
  }
}

export async function getUserActivity(req: Request, res: Response) {
  try {
    const { userId } = req.params
    const { limit = '100' } = req.query

    const { rows } = await query(
      `SELECT * FROM time_tracking
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, Number(limit)]
    )

    return res.json({ activities: rows })
  } catch (err) {
    console.error('Get user activity error:', err)
    return res.status(500).json({ error: 'Failed to fetch user activity' })
  }
}

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

export async function getWorkflows(req: Request, res: Response) {
  try {
    const { workflowType } = req.query

    let whereClause = ''
    const params: any[] = []
    if (workflowType) {
      whereClause = 'WHERE workflow_type = $1'
      params.push(workflowType)
    }

    const { rows } = await query(
      `SELECT * FROM workflow_config ${whereClause} ORDER BY workflow_type, workflow_name`,
      params
    )

    return res.json({ workflows: rows })
  } catch (err) {
    console.error('Get workflows error:', err)
    return res.status(500).json({ error: 'Failed to fetch workflows' })
  }
}

export async function updateWorkflow(req: AuthRequest, res: Response) {
  try {
    const { workflowId } = req.params
    const { config, is_active, description } = req.body || {}

    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`)
      params.push(JSON.stringify(config))
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      params.push(is_active)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      params.push(description)
    }

    updates.push(`updated_by = $${paramIndex++}`)
    params.push(req.userId)
    params.push(workflowId)

    await query(
      `UPDATE workflow_config 
       SET ${updates.join(', ')}, updated_at = now()
       WHERE workflow_id = $${paramIndex}`,
      params
    )

    await logAdminAction(req, 'update_workflow', 'workflow', workflowId, { config, is_active })

    return res.json({ success: true, message: 'Workflow updated successfully' })
  } catch (err) {
    console.error('Update workflow error:', err)
    return res.status(500).json({ error: 'Failed to update workflow' })
  }
}

