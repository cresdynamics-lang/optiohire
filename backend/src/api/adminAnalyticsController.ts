import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import type { AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'

/**
 * Enhanced Analytics Controller
 * Provides detailed analytics and metrics for admin dashboard
 */

export async function getEnhancedStats(req: AuthRequest, res: Response) {
  try {
    // Get basic stats
    const [usersStats, companiesStats, jobsStats, applicationsStats, reportsStats] = await Promise.all([
      // Users statistics
      query<{ total: number; active: number; admins: number; pending: number }>(
        `SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE is_active = true)::int as active,
          COUNT(*) FILTER (WHERE role = 'admin')::int as admins,
          COUNT(*) FILTER (WHERE admin_approval_status = 'pending')::int as pending
         FROM users`
      ),
      
      // Companies statistics
      query<{ total: number }>(
        `SELECT COUNT(*)::int as total FROM companies`
      ),
      
      // Jobs statistics
      query<{ total: number; active: number; closed: number; draft: number }>(
        `SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')::int as active,
          COUNT(*) FILTER (WHERE status = 'CLOSED')::int as closed,
          COUNT(*) FILTER (WHERE status = 'DRAFT')::int as draft
         FROM job_postings`
      ),
      
      // Applications statistics
      query<{ total: number; shortlisted: number; flagged: number; rejected: number; pending: number; avg_score: number }>(
        `SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE ai_status = 'SHORTLIST')::int as shortlisted,
          COUNT(*) FILTER (WHERE ai_status = 'FLAG')::int as flagged,
          COUNT(*) FILTER (WHERE ai_status = 'REJECT')::int as rejected,
          COUNT(*) FILTER (WHERE ai_status IS NULL)::int as pending,
          ROUND(AVG(ai_score)::numeric, 2)::float as avg_score
         FROM applications`
      ),
      
      // Reports statistics
      query<{ total: number }>(
        `SELECT COUNT(*)::int as total FROM reports`
      )
    ])

    // Get trends (last 30 days)
    const trends = await query<{ date: string; users: number; jobs: number; applications: number }>(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE table_name = 'users')::int as users,
        COUNT(*) FILTER (WHERE table_name = 'job_postings')::int as jobs,
        COUNT(*) FILTER (WHERE table_name = 'applications')::int as applications
       FROM (
         SELECT created_at, 'users' as table_name FROM users
         UNION ALL
         SELECT created_at, 'job_postings' as table_name FROM job_postings
         UNION ALL
         SELECT created_at, 'applications' as table_name FROM applications
       ) combined
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    )

    // Get top companies by job count
    const topCompanies = await query<{ company_id: string; company_name: string; job_count: number; application_count: number }>(
      `SELECT 
        c.company_id,
        c.company_name,
        COUNT(DISTINCT jp.job_posting_id)::int as job_count,
        COUNT(DISTINCT a.application_id)::int as application_count
       FROM companies c
       LEFT JOIN job_postings jp ON jp.company_id = c.company_id
       LEFT JOIN applications a ON a.company_id = c.company_id
       GROUP BY c.company_id, c.company_name
       ORDER BY job_count DESC, application_count DESC
       LIMIT 10`
    )

    // Get application status distribution
    const statusDistribution = await query<{ status: string; count: number; percentage: number }>(
      `SELECT 
        COALESCE(ai_status, 'PENDING') as status,
        COUNT(*)::int as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2)::float as percentage
       FROM applications
       GROUP BY ai_status
       ORDER BY count DESC`
    )

    // Get average scores by status
    const scoreByStatus = await query<{ status: string; avg_score: number; min_score: number; max_score: number }>(
      `SELECT 
        COALESCE(ai_status, 'PENDING') as status,
        ROUND(AVG(ai_score)::numeric, 2)::float as avg_score,
        MIN(ai_score)::int as min_score,
        MAX(ai_score)::int as max_score
       FROM applications
       WHERE ai_score IS NOT NULL
       GROUP BY ai_status
       ORDER BY avg_score DESC`
    )

    return res.json({
      users: usersStats.rows[0],
      companies: companiesStats.rows[0],
      job_postings: jobsStats.rows[0],
      applications: applicationsStats.rows[0],
      reports: reportsStats.rows[0],
      trends: trends.rows,
      topCompanies: topCompanies.rows,
      statusDistribution: statusDistribution.rows,
      scoreByStatus: scoreByStatus.rows,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    logger.error('Error fetching enhanced stats:', error)
    return res.status(500).json({ error: 'Failed to fetch statistics', details: error.message })
  }
}

/**
 * Get time-series analytics
 */
export async function getTimeSeriesAnalytics(req: AuthRequest, res: Response) {
  try {
    const { period = '7d', metric = 'all' } = req.query
    
    // Parse period
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 7
    
    let queryStr = ''
    const params: any[] = [days]
    
    if (metric === 'applications' || metric === 'all') {
      queryStr += `
        SELECT 
          DATE(created_at) as date,
          'applications' as metric,
          COUNT(*)::int as value
        FROM applications
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
      `
    }
    
    if (metric === 'all') {
      queryStr += ' UNION ALL '
    }
    
    if (metric === 'jobs' || metric === 'all') {
      queryStr += `
        SELECT 
          DATE(created_at) as date,
          'jobs' as metric,
          COUNT(*)::int as value
        FROM job_postings
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
      `
    }
    
    if (metric === 'all') {
      queryStr += ' UNION ALL '
    }
    
    if (metric === 'users' || metric === 'all') {
      queryStr += `
        SELECT 
          DATE(created_at) as date,
          'users' as metric,
          COUNT(*)::int as value
        FROM users
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
      `
    }
    
    queryStr += ' ORDER BY date DESC, metric'
    
    const result = await query<{ date: string; metric: string; value: number }>(queryStr, params)
    
    return res.json({
      period,
      metric,
      data: result.rows,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    logger.error('Error fetching time series analytics:', error)
    return res.status(500).json({ error: 'Failed to fetch analytics', details: error.message })
  }
}
