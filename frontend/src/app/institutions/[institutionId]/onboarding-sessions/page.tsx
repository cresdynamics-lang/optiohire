'use client'

import { useEffect, useState, use } from 'react'
import { Loader2, CalendarPlus } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import {
  pageWrap, pageTitle, pageSub, eyebrow, card, btnPrimary, labelStyle, inputStyle, statusBadge, tableWrap, th, td,
} from '../ui'

export default function OnboardingSessionsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [form, setForm] = useState({
    preferred_date: '',
    department: '',
    expected_count: '40',
    notes: '',
  })

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/onboarding-sessions`, {
        headers: authHeaders(token),
      })
      const json = await res.json()
      if (res.ok) setSessions(json.sessions || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, institutionId])

  const requestSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/onboarding-sessions`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          preferred_date: form.preferred_date,
          department: form.department || null,
          expected_count: Number(form.expected_count) || 0,
          notes: form.notes || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Request failed')
      setMsg('Onboarding session requested. OptioHire will confirm a facilitator.')
      setForm({ preferred_date: '', department: '', expected_count: '40', notes: '' })
      await load()
    } catch (err: any) {
      setMsg(err.message || 'Failed to request session')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Onboarding sessions</p>
      <h1 style={pageTitle}>Session log & requests</h1>
      <p style={pageSub}>Past onboarding at your campus, plus a form to request the next one.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 22 }}>
        <div style={card}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Session history</h2>
          {loading ? (
            <div style={{ display: 'flex', gap: 8, color: INST.inkSoft }}><Loader2 className="animate-spin" size={16} /> Loading…</div>
          ) : (
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Date</th>
                    <th style={th}>Department</th>
                    <th style={th}>Students</th>
                    <th style={th}>Facilitator</th>
                    <th style={th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 && (
                    <tr><td colSpan={5} style={{ ...td, color: INST.inkSoft }}>No sessions logged yet.</td></tr>
                  )}
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td style={td}>{s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : '-'}</td>
                      <td style={td}>{s.department || '-'}</td>
                      <td style={td}>{s.onboarded_count ?? s.expected_count ?? 0}</td>
                      <td style={td}>{s.facilitator || '-'}</td>
                      <td style={td}><span style={statusBadge(s.status || 'scheduled')}>{s.status || 'scheduled'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarPlus size={16} color={INST.primaryMid} /> Request a session
          </h2>
          <form onSubmit={requestSession} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Preferred date & time</label>
              <input
                type="datetime-local"
                required
                value={form.preferred_date}
                onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="ICT, Engineering, Business…"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Expected student count</label>
              <input
                type="number"
                min={1}
                value={form.expected_count}
                onChange={(e) => setForm({ ...form, expected_count: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Room, campus, special needs…"
              />
            </div>
            {msg && <p style={{ fontSize: 13, color: INST.primaryMid, margin: 0 }}>{msg}</p>}
            <button type="submit" disabled={submitting} style={btnPrimary}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
