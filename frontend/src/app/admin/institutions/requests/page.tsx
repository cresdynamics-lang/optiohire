'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Radio, CalendarDays, MessageSquare, CheckCircle, RefreshCw, GraduationCap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LiveRequest {
  id: string
  type: 'support' | 'onboarding_session'
  institution_id: string
  institution_name: string
  subject: string
  message: string
  status: string
  department?: string | null
  scheduled_at?: string | null
  expected_count?: number | null
  created_at: string
  contact_email?: string | null
}

const POLL_MS = 10000

export default function AdminInstitutionRequestsPage() {
  const [requests, setRequests] = useState<LiveRequest[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [live, setLive] = useState(true)
  const sinceRef = useRef<string | null>(null)

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const load = useCallback(async (incremental = false) => {
    try {
      const q = incremental && sinceRef.current ? `?since=${encodeURIComponent(sinceRef.current)}` : ''
      const res = await fetch(`/api/admin/institutions/requests${q}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')

      if (incremental && data.requests?.length) {
        setRequests((prev) => {
          const ids = new Set(prev.map((r) => `${r.type}-${r.id}`))
          const merged = [...data.requests.filter((r: LiveRequest) => !ids.has(`${r.type}-${r.id}`)), ...prev]
          return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        })
      } else if (!incremental) {
        setRequests(data.requests || [])
      }

      setOpenCount(data.open_count ?? 0)
      setLastSync(data.server_time || new Date().toISOString())
      sinceRef.current = data.server_time || new Date().toISOString()
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    if (!live) return
    const t = setInterval(() => void load(true), POLL_MS)
    return () => clearInterval(t)
  }, [live, load])

  const markSeen = async (type: string, id: string) => {
    try {
      const res = await fetch(`/api/admin/institutions/requests/${type}/${id}/seen`, {
        method: 'PUT',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to update')
      setRequests((prev) =>
        prev.map((r) => (r.id === id && r.type === type ? { ...r, status: 'seen' } : r))
      )
      setOpenCount((c) => Math.max(0, c - 1))
    } catch (e: any) {
      setError(e.message)
    }
  }

  const isOpen = (status: string) => ['open', 'scheduled', 'requested', 'pending'].includes(status.toLowerCase())

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight">Institution requests — live</h1>
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 border border-red-100">
                <Radio className="h-3 w-3 animate-pulse" /> Live · 10s
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm max-w-xl">
            Support tickets and onboarding session requests from institution partners appear here within seconds.
            Also mirrored to <strong>Support Tickets</strong> with high priority.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={openCount > 0 ? 'destructive' : 'secondary'}>{openCount} open</Badge>
          <Button variant="outline" size="sm" onClick={() => setLive((v) => !v)}>
            {live ? 'Pause live' : 'Resume live'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void load(false)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {lastSync && (
        <p className="text-xs text-muted-foreground">Last synced: {new Date(lastSync).toLocaleString()}</p>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center text-muted-foreground">
            No institution requests yet. When a partner submits Support or requests an onboarding session, it will show here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((r) => (
            <Card key={`${r.type}-${r.id}`} className={isOpen(r.status) ? 'border-blue-200 shadow-sm' : ''}>
              <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-base flex flex-wrap items-center gap-2">
                      {r.type === 'onboarding_session' ? (
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      )}
                      {r.subject}
                      <Badge variant={isOpen(r.status) ? 'destructive' : 'secondary'} className="uppercase text-[10px]">
                        {r.type === 'onboarding_session' ? 'Session' : 'Support'}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-[10px]">{r.status}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium">
                      {r.institution_name}
                      {r.contact_email ? ` · ${r.contact_email}` : ''}
                    </CardDescription>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                    {isOpen(r.status) && (
                      <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={() => void markSeen(r.type, r.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-background border rounded-md p-4 font-sans">
                  {r.message}
                </pre>
                {r.scheduled_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Scheduled: {new Date(r.scheduled_at).toLocaleString()}
                    {r.expected_count != null ? ` · ${r.expected_count} students` : ''}
                    {r.department ? ` · ${r.department}` : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
