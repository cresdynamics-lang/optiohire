'use client'

import { useEffect, useState, use } from 'react'
import { Loader2 } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import { pageWrap, pageTitle, pageSub, eyebrow, card, statusBadge, tableWrap, th, td } from '../ui'

export default function EmployerActivityPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/institutions/${institutionId}/employer-activity`, {
          headers: authHeaders(token),
        })
        const json = await res.json()
        if (res.ok) setActivity(json.activity || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [token, institutionId])

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Employer activity</p>
      <h1 style={pageTitle}>Who is engaging your students</h1>
      <p style={pageSub}>
        Employers who contacted or shortlisted your graduates — without exposing private student message content.
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
                  <th style={th}>Company</th>
                  <th style={th}>Student</th>
                  <th style={th}>Role considered</th>
                  <th style={th}>When</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {activity.length === 0 && (
                  <tr><td colSpan={5} style={{ ...td, color: INST.inkSoft }}>No employer engagement yet.</td></tr>
                )}
                {activity.map((a) => (
                  <tr key={a.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{a.employer}</td>
                    <td style={td}>
                      <div>{a.student_name}</div>
                      <div style={{ fontSize: 12, color: INST.inkSoft }}>{a.department || a.cohort_name}</div>
                    </td>
                    <td style={td}>{a.role}</td>
                    <td style={td}>{a.contacted_at ? new Date(a.contacted_at).toLocaleDateString() : '—'}</td>
                    <td style={td}><span style={statusBadge(a.status)}>{a.status}</span></td>
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
