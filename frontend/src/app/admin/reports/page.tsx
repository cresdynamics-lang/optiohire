'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, AlertTriangle, RefreshCw, ShieldCheck, Loader2, Link2, ChevronDown, ChevronUp, CheckCircle, XCircle, Flag, FileText, ExternalLink } from 'lucide-react'
import React from 'react'

interface AuditRecord {
  application_id: string
  created_at: string
  candidate: {
    name: string | null
    email: string
    resume_url?: string | null
    links?: {
      linkedin?: string | null
      github?: string | null
      portfolio?: string | null
      other?: string[] | string | null
    }
  }
  job: {
    job_posting_id: string
    title: string | null
    company_id: string
    company_name: string | null
  }
  decision: {
    score: number | null
    status: string
    reasoning: string
    ai_status?: string | null
  }
  ai_audit_log?: any
  auditMeta?: {
    model_used?: string | null
    scored_at?: string | null
    weights_used?: any
    candidate_links?: any
    contribution_verification?: any
    admin_override?: any
  }
  fairnessFlags: {
    reasoning_mentions_sensitive_attribute: boolean
    borderline_decision: boolean
    missing_reasoning: boolean
  }
}

type OverrideDialogState = {
  applicationId: string
  status: 'SHORTLIST' | 'FLAG' | 'REJECT'
  candidateName: string
} | null

interface CompanyOption {
  company_id: string
  company_name: string
}

interface JobOption {
  job_posting_id: string
  job_title: string | null
  company_id: string
}

export default function AdminReportsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasHydratedFromUrl = useRef(false)
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [hasAdminSession, setHasAdminSession] = useState(false)
  const [records, setRecords] = useState<AuditRecord[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [riskFilter, setRiskFilter] = useState<'all' | 'risky'>('all')
  const [decisionFilter, setDecisionFilter] = useState<'all' | 'SHORTLIST' | 'FLAG' | 'REJECT' | 'PENDING'>('all')
  const [search, setSearch] = useState('')
  const [companyIdFilter, setCompanyIdFilter] = useState('')
  const [jobIdFilter, setJobIdFilter] = useState('')
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([])
  const [jobOptions, setJobOptions] = useState<JobOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(45)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>(null)
  const [overrideNote, setOverrideNote] = useState('')
  const [overrideSendEmail, setOverrideSendEmail] = useState(false)

  useEffect(() => {
    if (hasHydratedFromUrl.current) return

    const pageParam = Number(searchParams.get('page') || 1)
    const limitParam = Number(searchParams.get('limit') || 20)
    const riskParam = searchParams.get('risk')
    const decisionParam = searchParams.get('decision')
    const searchParam = searchParams.get('search') || ''
    const companyParam = searchParams.get('company_id') || ''
    const jobParam = searchParams.get('job_id') || ''
    const autoRefreshParam = searchParams.get('auto_refresh')
    const autoRefreshSecondsParam = Number(searchParams.get('auto_refresh_seconds') || 0)

    const storedAutoRefreshEnabled = localStorage.getItem('admin_ai_audit_auto_refresh_enabled')
    const storedAutoRefreshSeconds = Number(localStorage.getItem('admin_ai_audit_auto_refresh_seconds') || 0)

    if (Number.isFinite(pageParam) && pageParam > 0) setPage(pageParam)
    if ([20, 50, 100].includes(limitParam)) setLimit(limitParam)
    if (riskParam === 'risky' || riskParam === 'all') setRiskFilter(riskParam)
    if (decisionParam === 'SHORTLIST' || decisionParam === 'FLAG' || decisionParam === 'REJECT' || decisionParam === 'PENDING' || decisionParam === 'all') {
      setDecisionFilter(decisionParam)
    }
    setSearch(searchParam)
    setCompanyIdFilter(companyParam)
    setJobIdFilter(jobParam)
    if (autoRefreshParam === '1' || autoRefreshParam === '0') {
      setAutoRefreshEnabled(autoRefreshParam === '1')
    } else if (storedAutoRefreshEnabled === 'true' || storedAutoRefreshEnabled === 'false') {
      setAutoRefreshEnabled(storedAutoRefreshEnabled === 'true')
    }
    if ([30, 45, 60].includes(autoRefreshSecondsParam)) {
      setAutoRefreshSeconds(autoRefreshSecondsParam)
    } else if ([30, 45, 60].includes(storedAutoRefreshSeconds)) {
      setAutoRefreshSeconds(storedAutoRefreshSeconds)
    }

    hasHydratedFromUrl.current = true
  }, [searchParams])

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      setHasAdminSession(true)
      return
    }
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [authLoading, router, user])

  useEffect(() => {
    if (hasAdminSession || (user && user.role === 'admin')) {
      void loadAudit()
    }
  }, [hasAdminSession, user, page, limit, companyIdFilter, jobIdFilter, decisionFilter])

  useEffect(() => {
    if (hasAdminSession || (user && user.role === 'admin')) {
      void loadFilterOptions()
    }
  }, [hasAdminSession, user, companyIdFilter])

  useEffect(() => {
    if (!hasHydratedFromUrl.current) return

    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (limit !== 20) params.set('limit', String(limit))
    if (riskFilter !== 'all') params.set('risk', riskFilter)
    if (decisionFilter !== 'all') params.set('decision', decisionFilter)
    if (search.trim()) params.set('search', search.trim())
    if (companyIdFilter.trim()) params.set('company_id', companyIdFilter.trim())
    if (jobIdFilter.trim()) params.set('job_id', jobIdFilter.trim())
    if (autoRefreshEnabled) params.set('auto_refresh', '1')
    if (autoRefreshSeconds !== 45) params.set('auto_refresh_seconds', String(autoRefreshSeconds))

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [router, pathname, page, limit, riskFilter, decisionFilter, search, companyIdFilter, jobIdFilter, autoRefreshEnabled, autoRefreshSeconds])

  useEffect(() => {
    if (!hasHydratedFromUrl.current) return
    localStorage.setItem('admin_ai_audit_auto_refresh_enabled', String(autoRefreshEnabled))
    localStorage.setItem('admin_ai_audit_auto_refresh_seconds', String(autoRefreshSeconds))
  }, [autoRefreshEnabled, autoRefreshSeconds])

  useEffect(() => {
    if (!autoRefreshEnabled) return
    if (!(hasAdminSession || (user && user.role === 'admin'))) return

    const intervalId = window.setInterval(() => {
      void loadAudit({ silent: true })
    }, autoRefreshSeconds * 1000)

    return () => window.clearInterval(intervalId)
  }, [autoRefreshEnabled, autoRefreshSeconds, hasAdminSession, user, page, limit, companyIdFilter, jobIdFilter, decisionFilter])

  const loadFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const companyQuery = new URLSearchParams({ page: '1', limit: '200' })
      const jobQuery = new URLSearchParams({ page: '1', limit: '200' })
      if (companyIdFilter.trim()) {
        jobQuery.set('company_id', companyIdFilter.trim())
      }

      const [companiesRes, jobsRes] = await Promise.all([
        fetch(`/api/admin/companies?${companyQuery.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`/api/admin/job-postings?${jobQuery.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ])

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanyOptions(Array.isArray(companiesData?.companies) ? companiesData.companies : [])
      }
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobOptions(Array.isArray(jobsData?.jobs) ? jobsData.jobs : [])
      }
    } catch {
      // Non-blocking: audit table can still work without dropdown options.
    }
  }

  const loadAudit = async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true)
      }
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (companyIdFilter.trim()) {
        query.set('company_id', companyIdFilter.trim())
      }
      if (jobIdFilter.trim()) {
        query.set('job_id', jobIdFilter.trim())
      }
      if (decisionFilter !== 'all') {
        query.set('decision', decisionFilter)
      }

      const res = await fetch(`/api/admin/ai-audit?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch AI audit report')
      }

      setRecords(Array.isArray(data?.audits) ? data.audits : [])
      setTotal(Number(data?.total || 0))
      setLastRefreshedAt(new Date())
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch AI audit report')
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }

  const bulkRescoreDisabled = selectedRows.size === 0 || selectedRows.size > 10 || actionLoading === 'bulk-rescore'

  const handleBulkRescore = async () => {
    if (selectedRows.size === 0) return
    if (selectedRows.size > 10) return
    const ids = Array.from(selectedRows)
    setActionLoading('bulk-rescore')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/audit/bulk-rescore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_ids: ids }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed bulk rescore')
      toast({ title: 'Success', description: data.message })
      setSelectedRows(new Set())
      await loadAudit({ silent: true })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRescore = async (id: string) => {
    setActionLoading(`rescore-${id}`)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/audit/rescore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application_id: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed rescore')
      toast({ title: 'Success', description: data.message })
      await loadAudit({ silent: true })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleOverride = async (id: string, newStatus: string, adminNote: string, sendEmail: boolean) => {
    setActionLoading(`override-${id}`)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/admin/audit/override', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: id,
          new_status: newStatus,
          admin_note: adminNote,
          send_email: sendEmail
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed override')
      toast({ title: 'Success', description: data.message })
      setOverrideDialog(null)
      setOverrideNote('')
      setOverrideSendEmail(false)
      await loadAudit({ silent: true })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = useMemo(() => {
    return records.filter((row) => {
      const risky =
        row.fairnessFlags.borderline_decision ||
        row.fairnessFlags.reasoning_mentions_sensitive_attribute ||
        row.fairnessFlags.missing_reasoning
      if (riskFilter === 'risky' && !risky) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        (row.candidate.name || '').toLowerCase().includes(q) ||
        row.candidate.email.toLowerCase().includes(q) ||
        (row.job.title || '').toLowerCase().includes(q) ||
        (row.job.company_name || '').toLowerCase().includes(q)
      )
    })
  }, [records, riskFilter, search])

  const openOverrideDialog = (row: AuditRecord, status: 'SHORTLIST' | 'FLAG' | 'REJECT') => {
    setOverrideDialog({
      applicationId: row.application_id,
      status,
      candidateName: row.candidate.name || row.candidate.email,
    })
    setOverrideNote('')
    setOverrideSendEmail(false)
  }

  const submitOverride = async () => {
    if (!overrideDialog) return
    await handleOverride(
      overrideDialog.applicationId,
      overrideDialog.status,
      overrideNote,
      overrideSendEmail
    )
  }

  const getSkillBreakdown = (audit: any) => {
    const source = audit?.skill_match || audit?.skills || audit?.breakdown?.skill_match || audit?.breakdown?.skills || {}
    return {
      score: source.score ?? source.percentage ?? source.match_score ?? null,
      found: Array.isArray(source.found) ? source.found : Array.isArray(source.matched) ? source.matched : [],
      missing: Array.isArray(source.missing) ? source.missing : [],
      partial: Array.isArray(source.partial) ? source.partial : [],
    }
  }

  const getAuditScore = (audit: any, keys: string[]) => {
    for (const key of keys) {
      const value = key.split('.').reduce((acc, part) => acc?.[part], audit)
      if (typeof value === 'number' || typeof value === 'string') return value
    }
    return null
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!hasAdminSession && (!user || user.role !== 'admin')) {
    return null
  }

  const pageCount = Math.max(1, Math.ceil(total / limit))

  const copyCurrentViewLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Link copied',
        description: 'Share this URL to open the same audit view.',
      })
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not access clipboard. Copy URL from your address bar.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => router.push('/admin/analytics')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <CardTitle className="text-white">AI Fairness Audit Report</CardTitle>
                  <CardDescription>
                    Review candidate scoring decisions and investigate potentially risky outcomes.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lastRefreshedAt && (
                  <span className="text-xs text-neutral-400">
                    Last refreshed {lastRefreshedAt.toLocaleTimeString()}
                  </span>
                )}
                {autoRefreshEnabled && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                      autoRefreshSeconds === 30
                        ? 'border border-amber-700 bg-amber-900/20 text-amber-300'
                        : autoRefreshSeconds === 45
                          ? 'border border-emerald-700 bg-emerald-900/20 text-emerald-300'
                          : 'border border-sky-700 bg-sky-900/20 text-sky-300'
                    }`}
                  >
                    Auto-refreshing every {autoRefreshSeconds}s
                  </span>
                )}
                <label className="inline-flex items-center gap-2 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-white"
                  />
                  Auto-refresh
                </label>
                <select
                  value={autoRefreshSeconds}
                  onChange={(e) => setAutoRefreshSeconds(Number(e.target.value))}
                  disabled={!autoRefreshEnabled}
                  className="px-2 py-1 rounded-lg border border-border bg-white text-xs text-foreground disabled:opacity-50"
                >
                  <option value={30}>30s</option>
                  <option value={45}>45s</option>
                  <option value={60}>60s</option>
                </select>
                <Button variant="outline" onClick={copyCurrentViewLink} className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Copy link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void loadAudit()
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, email, job, company"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              />
              <select
                value={companyIdFilter}
                onChange={(e) => {
                  setPage(1)
                  setCompanyIdFilter(e.target.value)
                  setJobIdFilter('')
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                <option value="">All companies</option>
                {companyOptions.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
              <select
                value={jobIdFilter}
                onChange={(e) => {
                  setPage(1)
                  setJobIdFilter(e.target.value)
                }}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                <option value="">All jobs</option>
                {jobOptions.map((job) => (
                  <option key={job.job_posting_id} value={job.job_posting_id}>
                    {(job.job_title || 'Untitled Job').slice(0, 50)}
                  </option>
                ))}
              </select>
              <input
                value={jobIdFilter}
                onChange={(e) => {
                  setPage(1)
                  setJobIdFilter(e.target.value)
                }}
                placeholder="Or paste exact job_id"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as 'all' | 'risky')}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All records</option>
                <option value="risky">Risky only</option>
              </select>
              <select
                value={decisionFilter}
                onChange={(e) => {
                  setPage(1)
                  setDecisionFilter(e.target.value as typeof decisionFilter)
                }}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                <option value="all">All decisions</option>
                <option value="SHORTLIST">SHORTLIST</option>
                <option value="FLAG">FLAG</option>
                <option value="REJECT">REJECT</option>
                <option value="PENDING">PENDING</option>
              </select>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1)
                  setLimit(Number(e.target.value))
                }}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            {(companyIdFilter || jobIdFilter) && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPage(1)
                    setCompanyIdFilter('')
                    setJobIdFilter('')
                  }}
                >
                  Clear Server Filters
                </Button>
              </div>
            )}
            
            <div className="flex flex-col gap-3 py-3 border-b border-border md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-medium">
                {selectedRows.size} application(s) selected
                {selectedRows.size > 10 && (
                  <span className="ml-2 text-xs text-red-600">Select at most 10 for bulk rescore.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={selectedRows.size === 0 || actionLoading !== null}
                  onClick={() => setSelectedRows(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="default"
                  disabled={bulkRescoreDisabled}
                  onClick={handleBulkRescore}
                  className="gap-2"
                  title={selectedRows.size > 10 ? 'Select at most 10 for bulk rescore' : undefined}
                >
                  {actionLoading === 'bulk-rescore' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Bulk Rescore
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr className="text-left text-neutral-400">
                    <th className="px-3 py-2 w-8">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRows(new Set(filtered.map(r => r.application_id)))
                          } else {
                            setSelectedRows(new Set())
                          }
                        }}
                        checked={selectedRows.size > 0 && selectedRows.size === filtered.length}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </th>
                    <th className="px-3 py-2 w-8"></th>
                    <th className="px-3 py-2">Candidate</th>
                    <th className="px-3 py-2">Job / Company</th>
                    <th className="px-3 py-2">Decision</th>
                    <th className="px-3 py-2">AI Reasoning</th>
                    <th className="px-3 py-2">Scoring Breakdown</th>
                    <th className="px-3 py-2">Risk Flags</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const isRisky =
                      row.fairnessFlags.borderline_decision ||
                      row.fairnessFlags.reasoning_mentions_sensitive_attribute ||
                      row.fairnessFlags.missing_reasoning
                    const skillBreakdown = getSkillBreakdown(row.ai_audit_log)
                    const experienceScore = getAuditScore(row.ai_audit_log, ['experience.score', 'breakdown.experience.score'])
                    const educationScore = getAuditScore(row.ai_audit_log, ['education.score', 'breakdown.education.score'])
                    const vectorScore = getAuditScore(row.ai_audit_log, ['vector_similarity.score', 'vector.score', 'breakdown.vector_similarity.score'])
                    return (
                      <React.Fragment key={row.application_id}>
                        <tr className="border-t border-border align-top hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.has(row.application_id)}
                              onChange={(e) => {
                                const next = new Set(selectedRows)
                                if (e.target.checked) next.add(row.application_id)
                                else next.delete(row.application_id)
                                setSelectedRows(next)
                              }}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mt-1"
                            />
                          </td>
                          <td className="px-3 py-2 cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.application_id ? null : row.application_id)}>
                            {expandedRow === row.application_id ? <ChevronUp className="w-4 h-4 mt-1 text-slate-500" /> : <ChevronDown className="w-4 h-4 mt-1 text-slate-500" />}
                          </td>
                          <td className="px-3 py-2 cursor-pointer" onClick={() => setExpandedRow(expandedRow === row.application_id ? null : row.application_id)}>
                            <div className="font-medium text-slate-800">{row.candidate.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{row.candidate.email}</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-800">{row.job.title || 'Untitled Job'}</div>
                            <div className="text-xs text-slate-500">{row.job.company_name || 'Unknown company'}</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium text-slate-800">
                              {row.decision.score ?? 'N/A'} / 100
                            </div>
                            <div className="text-xs text-slate-500 font-semibold">{row.decision.status}</div>
                          </td>
                          <td className="px-3 py-2 max-w-[260px]">
                            <div className="line-clamp-3 text-xs text-slate-600" title={row.decision.reasoning}>
                              {row.decision.reasoning || 'No reasoning provided.'}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            <div>Skills: {skillBreakdown.score ?? 'N/A'}</div>
                            <div>Experience: {experienceScore ?? 'N/A'}</div>
                            <div>Education: {educationScore ?? 'N/A'}</div>
                            <div>Vector: {vectorScore ?? 'N/A'}</div>
                          </td>
                          <td className="px-3 py-2">
                            {isRisky ? (
                              <div className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                                <AlertTriangle className="w-3 h-3" />
                                Review needed
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
                                <ShieldCheck className="w-3 h-3" />
                                Clean
                              </div>
                            )}
                            <div className="mt-1 text-xs text-slate-500 max-w-[150px] truncate" title={
                              [
                                row.fairnessFlags.borderline_decision ? 'borderline' : '',
                                row.fairnessFlags.reasoning_mentions_sensitive_attribute ? 'sensitive info' : '',
                                row.fairnessFlags.missing_reasoning ? 'missing reasoning' : ''
                              ].filter(Boolean).join(', ')
                            }>
                              {[
                                row.fairnessFlags.borderline_decision ? 'borderline' : '',
                                row.fairnessFlags.reasoning_mentions_sensitive_attribute ? 'sensitive info' : '',
                                row.fairnessFlags.missing_reasoning ? 'missing reasoning' : ''
                              ].filter(Boolean).join(', ')}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-500">
                            {new Date(row.created_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex min-w-[150px] flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start"
                                onClick={() => setExpandedRow(expandedRow === row.application_id ? null : row.application_id)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start text-blue-700"
                                onClick={() => handleRescore(row.application_id)}
                                disabled={actionLoading !== null}
                              >
                                {actionLoading === `rescore-${row.application_id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Rescore
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === row.application_id && (
                          <tr className="bg-slate-50/80 border-b border-border">
                            <td colSpan={10} className="p-4">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* AI Reasoning Panel */}
                                <div className="space-y-4 lg:col-span-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4 text-slate-600" /> AI Reasoning
                                    </h4>
                                    <div className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">
                                      Score: {row.decision.score ?? 'N/A'}
                                    </div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-sm text-slate-700 whitespace-pre-wrap">
                                    {row.decision.reasoning || 'No reasoning provided.'}
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                                      <div className="font-semibold text-slate-700">Skill Match</div>
                                      <div className="mt-1 text-lg font-bold text-slate-900">{skillBreakdown.score ?? 'N/A'}</div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                                      <div className="font-semibold text-slate-700">Experience</div>
                                      <div className="mt-1 text-lg font-bold text-slate-900">{experienceScore ?? 'N/A'}</div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                                      <div className="font-semibold text-slate-700">Education</div>
                                      <div className="mt-1 text-lg font-bold text-slate-900">{educationScore ?? 'N/A'}</div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
                                      <div className="font-semibold text-slate-700">Vector</div>
                                      <div className="mt-1 text-lg font-bold text-slate-900">{vectorScore ?? 'N/A'}</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div className="bg-green-50 p-3 rounded border border-green-100 text-xs">
                                      <div className="font-semibold text-green-800 mb-1">Found Skills</div>
                                      {skillBreakdown.found.length ? (
                                        <ul className="list-disc list-inside text-green-700">
                                          {skillBreakdown.found.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                      ) : <p className="text-green-700">None recorded.</p>}
                                    </div>
                                    <div className="bg-red-50 p-3 rounded border border-red-100 text-xs">
                                      <div className="font-semibold text-red-800 mb-1">Missing Skills</div>
                                      {skillBreakdown.missing.length ? (
                                        <ul className="list-disc list-inside text-red-700">
                                          {skillBreakdown.missing.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                      ) : <p className="text-red-700">None recorded.</p>}
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded border border-amber-100 text-xs">
                                      <div className="font-semibold text-amber-800 mb-1">Partial Skills</div>
                                      {skillBreakdown.partial.length ? (
                                        <ul className="list-disc list-inside text-amber-700">
                                          {skillBreakdown.partial.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                        </ul>
                                      ) : <p className="text-amber-700">None recorded.</p>}
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
                                    <div className="mb-2 font-semibold uppercase tracking-wider text-slate-500">Model & Audit Metadata</div>
                                    <div>Model: {row.auditMeta?.model_used || 'Not recorded'}</div>
                                    <div>Scored at: {row.auditMeta?.scored_at ? new Date(row.auditMeta.scored_at).toLocaleString() : 'Not recorded'}</div>
                                    <div>Weights: {row.auditMeta?.weights_used ? JSON.stringify(row.auditMeta.weights_used) : 'Not recorded'}</div>
                                    {row.auditMeta?.contribution_verification && (
                                      <pre className="mt-3 max-h-36 overflow-auto rounded bg-slate-100 p-3 text-[11px]">
                                        {JSON.stringify(row.auditMeta.contribution_verification, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Admin Actions Panel */}
                                <div className="space-y-4 border-l border-slate-200 pl-6">
                                  <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-slate-600" /> Admin Actions
                                  </h4>
                                  <p className="text-xs text-slate-500">Take manual action on this application if you suspect an AI bias or error.</p>
                                  <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                                    {row.candidate.resume_url ? (
                                      <a href={row.candidate.resume_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-700 hover:underline">
                                        <ExternalLink className="h-3.5 w-3.5" /> Open resume
                                      </a>
                                    ) : <div>No resume URL recorded.</div>}
                                    {row.candidate.links?.linkedin && <a href={row.candidate.links.linkedin} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline">LinkedIn</a>}
                                    {row.candidate.links?.github && <a href={row.candidate.links.github} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline">GitHub</a>}
                                    {row.candidate.links?.portfolio && <a href={row.candidate.links.portfolio} target="_blank" rel="noreferrer" className="block text-blue-700 hover:underline">Portfolio</a>}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() => handleRescore(row.application_id)}
                                      disabled={actionLoading !== null}
                                    >
                                      {actionLoading === `rescore-${row.application_id}` ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                      Re-run AI Scoring
                                    </Button>
                                    
                                    <div className="pt-4 pb-2 border-t border-slate-200 mt-4">
                                      <div className="text-xs font-semibold text-slate-700 mb-2">Override Decision</div>
                                      <div className="grid grid-cols-1 gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="justify-start text-green-700 border-green-200 hover:bg-green-50"
                                          onClick={() => openOverrideDialog(row, 'SHORTLIST')}
                                          disabled={actionLoading !== null || row.decision.status === 'SHORTLIST'}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" /> Shortlist
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="justify-start text-amber-700 border-amber-200 hover:bg-amber-50"
                                          onClick={() => openOverrideDialog(row, 'FLAG')}
                                          disabled={actionLoading !== null || row.decision.status === 'FLAG'}
                                        >
                                          <Flag className="w-4 h-4 mr-1" /> Flag
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="justify-start text-red-700 border-red-200 hover:bg-red-50"
                                          onClick={() => openOverrideDialog(row, 'REJECT')}
                                          disabled={actionLoading !== null || row.decision.status === 'REJECT'}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" /> Reject
                                        </Button>
                                      </div>
                                    </div>
                                    {row.auditMeta?.admin_override && (
                                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                                        <div className="mb-1 font-semibold text-slate-700">Admin override history</div>
                                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap">{JSON.stringify(row.auditMeta.admin_override, null, 2)}</pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-8 text-center text-neutral-400">
                        No audit records match current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">
                Showing {filtered.length} records (page {page} of {pageCount}, total {total})
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={!!overrideDialog} onOpenChange={(open) => {
        if (!open) {
          setOverrideDialog(null)
          setOverrideNote('')
          setOverrideSendEmail(false)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override AI Decision</DialogTitle>
            <DialogDescription>
              Change this application to {overrideDialog?.status}. Candidate emails are off by default.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-slate-50 p-3 text-sm text-slate-700">
              <div><span className="font-medium">Candidate:</span> {overrideDialog?.candidateName}</div>
              <div><span className="font-medium">New status:</span> {overrideDialog?.status}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Admin note</label>
              <Textarea
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Explain why this decision is being overridden."
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={overrideSendEmail}
                onChange={(e) => setOverrideSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Send reconsideration email to candidate
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOverrideDialog(null)
                setOverrideNote('')
                setOverrideSendEmail(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitOverride}
              disabled={!overrideDialog || actionLoading?.startsWith('override-')}
            >
              {actionLoading?.startsWith('override-') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
