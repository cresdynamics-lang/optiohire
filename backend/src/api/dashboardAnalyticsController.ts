import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import openRouterService from '../services/ai/openRouterService.js'
import { logger } from '../utils/logger.js'

import { cache, cacheKeys } from '../utils/redis.js'

/**
 * Refreshes the materialized views used for dashboard analytics.
 * This can be called after significant changes or via cron.
 */
export async function refreshAnalyticsViews() {
  try {
    // CONCURRENTLY allows reading while refreshing (requires a unique index on the view)
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_company_funnel_stats')
    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_job_performance_stats')
    logger.info('✅ Dashboard analytics materialized views refreshed')
  } catch (err) {
    // Fallback if unique index isn't ready or other issue
    try {
      await query('REFRESH MATERIALIZED VIEW mv_company_funnel_stats')
      await query('REFRESH MATERIALIZED VIEW mv_job_performance_stats')
    } catch (fallbackErr) {
      logger.error('❌ Failed to refresh analytics views:', fallbackErr)
    }
  }
}

export async function getDashboardAnalytics(req: any, res: Response) {
  try {
    const userId = req.userId
    const userEmail = req.userEmail

    if (!userId && !userEmail) {
      return res.status(401).json({ error: 'User not authenticated' })
    }

    // Get user's company
    let companyId: string | null = null
    
    // Check if user_id column exists
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' AND column_name = 'user_id'
    `)
    
    if (checkColumn.rows.length > 0) {
      const companyResult = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE user_id = $1 LIMIT 1`,
        [userId]
      )
      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].company_id
      }
    }
    
    if (!companyId && userEmail) {
      const companyResult = await query<{ company_id: string }>(
        `SELECT company_id FROM companies WHERE hr_email = $1 OR company_email = $1 LIMIT 1`,
        [userEmail.toLowerCase()]
      )
      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].company_id
      }
    }

    if (!companyId) {
      return res.status(404).json({ error: 'Company not found' })
    }

    // Try cache first
    const cacheKey = cacheKeys.dashboardOverview(companyId)
    const cached = await cache.get<any>(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // NEW: Use Materialized View for Candidate Funnel & Global Stats
    const { rows: funnelRows } = await query<{ 
      total_applied: string, 
      shortlisted: string, 
      hired: string, 
      rejected: string, 
      flagged: string,
      avg_days_to_hire: string 
    }>(
      `SELECT * FROM mv_company_funnel_stats WHERE company_id = $1`,
      [companyId]
    )

    const stats = funnelRows[0] || {
      total_applied: '0',
      shortlisted: '0',
      hired: '0',
      rejected: '0',
      flagged: '0',
      avg_days_to_hire: '0'
    }

    const funnel = {
      applied: parseInt(stats.total_applied, 10),
      shortlisted: parseInt(stats.shortlisted, 10),
      interviewing: 0, // Not currently tracked in view
      offered: 0,      // Not currently tracked in view
      hired: parseInt(stats.hired, 10),
      rejected: parseInt(stats.rejected, 10),
      flagged: parseInt(stats.flagged, 10)
    }

    // NEW: Use Materialized View for Job Performance
    const { rows: jobHealthRows } = await query<{
      job_title: string,
      total_apps: string,
      hired_apps: string,
      avg_score: string,
      avg_days_to_hire: string
    }>(
      `SELECT * FROM mv_job_performance_stats WHERE company_id = $1`,
      [companyId]
    )

    const jobRankings = jobHealthRows.map(row => {
      const total = parseInt(row.total_apps || '0', 10)
      const hired = parseInt(row.hired_apps || '0', 10)
      const score = parseFloat(row.avg_score || '0')
      
      const hireRate = total > 0 ? (hired / total) * 100 : 0
      
      const volumeScore = Math.min((total / 50) * 100, 100) * 0.3
      const qualityScore = score * 0.4
      const rateScore = Math.min((hireRate / 20) * 100, 100) * 0.3
      
      const healthScore = Math.round(volumeScore + qualityScore + rateScore)
      
      let status = 'Needs Attention'
      if (healthScore >= 80) status = 'Excellent'
      else if (healthScore >= 50) status = 'Moderate'

      return {
        jobTitle: row.job_title,
        totalApplicants: total,
        hireRate: Math.round(hireRate),
        avgScore: score,
        healthScore,
        status
      }
    }).sort((a, b) => b.healthScore - a.healthScore)

    // 4. Hiring Velocity (Last 6 months) - Optimized with index
    const { rows: velocityRows } = await query<{ month: string, applications: string, hires: string }>(
      `SELECT 
         to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
         COUNT(*) as applications,
         SUM(CASE WHEN ai_status = 'HIRED' THEN 1 ELSE 0 END) as hires
       FROM applications
       WHERE company_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at) ASC`,
      [companyId]
    )

    const payload = {
      funnel,
      timeToHire: jobHealthRows.map(r => ({ 
        jobTitle: r.job_title, 
        avgDays: parseFloat(r.avg_days_to_hire || '0') 
      })),
      jobRankings,
      velocity: velocityRows.map(r => ({
        month: r.month,
        applications: parseInt(r.applications || '0', 10),
        hires: parseInt(r.hires || '0', 10)
      })),
      aiInsights: [] as any
    }

    // 5. Generate AI Insights
    try {
      const prompt = `
You are an expert HR Analyst for OptioHire. 
Analyze the following recruitment data for a company and provide 3-4 actionable insights.
Instead of plain text, you MUST return ONLY a valid JSON array of objects. 
Each object must have the following structure:
{
  "title": "Short title of the insight",
  "description": "Detailed explanation of the insight",
  "weight": "critical" | "positive" | "warning" | "neutral"
}

Data:
Funnel: ${JSON.stringify(funnel)}
Job Health: ${JSON.stringify(jobRankings)}
Velocity: ${JSON.stringify(payload.velocity)}
`
      const systemPrompt = "You are an HR Analytics AI. Provide insights strictly as a JSON array of objects."
      const insightsText = await openRouterService.generateText(prompt, undefined, {
        systemPrompt,
        maxTokens: 600,
        temperature: 0.3
      })
      
      const match = insightsText.match(/\[.*\]/s)
      if (match) {
        payload.aiInsights = JSON.parse(match[0])
      } else {
        payload.aiInsights = JSON.parse(insightsText)
      }
    } catch (err: any) {
      logger.warn('Failed to generate AI insights for dashboard:', err.message)
      payload.aiInsights = [{
        title: "Insights Unavailable",
        description: "AI insights could not be generated at this time.",
        weight: "warning"
      }]
    }

    // Cache for 10 minutes
    await cache.set(cacheKey, payload, 600)

    return res.status(200).json(payload)
  } catch (error: any) {
    logger.error('Error fetching dashboard analytics:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
