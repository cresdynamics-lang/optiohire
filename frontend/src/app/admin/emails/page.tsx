'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2, 
  RefreshCw,
  Send,
  AlertTriangle,
  Filter,
  Search,
  ArrowLeft,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface EmailLog {
  email_id: string
  recipient_email: string
  recipient_name?: string
  subject: string
  email_type: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  provider: 'resend' | 'sendgrid' | 'smtp'
  provider_message_id?: string
  error_message?: string
  sent_at?: string
  delivered_at?: string
  created_at: string
  metadata?: {
    retry_count?: number
    is_retry_eligible?: boolean
    next_retry_at?: string | null
    manually_requeued_at?: string
    html?: string
    text?: string
    from?: string
    context?: Record<string, any>
    [key: string]: any
  }
}

interface EmailStats {
  total: string
  sent: string
  delivered: string
  failed: string
  bounced: string
  pending: string
}

export default function EmailManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deadLetters, setDeadLetters] = useState<EmailLog[]>([])
  const [deadLettersLoading, setDeadLettersLoading] = useState(false)
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null)

  useEffect(() => {
    // Check for admin session first
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      return // Admin session exists, allow access
    }
    
    // Fallback to regular auth check
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession || (user && user.role === 'admin')) {
      loadEmails()
      loadStats()
      loadDeadLetters()
    }
  }, [user, page, statusFilter, typeFilter])

  const loadEmails = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('emailType', typeFilter)
      if (searchTerm) params.append('recipient', searchTerm)

      const response = await fetch(`/api/admin/emails?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to load emails')
      }

      const data = await response.json()
      setEmails(data.emails || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      console.error('Error loading emails:', err)
      setError(err.message || 'Failed to load emails')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/emails/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return

      const data = await response.json()
      setStats(data.stats || data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadDeadLetters = async () => {
    try {
      setDeadLettersLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/admin/emails/dead-letter?page=1&limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) return
      const data = await response.json()
      setDeadLetters(data.emails || [])
    } catch (err) {
      console.error('Error loading dead-letter emails:', err)
    } finally {
      setDeadLettersLoading(false)
    }
  }

  const handleResend = async (emailId: string) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`/api/admin/emails/${emailId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to resend email')
      }

      await loadEmails()
      alert('Email resent successfully')
    } catch (err: any) {
      alert(err.message || 'Failed to resend email')
    }
  }

  const handleRequeue = async (emailId: string) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`/api/admin/emails/${emailId}/requeue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to re-queue email')
      }

      await loadDeadLetters()
      await loadEmails()
      await loadStats()
      alert('Email re-queued successfully')
    } catch (err: any) {
      alert(err.message || 'Failed to re-queue email')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      sent: { color: 'bg-blue-500', icon: Send },
      delivered: { color: 'bg-green-500', icon: CheckCircle },
      failed: { color: 'bg-red-500', icon: XCircle },
      bounced: { color: 'bg-orange-500', icon: AlertTriangle },
      pending: { color: 'bg-yellow-500', icon: Clock }
    }
    const variant = variants[status] || variants.pending
    const Icon = variant.icon
    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
  if (!adminSession && (!user || user.role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Error Display */}
        {error && (
          <Card className="border-red-700/50 bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Email Management
            </h1>
            <p className="text-neutral-400">
              View email logs and manage email delivery
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/admin/emails/dead-letter">
              <Button variant="outline">Dead-letter Queue</Button>
            </Link>
            <Button variant="outline" onClick={() => { loadEmails(); loadStats(); loadDeadLetters() }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Sent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Bounced</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.bounced}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground ">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dead-letter Queue */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Dead-letter queue</CardTitle>
            <CardDescription>
              Failed emails that exhausted retries or were marked non-retryable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deadLettersLoading ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading dead-letter emails...
              </div>
            ) : deadLetters.length === 0 ? (
              <div className="text-sm text-neutral-400">No dead-letter emails.</div>
            ) : (
              deadLetters.map((email) => (
                <div
                  key={`dead-${email.email_id}`}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{email.subject}</p>
                      <p className="text-xs text-neutral-400">{email.recipient_email}</p>
                      <p className="text-xs text-neutral-500">
                        retries: {email.metadata?.retry_count ?? 0}
                        {email.metadata?.next_retry_at ? ` | next retry: ${new Date(email.metadata.next_retry_at).toLocaleString()}` : ''}
                      </p>
                      {email.error_message ? (
                        <p className="text-xs text-red-300">Error: {email.error_message}</p>
                      ) : null}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleRequeue(email.email_id)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-queue
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by recipient email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadEmails()}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="bounced">Bounced</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded border border-border bg-background text-foreground"
                >
                  <option value="all">All Types</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="application_notification">Application</option>
                  <option value="report">Report</option>
                  <option value="general">General</option>
                </select>
                <Button onClick={loadEmails}>Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emails List */}
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.email_id} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">
                        {email.subject}
                      </h3>
                      {getStatusBadge(email.status)}
                      <Badge variant="outline">{email.provider}</Badge>
                      <Badge variant="outline">{email.email_type}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground ">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{email.recipient_email}</span>
                        {email.recipient_name && (
                          <span className="text-muted-foreground">({email.recipient_name})</span>
                        )}
                      </div>
                      <div>
                        Created: {new Date(email.created_at).toLocaleString()}
                      </div>
                      {email.sent_at && (
                        <div>
                          Sent: {new Date(email.sent_at).toLocaleString()}
                        </div>
                      )}
                      {email.delivered_at && (
                        <div>
                          Delivered: {new Date(email.delivered_at).toLocaleString()}
                        </div>
                      )}
                      {email.provider_message_id && (
                        <div className="text-xs text-muted-foreground">
                          ID: {email.provider_message_id}
                        </div>
                      )}
                      {email.error_message && (
                        <div className="col-span-2 p-2 bg-red-900/20 border border-red-700/50 rounded text-red-300 text-xs">
                          Error: {email.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  {email.status === 'failed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(email.email_id)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Resend
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewEmail(email)}
                    className="ml-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {emails.length === 0 && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground ">
                  No emails found
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground ">
              Page {page} of {Math.ceil(total / 50)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 50)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      <Dialog open={!!previewEmail} onOpenChange={(open) => !open && setPreviewEmail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Audit Preview</DialogTitle>
            <DialogDescription>
              Read-only view of the stored email body and delivery context.
            </DialogDescription>
          </DialogHeader>
          {previewEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg border border-border bg-background p-4 text-sm">
                <div><span className="font-semibold">Subject:</span> {previewEmail.subject}</div>
                <div><span className="font-semibold">Type:</span> {previewEmail.email_type}</div>
                <div><span className="font-semibold">To:</span> {previewEmail.recipient_email}</div>
                <div><span className="font-semibold">From:</span> {previewEmail.metadata?.from || 'Not recorded'}</div>
                <div><span className="font-semibold">Provider:</span> {previewEmail.provider}</div>
                <div><span className="font-semibold">Status:</span> {previewEmail.status}</div>
                <div><span className="font-semibold">Created:</span> {new Date(previewEmail.created_at).toLocaleString()}</div>
                {previewEmail.sent_at && <div><span className="font-semibold">Sent:</span> {new Date(previewEmail.sent_at).toLocaleString()}</div>}
              </div>
              {previewEmail.metadata?.html ? (
                <div className="rounded-lg border border-border bg-white">
                  <div className="border-b border-border px-4 py-2 text-sm font-semibold text-slate-700">HTML body</div>
                  <iframe
                    title="Email HTML preview"
                    sandbox=""
                    srcDoc={previewEmail.metadata.html}
                    className="h-[520px] w-full bg-white"
                  />
                </div>
              ) : previewEmail.metadata?.text ? (
                <pre className="max-h-[520px] overflow-auto rounded-lg border border-border bg-slate-50 p-4 text-sm whitespace-pre-wrap">
                  {previewEmail.metadata.text}
                </pre>
              ) : (
                <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
                  No stored email body was found in this log entry.
                </div>
              )}
              {previewEmail.metadata && (
                <details className="rounded-lg border border-border bg-background p-4">
                  <summary className="cursor-pointer text-sm font-semibold">Raw metadata</summary>
                  <pre className="mt-3 max-h-64 overflow-auto text-xs whitespace-pre-wrap">
                    {JSON.stringify(previewEmail.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

