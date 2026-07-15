'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Megaphone, ChevronRight, Loader2 } from 'lucide-react'
import { INST } from './theme'
import { authHeaders } from './theme'

type Props = {
  institutionId: string
  token: string | null
}

export function InstitutionSidebarAnnouncements({ institutionId, token }: Props) {
  const [items, setItems] = useState<{ id: string; title: string; body: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const res = await fetch(`/api/institutions/${institutionId}/announcements`, {
          headers: authHeaders(token),
        })
        const json = await res.json()
        if (res.ok) setItems((json.announcements || []).slice(0, 2))
      } finally {
        setLoading(false)
      }
    })()
  }, [token, institutionId])

  const href = `/institutions/${institutionId}/announcements`

  return (
    <div style={{
      marginTop: 8,
      borderRadius: 12,
      border: '1px solid rgba(147,197,253,0.22)',
      background: 'rgba(59,130,246,0.12)',
      padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: INST.sidebarMuted }}>
          <Megaphone size={12} /> Announcements
        </div>
        <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 600, color: '#93c5fd', textDecoration: 'none' }}>
          View all <ChevronRight size={12} />
        </Link>
      </div>
      {loading ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: INST.sidebarMuted }}>
          <Loader2 size={12} className="animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 11, color: INST.sidebarMuted }}>No announcements yet.</p>
      ) : (
        items.map((a) => (
          <Link key={a.id} href={href} style={{ display: 'block', textDecoration: 'none', marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{a.title}</div>
            <div style={{ fontSize: 10.5, color: INST.sidebarMuted, lineHeight: 1.35, marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
              {a.body}
            </div>
          </Link>
        ))
      )}
    </div>
  )
}
