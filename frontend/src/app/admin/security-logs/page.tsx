'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SecurityLog {
  id: string
  scan_date: string
  candidate_email: string | null
  job_id: string | null
  severity: 'NONE' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  action_taken: 'PROCESSED' | 'FLAGGED' | 'AUTO_REJECTED'
  detected_patterns: string[]
  ai_score_original: number | null
  rule_score: number | null
  divergence_flag: boolean
}

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: 'bg-red-600 text-white', icon: AlertCircle },
  HIGH:     { label: 'High',     color: 'bg-orange-500 text-white', icon: AlertTriangle },
  MEDIUM:   { label: 'Medium',   color: 'bg-yellow-500 text-white', icon: AlertTriangle },
  NONE:     { label: 'Clean',    color: 'bg-green-600 text-white', icon: ShieldCheck },
}

const ACTION_CONFIG = {
  AUTO_REJECTED: { label: 'Auto-Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  FLAGGED:       { label: 'Flagged',       color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  PROCESSED:     { label: 'Processed',     color: 'bg-green-100 text-green-800 border-green-200' },
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      const res = await fetch('/api/admin/security-logs?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setWarning(data.warning || null)
    } catch {
      setWarning('Failed to load security logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const criticalCount = logs.filter(l => l.severity === 'CRITICAL').length
  const highCount = logs.filter(l => l.severity === 'HIGH').length
  const flaggedCount = logs.filter(l => l.action_taken === 'FLAGGED').length

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Security Audit Logs</h1>
                <p className="text-sm text-slate-500">Prompt injection detections and CV scan results</p>
              </div>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Critical</p>
                <p className="text-3xl font-bold text-red-700">{criticalCount}</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-orange-500 font-medium uppercase tracking-wide">High</p>
                <p className="text-3xl font-bold text-orange-700">{highCount}</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Flagged</p>
                <p className="text-3xl font-bold text-yellow-700">{flaggedCount}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Warning */}
        {warning && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <p className="text-yellow-800 text-sm">⚠️ {warning}</p>
            </CardContent>
          </Card>
        )}

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Results ({total} total)</CardTitle>
            <CardDescription>Every CV parsed through the AI pipeline is logged here</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">No scan logs found — all clear!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => {
                  const sevConf = SEVERITY_CONFIG[log.severity]
                  const actConf = ACTION_CONFIG[log.action_taken]
                  const SevIcon = sevConf.icon
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className={`rounded-full p-2 ${sevConf.color}`}>
                        <SevIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className={sevConf.color}>{sevConf.label}</Badge>
                          <Badge variant="outline" className={actConf.color}>{actConf.label}</Badge>
                          {log.divergence_flag && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Score Divergence
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium truncate">
                          {log.candidate_email || 'Unknown candidate'}
                        </p>
                        {log.detected_patterns.length > 0 && (
                          <p className="text-xs text-red-600 mt-1 font-mono truncate">
                            Patterns: {log.detected_patterns.join(' | ')}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span>{new Date(log.scan_date).toLocaleString()}</span>
                          {log.ai_score_original != null && <span>AI Score: {log.ai_score_original}</span>}
                          {log.rule_score != null && <span>Rule Score: {log.rule_score}</span>}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
