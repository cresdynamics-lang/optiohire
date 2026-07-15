'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone, ChevronRight, Loader2 } from 'lucide-react'

export type PlatformAnnouncement = {
  id: string
  title: string
  body: string
  category?: string
  published_at?: string
  created_at?: string
}

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('token') ||
    localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function usePlatformAnnouncements(audience?: string, limit = 3) {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const q = audience ? `?audience=${encodeURIComponent(audience)}` : ''
      const res = await fetch(`/api/announcements${q}`, { headers: authHeaders() })
      const data = await res.json()
      if (res.ok) {
        setAnnouncements((data.announcements || []).slice(0, limit))
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [audience, limit])

  useEffect(() => {
    void load()
  }, [load])

  return { announcements, loading, reload: load }
}

type SidebarAnnouncementsProps = {
  audience?: 'candidate' | 'employer' | 'admin'
  viewAllHref: string
  accent?: 'emerald' | 'blue' | 'slate'
}

export function SidebarAnnouncements({
  audience,
  viewAllHref,
  accent = 'slate',
}: SidebarAnnouncementsProps) {
  const { announcements, loading } = usePlatformAnnouncements(audience, 2)

  const accentClasses =
    accent === 'emerald'
      ? 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/40'
      : accent === 'blue'
        ? 'border-blue-200/80 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/40'
        : 'border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40'

  return (
    <div className={`mt-3 rounded-2xl border p-3 ${accentClasses}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-400">
          <Megaphone className="h-3.5 w-3.5 shrink-0" />
          Announcements
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#2D2DDD] hover:underline"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">No announcements yet.</p>
      ) : (
        <ul className="space-y-2">
          {announcements.map((a) => (
            <li key={a.id}>
              <Link href={viewAllHref} className="block rounded-lg p-2 transition-colors hover:bg-white/80 dark:hover:bg-slate-800/60">
                <p className="line-clamp-1 text-xs font-semibold text-slate-900 dark:text-slate-100">{a.title}</p>
                <p className="line-clamp-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">{a.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
