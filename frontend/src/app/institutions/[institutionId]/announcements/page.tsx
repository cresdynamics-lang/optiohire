'use client'

import { useEffect, useState, use } from 'react'
import { Loader2, Megaphone } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import { pageWrap, pageTitle, pageSub, eyebrow, card } from '../ui'

export default function AnnouncementsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/institutions/${institutionId}/announcements`, {
          headers: authHeaders(token),
        })
        const json = await res.json()
        if (res.ok) setItems(json.announcements || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [token, institutionId])

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Announcements</p>
      <h1 style={pageTitle}>Partner updates</h1>
      <p style={pageSub}>New employer partnerships, platform updates, and messages for your institution.</p>

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && (
          <div style={{ display: 'flex', gap: 8, color: INST.inkSoft }}>
            <Loader2 className="animate-spin" size={16} /> Loading…
          </div>
        )}
        {!loading && items.length === 0 && (
          <div style={card}><p style={{ color: INST.inkSoft, margin: 0 }}>No announcements yet.</p></div>
        )}
        {items.map((a) => (
          <div key={a.id} style={card}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: INST.primaryPale,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Megaphone size={16} color={INST.primaryMid} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: INST.primaryMid, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  {a.category || 'update'}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: '4px 0 8px', color: INST.ink }}>{a.title}</h2>
                <p style={{ fontSize: 14, color: INST.inkSoft, margin: 0, lineHeight: 1.55 }}>{a.body}</p>
                {a.created_at && (
                  <div style={{ fontSize: 12, color: INST.inkSoft, marginTop: 10 }}>
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
