/**
 * Admin telemetry endpoints for activity analytics
 */

import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

/**
 * Get activity telemetry data for charts
 * GET /api/admin/telemetry/activity
 */
export async function getActivityTelemetry(req: Request, res: Response) {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query

    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'time_tracking'
      ) AS exists
    `)

    if (!tableCheck.rows[0]?.exists) {
      return res.json({
        timeSeries: [],
        actionTypes: [],
        statusCodes: [],
        topUsers: [],
        responseTimeDistribution: [],
        topEndpoints: [],
        warning: 'time_tracking table has not been migrated yet',
      })
    }

    let dateFilter = ''
    const params: any[] = []
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2'
      params.push(startDate, endDate)
    }

    // Activity over time (line chart)
    const timeSeriesQuery = `
      SELECT 
        DATE_TRUNC(${groupBy === 'hour' ? 'hour' : groupBy === 'day' ? 'day' : 'day'}, created_at) as date,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
        AVG(response_time_ms) as avg_response_time
      FROM time_tracking
      ${dateFilter}
      GROUP BY DATE_TRUNC(${groupBy === 'hour' ? 'hour' : groupBy === 'day' ? 'day' : 'day'}, created_at)
      ORDER BY date ASC
    `

    const { rows: timeSeries } = await query(timeSeriesQuery, params)

    // Action types distribution (pie chart)
    const actionTypesQuery = `
      SELECT 
        action_type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count
      FROM time_tracking
      ${dateFilter}
      GROUP BY action_type
      ORDER BY count DESC
    `

    const { rows: actionTypes } = await query(actionTypesQuery, params)

    // Status code distribution (pie chart)
    let statusCodesQuery = `
      SELECT 
        CASE 
          WHEN status_code >= 200 AND status_code < 300 THEN '2xx Success'
          WHEN status_code >= 300 AND status_code < 400 THEN '3xx Redirect'
          WHEN status_code >= 400 AND status_code < 500 THEN '4xx Client Error'
          WHEN status_code >= 500 THEN '5xx Server Error'
          ELSE 'Unknown'
        END as status_category,
        COUNT(*) as count
      FROM time_tracking
      WHERE status_code IS NOT NULL
    `
    if (dateFilter) {
      statusCodesQuery += ` AND created_at BETWEEN $1 AND $2`
    }
    statusCodesQuery += ` GROUP BY status_category ORDER BY count DESC`

    const statusParams = dateFilter ? params : []
    const { rows: statusCodes } = await query(statusCodesQuery, statusParams)

    // Top users by activity (bar chart)
    let topUsersQuery = `
      SELECT 
        u.email as user_email,
        u.name as user_name,
        COUNT(*) as activity_count,
        COUNT(*) FILTER (WHERE tt.status_code >= 200 AND tt.status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE tt.status_code >= 400) as error_count
      FROM time_tracking tt
      LEFT JOIN users u ON u.user_id = tt.user_id
      ${dateFilter}
      GROUP BY u.user_id, u.email, u.name
      HAVING COUNT(*) > 0
      ORDER BY activity_count DESC
      LIMIT 10
    `

    const { rows: topUsers } = await query(topUsersQuery, params)

    // Response time distribution (histogram data)
    let responseTimeQuery = `
      SELECT 
        CASE 
          WHEN response_time_ms < 100 THEN '0-100ms'
          WHEN response_time_ms < 500 THEN '100-500ms'
          WHEN response_time_ms < 1000 THEN '500ms-1s'
          WHEN response_time_ms < 2000 THEN '1s-2s'
          ELSE '2s+'
        END as time_range,
        COUNT(*) as count
      FROM time_tracking
      WHERE response_time_ms IS NOT NULL
    `
    if (dateFilter) {
      responseTimeQuery += ` AND created_at BETWEEN $1 AND $2`
    }
    responseTimeQuery += ` GROUP BY time_range
      ORDER BY 
        CASE time_range
          WHEN '0-100ms' THEN 1
          WHEN '100-500ms' THEN 2
          WHEN '500ms-1s' THEN 3
          WHEN '1s-2s' THEN 4
          ELSE 5
        END
    `

    const responseTimeParams = dateFilter ? params : []
    const { rows: responseTimeDist } = await query(responseTimeQuery, responseTimeParams)

    // Endpoint activity (top endpoints)
    let topEndpointsQuery = `
      SELECT 
        endpoint,
        method,
        COUNT(*) as count,
        AVG(response_time_ms) as avg_response_time,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
        COUNT(*) FILTER (WHERE status_code >= 400) as error_count
      FROM time_tracking
      WHERE endpoint IS NOT NULL
    `
    if (dateFilter) {
      topEndpointsQuery += ` AND created_at BETWEEN $1 AND $2`
    }
    topEndpointsQuery += ` GROUP BY endpoint, method ORDER BY count DESC LIMIT 15`

    const topEndpointsParams = dateFilter ? params : []
    const { rows: topEndpoints } = await query(topEndpointsQuery, topEndpointsParams)

    res.json({
      timeSeries: timeSeries.map(row => ({
        date: row.date,
        count: Number(row.count),
        successCount: Number(row.success_count || 0),
        errorCount: Number(row.error_count || 0),
        avgResponseTime: row.avg_response_time ? Number(row.avg_response_time) : null
      })),
      actionTypes: actionTypes.map(row => ({
        actionType: row.action_type || 'Unknown',
        count: Number(row.count),
        successCount: Number(row.success_count || 0),
        errorCount: Number(row.error_count || 0)
      })),
      statusCodes: statusCodes.map(row => ({
        category: row.status_category,
        count: Number(row.count)
      })),
      topUsers: topUsers.map(row => ({
        userEmail: row.user_email || 'Anonymous',
        userName: row.user_name || null,
        activityCount: Number(row.activity_count),
        successCount: Number(row.success_count || 0),
        errorCount: Number(row.error_count || 0)
      })),
      responseTimeDistribution: responseTimeDist.map(row => ({
        timeRange: row.time_range,
        count: Number(row.count)
      })),
      topEndpoints: topEndpoints.map(row => ({
        endpoint: row.endpoint,
        method: row.method || 'Unknown',
        count: Number(row.count),
        avgResponseTime: row.avg_response_time ? Number(row.avg_response_time) : null,
        successCount: Number(row.success_count || 0),
        errorCount: Number(row.error_count || 0)
      }))
    })
  } catch (err: any) {
    logger.error('Error getting activity telemetry:', err)
    res.status(500).json({ error: err.message || 'Failed to fetch activity telemetry' })
  }
}
