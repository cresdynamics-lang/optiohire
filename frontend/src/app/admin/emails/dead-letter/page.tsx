'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react'

type EmailLog = {
  email_id: string
  recipient_email: string
  subject: string
  email_type: string
  status: 'failed' | 'pending' | 'sent' | 'delivered' | 'bounced'
  error_message?: string
  created_at: string
  metadata?: {
    retry_count?: number
    is_retry_eligible?: boolean
    next_retry_at?: string | null
  }
}

export default function DeadLetterEmailsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) return
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession || (user && user.role === 'admin')) {
      void loadDeadLetters()
    }
  }, [user])

  const loadDeadLetters = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/emails/dead-letter?page=1&limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load dead-letter emails')
      }
      const data = await response.json()
      setEmails(data.emails || [])
      setSelectedIds([])
    } catch (err: any) {
      setError(err.message || 'Failed to load dead-letter emails')
    } finally {
      setLoading(false)
    }
  }

  const filteredEmails = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return emails
    return emails.filter((e) =>
      e.recipient_email.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.email_type.toLowerCase().includes(q)
    )
  }, [emails, search])

  const toggleSelection = (emailId: string) => {
    setSelectedIds((prev) =>
      prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]
    )
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredEmails.map((e) => e.email_id)
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id))
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {
      const next = new Set([...selectedIds, ...visibleIds])
      setSelectedIds(Array.from(next))
    }
  }

  const handleBulkRequeue = async () => {
    if (selectedIds.length === 0) return
    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/emails/requeue-bulk', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailIds: selectedIds }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to re-queue selected emails')
      }
      await loadDeadLetters()
      alert('Selected emails re-queued successfully')
    } catch (err: any) {
      alert(err.message || 'Failed to re-queue selected emails')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequeueAll = async () => {
    const confirmed = window.confirm(
      'Re-queue all dead-letter emails? This action is capped for safety and may trigger many retries.'
    )
    if (!confirmed) return

    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/emails/requeue-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 200 }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to re-queue all dead-letter emails')
      }
      const data = await response.json()
      await loadDeadLetters()
      alert(data.message || 'Re-queue all completed')
    } catch (err: any) {
      alert(err.message || 'Failed to re-queue all dead-letter emails')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSingleRequeue = async (emailId: string) => {
    try {
      setActionLoading(true)
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(`/api/admin/emails/${emailId}/requeue`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to re-queue email')
      }
      await loadDeadLetters()
    } catch (err: any) {
      alert(err.message || 'Failed to re-queue email')
    } finally {
      setActionLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  const adminSession = typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
  if (!adminSession && (!user || user.role !== 'admin')) return null

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dead-letter Emails</h1>
            <p className="text-neutral-400">Failed emails that need manual intervention or re-queue.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/emails">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Emails
              </Button>
            </Link>
            <Button variant="outline" onClick={() => void loadDeadLetters()} disabled={loading || actionLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${(loading || actionLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-red-700/50 bg-red-900/20">
            <CardContent className="pt-6 text-red-300">{error}</CardContent>
          </Card>
        ) : null}

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-white">Queue Controls</CardTitle>
            <CardDescription>Filter and bulk re-queue dead-letter emails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search by recipient, subject, or email type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-lg"
              />
              <Button variant="outline" onClick={toggleSelectAllVisible}>
                {filteredEmails.every((e) => selectedIds.includes(e.email_id)) && filteredEmails.length > 0 ? 'Unselect visible' : 'Select visible'}
              </Button>
              <Button onClick={handleBulkRequeue} disabled={selectedIds.length === 0 || actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Re-queue selected ({selectedIds.length})
              </Button>
              <Button variant="destructive" onClick={handleRequeueAll} disabled={actionLoading || emails.length === 0}>
                Re-queue all (guarded)
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {filteredEmails.map((email) => {
            const selected = selectedIds.includes(email.email_id)
            return (
              <Card key={email.email_id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleSelection(email.email_id)}
                        className="mt-1 h-4 w-4"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <p className="font-medium text-white">{email.subject}</p>
                          <Badge variant="outline">{email.email_type}</Badge>
                          <Badge className="bg-red-600 text-white">failed</Badge>
                        </div>
                        <p className="text-sm text-neutral-400">{email.recipient_email}</p>
                        <p className="text-xs text-neutral-500">
                          retries: {email.metadata?.retry_count ?? 0}
                          {email.metadata?.next_retry_at ? ` | next retry: ${new Date(email.metadata.next_retry_at).toLocaleString()}` : ''}
                          {` | created: ${new Date(email.created_at).toLocaleString()}`}
                        </p>
                        {email.error_message ? (
                          <p className="text-xs text-red-300">Error: {email.error_message}</p>
                        ) : null}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => void handleSingleRequeue(email.email_id)} disabled={actionLoading}>
                      Re-queue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredEmails.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 text-neutral-400">No dead-letter emails found.</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
