import type { Request, Response } from 'express'
import { query } from '../db/index.js'
import { logger } from '../utils/logger.js'

/**
 * AI Usage Analytics Controller
 * Provides real token consumption, cost, and request data from the ai_usage_logs table.
 */

export async function getAiUsageSummary(req: Request, res: Response) {
  try {
    const { period = '30' } = req.query
    const days = Math.min(365, Math.max(1, Number(period) || 30))

    // Run all queries in parallel
    const [
      summaryResult,
      todayResult,
      dailyResult,
      modelResult,
      recentLogsResult,
      taskResult
    ] = await Promise.all([

      // 1. Period summary: total tokens, total cost, total requests
      query<{
        total_tokens: number
        total_prompt_tokens: number
        total_completion_tokens: number
        total_cost: number
        total_requests: number
      }>(`
        SELECT
          COALESCE(SUM(total_tokens), 0)::bigint   AS total_tokens,
          COALESCE(SUM(prompt_tokens), 0)::bigint   AS total_prompt_tokens,
          COALESCE(SUM(completion_tokens), 0)::bigint AS total_completion_tokens,
          COALESCE(SUM(cost_estimate), 0)::float     AS total_cost,
          COUNT(*)::int                               AS total_requests
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      `, [days]).catch(() => ({
        rows: [{ total_tokens: 0, total_prompt_tokens: 0, total_completion_tokens: 0, total_cost: 0, total_requests: 0 }]
      })),

      // 2. Today's usage
      query<{
        tokens_today: number
        cost_today: number
        requests_today: number
      }>(`
        SELECT
          COALESCE(SUM(total_tokens), 0)::bigint AS tokens_today,
          COALESCE(SUM(cost_estimate), 0)::float  AS cost_today,
          COUNT(*)::int                            AS requests_today
        FROM ai_usage_logs
        WHERE created_at >= CURRENT_DATE
      `).catch(() => ({
        rows: [{ tokens_today: 0, cost_today: 0, requests_today: 0 }]
      })),

      // 3. Daily breakdown for charts
      query<{
        date: string
        tokens: number
        cost: number
        requests: number
      }>(`
        SELECT
          DATE(created_at)                        AS date,
          COALESCE(SUM(total_tokens), 0)::bigint  AS tokens,
          COALESCE(SUM(cost_estimate), 0)::float   AS cost,
          COUNT(*)::int                             AS requests
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [days]).catch(() => ({ rows: [] })),

      // 4. Model breakdown
      query<{
        model: string
        total_tokens: number
        total_cost: number
        request_count: number
      }>(`
        SELECT
          model,
          COALESCE(SUM(total_tokens), 0)::bigint AS total_tokens,
          COALESCE(SUM(cost_estimate), 0)::float  AS total_cost,
          COUNT(*)::int                            AS request_count
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY model
        ORDER BY total_tokens DESC
      `, [days]).catch(() => ({ rows: [] })),

      // 5. Recent individual request logs (last 25)
      query<{
        id: string
        model: string
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
        cost_estimate: number
        created_at: string
        task: string
        user_email: string
      }>(`
        SELECT
          id,
          model,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          cost_estimate,
          created_at,
          task,
          user_email
        FROM ai_usage_logs
        ORDER BY created_at DESC
        LIMIT 25
      `).catch(() => ({ rows: [] })),

      // 6. Task breakdown
      query<{
        task: string
        total_tokens: number
        total_prompt_tokens: number
        total_completion_tokens: number
        total_cost: number
        request_count: number
      }>(`
        SELECT
          COALESCE(task, 'Uncategorized') AS task,
          COALESCE(SUM(total_tokens), 0)::bigint AS total_tokens,
          COALESCE(SUM(prompt_tokens), 0)::bigint AS total_prompt_tokens,
          COALESCE(SUM(completion_tokens), 0)::bigint AS total_completion_tokens,
          COALESCE(SUM(cost_estimate), 0)::float  AS total_cost,
          COUNT(*)::int                            AS request_count
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
        GROUP BY task
        ORDER BY total_tokens DESC
      `, [days]).catch(() => ({ rows: [] }))
    ])

    // Calculate previous period for comparison
    let prevPeriodResult = { rows: [{ prev_tokens: 0, prev_cost: 0, prev_requests: 0 }] }
    try {
      prevPeriodResult = await query<{ prev_tokens: number; prev_cost: number; prev_requests: number }>(`
        SELECT
          COALESCE(SUM(total_tokens), 0)::bigint AS prev_tokens,
          COALESCE(SUM(cost_estimate), 0)::float  AS prev_cost,
          COUNT(*)::int                            AS prev_requests
        FROM ai_usage_logs
        WHERE created_at >= NOW() - INTERVAL '1 day' * $1
          AND created_at < NOW() - INTERVAL '1 day' * $2
      `, [days * 2, days])
    } catch {
      // ignore
    }

    const current = summaryResult.rows[0]
    const prev = prevPeriodResult.rows[0]

    const pctChange = (cur: number, prv: number) => {
      if (prv === 0) return cur > 0 ? 100 : 0
      return Math.round(((cur - prv) / prv) * 100)
    }

    return res.json({
      period: days,
      summary: {
        totalTokens: Number(current.total_tokens),
        totalPromptTokens: Number(current.total_prompt_tokens),
        totalCompletionTokens: Number(current.total_completion_tokens),
        totalCost: Number(current.total_cost),
        totalRequests: Number(current.total_requests),
        tokenChange: pctChange(Number(current.total_tokens), Number(prev.prev_tokens)),
        costChange: pctChange(Number(current.total_cost), Number(prev.prev_cost)),
        requestChange: pctChange(Number(current.total_requests), Number(prev.prev_requests)),
      },
      today: todayResult.rows[0],
      daily: dailyResult.rows.map(r => ({
        date: r.date,
        tokens: Number(r.tokens),
        cost: Number(r.cost),
        requests: Number(r.requests),
      })),
      models: modelResult.rows.map(r => ({
        model: r.model,
        totalTokens: Number(r.total_tokens),
        totalCost: Number(r.total_cost),
        requestCount: Number(r.request_count),
      })),
      tasks: (taskResult?.rows || []).map(r => ({
        task: r.task,
        totalTokens: Number(r.total_tokens),
        totalPromptTokens: Number(r.total_prompt_tokens),
        totalCompletionTokens: Number(r.total_completion_tokens),
        totalCost: Number(r.total_cost),
        requestCount: Number(r.request_count),
      })),
      recentLogs: recentLogsResult.rows.map(r => ({
        id: r.id,
        model: r.model,
        promptTokens: Number(r.prompt_tokens),
        completionTokens: Number(r.completion_tokens),
        totalTokens: Number(r.total_tokens),
        costEstimate: Number(r.cost_estimate),
        createdAt: r.created_at,
        task: r.task,
        userEmail: r.user_email
      })),
      generatedAt: new Date().toISOString(),
    })
  } catch (err: any) {
    logger.error('Error fetching AI usage summary:', err)
    return res.status(500).json({ error: 'Failed to fetch AI usage data', details: err.message })
  }
}
