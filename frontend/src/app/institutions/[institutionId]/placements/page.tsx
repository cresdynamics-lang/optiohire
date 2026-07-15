'use client'

import { useEffect, useState, use } from 'react'
import { Loader2 } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import { pageWrap, pageTitle, pageSub, eyebrow, card, statusBadge, tableWrap, th, td } from '../ui'

export default function PlacementsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [placements, setPlacements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/institutions/${institutionId}/placements`, {
          headers: authHeaders(token),
        })
        const json = await res.json()
        if (res.ok) setPlacements(json.placements || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [token, institutionId])

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Placements</p>
      <h1 style={pageTitle}>Confirmed placements</h1>
      <p style={pageSub}>
        Students hired or interning through OptioHire — feeds TVETA and accreditation reporting.
      </p>

      <div style={{ ...card, marginTop: 22 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: INST.inkSoft }}>
            <Loader2 className="animate-spin" size={16} /> Loading…
          </div>
        ) : (
          <div style={tableWrap}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Student</th>
                  <th style={th}>Department</th>
                  <th style={th}>Employer</th>
                  <th style={th}>Role</th>
                  <th style={th}>Type</th>
                  <th style={th}>Source</th>
                  <th style={th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {placements.length === 0 && (
                  <tr><td colSpan={7} style={{ ...td, color: INST.inkSoft }}>No confirmed placements yet.</td></tr>
                )}
                {placements.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.student_name}</td>
                    <td style={td}>{p.department || '—'}</td>
                    <td style={td}>{p.employer}</td>
                    <td style={td}>{p.role}</td>
                    <td style={td}><span style={statusBadge(p.placement_type)}>{p.placement_type}</span></td>
                    <td style={td}>{p.source === 'application' ? 'Live hire' : 'Roster'}</td>
                    <td style={td}>{p.placed_at ? new Date(p.placed_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
