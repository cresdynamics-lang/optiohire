'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Cpu, Activity, Zap, Shield, Loader2, Database, AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AiUsageCharts } from '@/components/admin/ai-usage-charts'

interface AiUsageData {
  period: number
  summary: {
    totalTokens: number
    totalPromptTokens: number
    totalCompletionTokens: number
    totalCost: number
    totalRequests: number
    tokenChange: number
    costChange: number
    requestChange: number
  }
  today: {
    tokens_today: number
    cost_today: number
    requests_today: number
  }
  daily: { date: string; tokens: number; cost: number; requests: number }[]
  models: { model: string; totalTokens: number; totalCost: number; requestCount: number }[]
  tasks: { task: string; totalTokens: number; totalPromptTokens: number; totalCompletionTokens: number; totalCost: number; requestCount: number }[]
  recentLogs: {
    id: string
    model: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
    costEstimate: number
    createdAt: string
    task?: string
    userEmail?: string
    provider?: string
    speed?: number
    finishReason?: string
    sessionId?: string
    appName?: string
  }[]
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">— No change</span>
  const isUp = value > 0
  return (
    <span className={`text-xs flex items-center gap-0.5 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? '+' : ''}{value}% vs prior period
    </span>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function AiUsagePage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AiUsageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/ai-usage?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch AI usage data')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const summary = data?.summary
  const today = data?.today
  const logs = data?.recentLogs || []

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="h-8 w-8 text-indigo-500" />
              <h1 className="text-3xl font-bold text-foreground">AI Analytics & Usage</h1>
            </div>
            <p className="text-muted-foreground">
              Real-time token consumption, estimated costs, and API request logs across all AI models.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[7, 30, 90].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    period === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}d
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </motion.div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">{period}d</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Tokens</p>
              <h3 className="text-3xl font-bold text-foreground">{formatTokens(summary?.totalTokens || 0)}</h3>
              <div className="mt-2"><ChangeIndicator value={summary?.tokenChange || 0} /></div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-amber-500" />
                </div>
                <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10">Estimated</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Cost</p>
              <h3 className="text-3xl font-bold text-foreground">${(summary?.totalCost || 0).toFixed(2)}</h3>
              <div className="mt-2"><ChangeIndicator value={summary?.costChange || 0} /></div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-indigo-500" />
                </div>
                <Badge variant="outline" className="text-indigo-500 border-indigo-500/20 bg-indigo-500/10">Today</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Requests Today</p>
              <h3 className="text-3xl font-bold text-foreground">{today?.requests_today || 0}</h3>
              <p className="text-xs text-muted-foreground mt-2">{formatTokens(today?.tokens_today || 0)} tokens today</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Total</Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Requests</p>
              <h3 className="text-3xl font-bold text-foreground">{(summary?.totalRequests || 0).toLocaleString()}</h3>
              <div className="mt-2"><ChangeIndicator value={summary?.requestChange || 0} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <AiUsageCharts 
          daily={data?.daily || []}
          models={data?.models || []}
          tasks={data?.tasks || []}
          loading={loading}
        />

        {/* Real-time Logs */}
        <Card className="border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent AI Requests</CardTitle>
                <CardDescription>Live logs from AI API endpoints</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                {logs.length} entries
              </Badge>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Task / App</th>
                  <th className="px-6 py-4 font-medium">Provider / Model</th>
                  <th className="px-6 py-4 font-medium">Speed</th>
                  <th className="px-6 py-4 font-medium">Tokens (In / Out)</th>
                  <th className="px-6 py-4 font-medium">Est. Cost</th>
                  <th className="px-6 py-4 font-medium">Session ID</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No AI usage logs recorded yet. Logs will appear here once AI scoring begins processing applications.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{log.task || 'Uncategorized'}</div>
                        <div className="text-xs text-muted-foreground">{log.appName || 'OptioHire Core'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground mb-1">{log.provider || 'Unknown'}</div>
                        <Badge variant="secondary" className="font-mono text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
                          {log.model.split('/').pop()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground tabular-nums">
                        {log.speed ? `${log.speed.toFixed(1)} t/s` : '—'}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground tabular-nums">
                        <span className="text-muted-foreground text-xs">{log.promptTokens.toLocaleString()} / {log.completionTokens.toLocaleString()}</span>
                        <br />
                        <span className="font-bold">{log.totalTokens.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground tabular-nums">${log.costEstimate.toFixed(4)}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">{log.sessionId || '—'}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] mt-1" title={log.userEmail}>{log.userEmail || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-muted-foreground text-sm">{timeAgo(log.createdAt)}</div>
                        {log.finishReason && (
                          <div className="text-[10px] text-muted-foreground uppercase mt-1">{log.finishReason}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
