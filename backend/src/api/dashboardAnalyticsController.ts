import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import openRouterService from '../services/ai/openRouterService.js'
import { logger } from '../utils/logger.js'

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

    // 1. Candidate Funnel (Counts by ai_status)
    const { rows: funnelRows } = await query<{ ai_status: string | null, count: string }>(
      `SELECT ai_status, COUNT(*) as count 
       FROM applications 
       WHERE company_id = $1 
       GROUP BY ai_status`,
      [companyId]
    )

    const funnel = {
      applied: 0,
      shortlisted: 0,
      interviewing: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      flagged: 0
    }

    for (const row of funnelRows) {
      const count = parseInt(row.count, 10)
      funnel.applied += count
      const status = (row.ai_status || '').toUpperCase()
      if (status === 'SHORTLIST') funnel.shortlisted += count
      if (status === 'HIRED') funnel.hired += count
      if (status === 'REJECT' || status === 'REJECTED') funnel.rejected += count
      if (status === 'FLAG') funnel.flagged += count
    }

    // 2. Time-to-Hire
    const { rows: timeToHireRows } = await query<{ job_title: string, avg_days: string }>(
      `SELECT 
         j.job_title, 
         AVG(EXTRACT(EPOCH FROM (a.hired_at - a.created_at)) / 86400)::numeric(10,1) as avg_days
       FROM applications a
       JOIN job_postings j ON a.job_posting_id = j.job_posting_id
       WHERE a.company_id = $1 AND a.ai_status = 'HIRED' AND a.hired_at IS NOT NULL
       GROUP BY j.job_title`,
      [companyId]
    )

    // 3. Job Health & Ranking
    const { rows: jobHealthRows } = await query<{
      job_title: string,
      total_apps: string,
      hired_apps: string,
      avg_score: string
    }>(
      `SELECT 
         j.job_title,
         COUNT(a.application_id) as total_apps,
         SUM(CASE WHEN a.ai_status = 'HIRED' THEN 1 ELSE 0 END) as hired_apps,
         AVG(a.ai_score)::numeric(10,1) as avg_score
       FROM job_postings j
       LEFT JOIN applications a ON j.job_posting_id = a.job_posting_id
       WHERE j.company_id = $1
       GROUP BY j.job_title`,
      [companyId]
    )

    const jobRankings = jobHealthRows.map(row => {
      const total = parseInt(row.total_apps || '0', 10)
      const hired = parseInt(row.hired_apps || '0', 10)
      const score = parseFloat(row.avg_score || '0')
      
      const hireRate = total > 0 ? (hired / total) * 100 : 0
      
      // Custom formula for Health Score (0-100)
      // Volume matters up to 50 applicants, Hire Rate up to 20%, Score matters
      const volumeScore = Math.min((total / 50) * 100, 100) * 0.3
      const qualityScore = score * 0.4 // ai_score is 0-100
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

    // 4. Hiring Velocity (Last 6 months)
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
      timeToHire: timeToHireRows.map(r => ({ jobTitle: r.job_title, avgDays: parseFloat(r.avg_days || '0') })),
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
Time to Hire: ${JSON.stringify(payload.timeToHire)}
Job Health: ${JSON.stringify(jobRankings)}
Velocity: ${JSON.stringify(payload.velocity)}
`
      const systemPrompt = "You are an HR Analytics AI. Provide insights strictly as a JSON array of objects."
      const insightsText = await openRouterService.generateText(prompt, undefined, {
        systemPrompt,
        maxTokens: 600,
        temperature: 0.3
      })
      
      // Attempt to parse the JSON array
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

    return res.status(200).json(payload)
  } catch (error: any) {
    logger.error('Error fetching dashboard analytics:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}
