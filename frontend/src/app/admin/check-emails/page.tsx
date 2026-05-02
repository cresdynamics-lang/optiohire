'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface EmailCheckStats {
  applications: {
    total: number
    shortlisted: number
    rejected: number
    flagged: number
    pending: number
  }
  jobs: {
    total: number
    active: number
  }
  emails: {
    total: number
    sent: number
    failed: number
    pending: number
  }
  missingEmails: number
}

interface CheckResults {
  totalApplications: number
  checked: number
  alreadySent: number
  sent: number
  failed: number
  errors: Array<{
    applicationId: string
    email: string
    error: string
  }>
}

export default function CheckEmailsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<EmailCheckStats | null>(null)
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
    loadStats()
  }, [user, authLoading, router])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/email-check/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load email check stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('Error loading stats:', err)
      setError(err.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAndSend = async () => {
    try {
      setSending(true)
      setError(null)
      setResults(null)
      
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/email-check/send-missing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check and send emails')
      }

      const data = await response.json()
      setResults(data.results)
      
      // Reload stats after sending
      await loadStats()
    } catch (err: any) {
      console.error('Error checking and sending emails:', err)
      setError(err.message || 'Failed to check and send emails')
    } finally {
      setSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Check & Send Missing Emails
            </h1>
            <p className="text-neutral-400">
              Check all applications and jobs, then send missing feedback emails
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadStats}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Stats
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-700/50 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.applications.total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.applications.shortlisted} shortlisted, {stats.applications.rejected} rejected
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.jobs.total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.jobs.active} active
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Emails Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stats.emails.sent}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.emails.failed} failed, {stats.emails.pending} pending
                </div>
              </CardContent>
            </Card>

            <Card className={`border-slate-200 bg-white ${stats.missingEmails > 0 ? 'border-orange-700/50 bg-orange-900/20' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Missing Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.missingEmails > 0 ? 'text-orange-400' : 'text-white'}`}>
                  {stats.missingEmails}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Applications without feedback emails
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Button */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Check & Send Missing Emails</CardTitle>
            <CardDescription>
              This will check all applications with SHORTLIST or REJECT status and send feedback emails to candidates who haven't received them yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCheckAndSend}
              disabled={sending || !stats}
              className="w-full md:w-auto flex items-center gap-2"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking and Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Check & Send Missing Emails
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Operation Results</CardTitle>
              <CardDescription>
                Summary of the email check and send operation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800/40">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.totalApplications}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Total Applications
                  </div>
                </div>
                <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800/40">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.alreadySent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Already Sent
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-800/40">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {results.sent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Sent Now
                  </div>
                </div>
                <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-800/40">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {results.failed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Failed
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    Errors ({results.errors.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg"
                      >
                        <div className="text-sm font-medium text-red-300">
                          {err.email}
                        </div>
                        <div className="text-xs text-red-400 mt-1">
                          {err.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.sent > 0 && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">
                      Successfully sent {results.sent} email(s)!
                    </span>
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
