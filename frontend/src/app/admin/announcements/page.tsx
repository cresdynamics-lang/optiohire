'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Megaphone, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const AUDIENCES = ['all', 'candidate', 'employer', 'institution', 'admin'] as const

type Announcement = {
  id: string
  title: string
  body: string
  category: string
  audiences: string[]
  is_active: boolean
  published_at: string
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'platform',
    audiences: ['all'] as string[],
  })

  const authHeaders = (): HeadersInit => {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements', { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setItems(data.announcements || [])
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleAudience = (a: string) => {
    setForm((f) => {
      const has = f.audiences.includes(a)
      const next = has ? f.audiences.filter((x) => x !== a) : [...f.audiences, a]
      return { ...f, audiences: next.length ? next : ['all'] }
    })
  }

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create')
      setForm({ title: '', body: '', category: 'platform', audiences: ['all'] })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to delete')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleToggleActive = async (item: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center gap-3">
        <Megaphone className="h-7 w-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Platform announcements</h1>
          <p className="text-sm text-muted-foreground">
            Broadcast to candidate, employer, institution, and admin sidebars across the platform.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> New announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            placeholder="Message body"
            rows={4}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
          <Input
            placeholder="Category (e.g. platform, partnership)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAudience(a)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                  form.audiences.includes(a)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-background text-muted-foreground border-border'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <Button onClick={() => void handleCreate()} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Publish
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                      {item.is_active ? 'Active' : 'Hidden'}
                    </Badge>
                    {item.audiences?.map((a) => (
                      <Badge key={a} variant="outline" className="text-[10px] uppercase">
                        {a}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{item.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.published_at ? new Date(item.published_at).toLocaleString() : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => void handleToggleActive(item)}>
                    {item.is_active ? 'Hide' : 'Show'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => void handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
