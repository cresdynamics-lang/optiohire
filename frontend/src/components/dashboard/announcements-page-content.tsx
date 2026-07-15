'use client'

import { useEffect, useState } from 'react'
import { Loader2, Megaphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Announcement = {
  id: string
  title: string
  body: string
  category?: string
  published_at?: string
  created_at?: string
}

type Props = {
  audience?: 'candidate' | 'employer' | 'admin'
  title?: string
  subtitle?: string
}

export function AnnouncementsPageContent({
  audience,
  title = 'Announcements',
  subtitle = 'Platform updates and important notices for your workspace.',
}: Props) {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
        const q = audience ? `?audience=${encodeURIComponent(audience)}` : ''
        const res = await fetch(`/api/announcements${q}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = await res.json()
        if (res.ok) setItems(json.announcements || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [audience])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Updates</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading announcements…
        </div>
      )}

      {!loading && items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No announcements yet. Check back here for platform updates.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {items.map((a) => (
          <Card key={a.id} className="overflow-hidden border-slate-200/90 shadow-sm dark:border-slate-800">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2D2DDD]/10 text-[#2D2DDD]">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {a.category || 'update'}
                  </Badge>
                  {(a.published_at || a.created_at) && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.published_at || a.created_at!).toLocaleString()}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">{a.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {a.body}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
