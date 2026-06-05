'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface EmailCheckStats {
  applications: { total: number, shortlisted: number, rejected: number, flagged: number, pending: number }
  jobs: { total: number, active: number }
  emails: { total: number, sent: number, failed: number, pending: number }
  missingEmails: number
}

interface MissingEmail {
  applicationId: string
  candidateName: string
  candidateEmail: string
  companyName: string
  companyEmail: string
  jobTitle: string
  emailType: string
  status: string
  createdAt: string
}

interface CheckResults {
  totalApplications: number
  checked: number
  alreadySent: number
  sent: number
  failed: number
  errors: Array<{ applicationId: string; email: string; error: string }>
}

export default function CheckEmailsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<EmailCheckStats | null>(null)
  const [missingList, setMissingList] = useState<MissingEmail[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [results, setResults] = useState<CheckResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') {
      router.push('/admin/login')
      return
    }
    loadData()
  }, [user, authLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const [statsRes, listRes] = await Promise.all([
        fetch('/api/admin/email-check/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/email-check/missing', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (!statsRes.ok) throw new Error('Failed to load email check stats')
      if (!listRes.ok) throw new Error('Failed to load missing emails list')

      const statsData = await statsRes.json()
      const listData = await listRes.json()
      
      setStats(statsData)
      setMissingList(listData.missingEmails || [])
      setSelectedIds(new Set()) // Reset selection
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (applicationIds?: string[]) => {
    try {
      setSending(true)
      setError(null)
      setResults(null)
      
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const body: any = {}
      if (applicationIds && applicationIds.length > 0) {
        body.applicationIds = applicationIds
      } else if (applicationIds && applicationIds.length === 0) {
        return // Nothing to send
      }

      const response = await fetch('/api/admin/email-check/send-missing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send emails')
      }

      const data = await response.json()
      setResults(data.results)
      
      await loadData()
    } catch (err: any) {
      console.error('Error sending emails:', err)
      setError(err.message || 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === missingList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(missingList.map(m => m.applicationId)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Check & Send Missing Emails</h1>
            <p className="text-muted-foreground">Review missing feedback emails and send them manually.</p>
          </div>
          <Button onClick={loadData} variant="outline" className="flex items-center gap-2 text-slate-700 bg-white border-border">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Emails Table */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-xl">Missing Emails ({missingList.length})</CardTitle>
              <CardDescription>Select the emails you want to send.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={sending || selectedIds.size === 0}
                onClick={() => handleSend(Array.from(selectedIds))}
                className="text-slate-700 border-border bg-white"
              >
                Send Selected ({selectedIds.size})
              </Button>
              <Button
                disabled={sending || missingList.length === 0}
                onClick={() => handleSend()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send All Missing
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {missingList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="text-xs text-muted-foreground uppercase bg-background border-b border-slate-100">
                    <tr>
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border"
                          checked={selectedIds.size === missingList.length && missingList.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Job Title</th>
                      <th className="py-3 px-4 font-semibold">Company (Sender)</th>
                      <th className="py-3 px-4 font-semibold">Email Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingList.map((m) => (
                      <tr key={m.applicationId} className="border-b border-slate-50 hover:bg-background/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-border"
                            checked={selectedIds.has(m.applicationId)}
                            onChange={() => toggleSelectRow(m.applicationId)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{m.candidateName}</div>
                          <div className="text-muted-foreground text-xs">{m.candidateEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{m.jobTitle}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">{m.companyName}</div>
                          <div className="text-muted-foreground text-xs">{m.companyEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            m.emailType === 'shortlist' ? 'bg-green-100 text-green-700' :
                            m.emailType === 'rejection' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {m.emailType.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No missing emails found.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle>Operation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{results.totalApplications}</div>
                  <div className="text-sm text-slate-600 mt-1">Processed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">{results.alreadySent}</div>
                  <div className="text-sm text-slate-600 mt-1">Already Sent</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">{results.sent}</div>
                  <div className="text-sm text-slate-600 mt-1">Sent Now</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-slate-600 mt-1">Failed</div>
                </div>
              </div>
              {results.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-slate-800">Errors ({results.errors.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.errors.map((err, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="text-sm font-medium text-red-700">{err.email}</div>
                        <div className="text-xs text-red-500 mt-1">{err.error}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.sent > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Successfully sent {results.sent} email(s)!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
