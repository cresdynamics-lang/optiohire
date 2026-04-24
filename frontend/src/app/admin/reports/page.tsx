'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, RefreshCw, ShieldCheck, Loader2, Link2 } from 'lucide-react'

interface AuditRecord {
  application_id: string
  created_at: string
  candidate: {
    name: string | null
    email: string
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
  }
  fairnessFlags: {
    reasoning_mentions_sensitive_attribute: boolean
    borderline_decision: boolean
    missing_reasoning: boolean
  }
}

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

  useEffect(() => {
    if (hasHydratedFromUrl.current) return

    const pageParam = Number(searchParams.get('page') || 1)
    const limitParam = Number(searchParams.get('limit') || 20)
    const riskParam = searchParams.get('risk')
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
  }, [hasAdminSession, user, page, limit, companyIdFilter, jobIdFilter])

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
    if (search.trim()) params.set('search', search.trim())
    if (companyIdFilter.trim()) params.set('company_id', companyIdFilter.trim())
    if (jobIdFilter.trim()) params.set('job_id', jobIdFilter.trim())
    if (autoRefreshEnabled) params.set('auto_refresh', '1')
    if (autoRefreshSeconds !== 45) params.set('auto_refresh_seconds', String(autoRefreshSeconds))

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [router, pathname, page, limit, riskFilter, search, companyIdFilter, jobIdFilter, autoRefreshEnabled, autoRefreshSeconds])

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
  }, [autoRefreshEnabled, autoRefreshSeconds, hasAdminSession, user, page, limit, companyIdFilter, jobIdFilter])

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
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
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
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
                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900"
                  />
                  Auto-refresh
                </label>
                <select
                  value={autoRefreshSeconds}
                  onChange={(e) => setAutoRefreshSeconds(Number(e.target.value))}
                  disabled={!autoRefreshEnabled}
                  className="px-2 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-xs disabled:opacity-50"
                >
                  <option value={30}>30s</option>
                  <option value={45}>45s</option>
                  <option value={60}>60s</option>
                </select>
                <Button variant="outline" onClick={copyCurrentViewLink} className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Copy link
                </Button>
                <Button variant="outline" onClick={loadAudit} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, email, job, company"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
              />
              <select
                value={companyIdFilter}
                onChange={(e) => {
                  setPage(1)
                  setCompanyIdFilter(e.target.value)
                  setJobIdFilter('')
                }}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
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
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
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
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
              />
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as 'all' | 'risky')}
                className="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
              >
                <option value="all">All records</option>
                <option value="risky">Risky only</option>
              </select>
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1)
                  setLimit(Number(e.target.value))
                }}
                className="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm"
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

            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-900/80">
                  <tr className="text-left text-neutral-400">
                    <th className="px-3 py-2">Candidate</th>
                    <th className="px-3 py-2">Job / Company</th>
                    <th className="px-3 py-2">Decision</th>
                    <th className="px-3 py-2">Risk Flags</th>
                    <th className="px-3 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const isRisky =
                      row.fairnessFlags.borderline_decision ||
                      row.fairnessFlags.reasoning_mentions_sensitive_attribute ||
                      row.fairnessFlags.missing_reasoning
                    return (
                      <tr key={row.application_id} className="border-t border-neutral-800 align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium text-neutral-100">{row.candidate.name || 'Unknown'}</div>
                          <div className="text-xs text-neutral-400">{row.candidate.email}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-neutral-200">{row.job.title || 'Untitled Job'}</div>
                          <div className="text-xs text-neutral-400">{row.job.company_name || 'Unknown company'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="font-medium text-neutral-100">
                            {row.decision.score ?? 'N/A'} / 100
                          </div>
                          <div className="text-xs text-neutral-400">{row.decision.status}</div>
                        </td>
                        <td className="px-3 py-2">
                          {isRisky ? (
                            <div className="inline-flex items-center gap-1 rounded-full border border-amber-700 bg-amber-900/20 px-2 py-1 text-xs text-amber-300">
                              <AlertTriangle className="w-3 h-3" />
                              Review needed
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 rounded-full border border-green-700 bg-green-900/20 px-2 py-1 text-xs text-green-300">
                              <ShieldCheck className="w-3 h-3" />
                              Clean
                            </div>
                          )}
                          <div className="mt-1 text-xs text-neutral-400">
                            {row.fairnessFlags.borderline_decision && 'borderline; '}
                            {row.fairnessFlags.reasoning_mentions_sensitive_attribute && 'sensitive-attribute mention; '}
                            {row.fairnessFlags.missing_reasoning && 'missing reasoning'}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-neutral-400">
                          {new Date(row.created_at).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-neutral-400">
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
    </div>
  )
}
