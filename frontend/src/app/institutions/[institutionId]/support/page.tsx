'use client'

import { useEffect, useState, use } from 'react'
import { Loader2, LifeBuoy } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import {
  pageWrap, pageTitle, pageSub, eyebrow, card, btnPrimary, labelStyle, inputStyle, statusBadge, tableWrap, th, td,
} from '../ui'

export default function SupportPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [tickets, setTickets] = useState<any[]>([])
  const [sla, setSla] = useState('Within 1 business day')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [form, setForm] = useState({ subject: '', message: '' })

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/support`, {
        headers: authHeaders(token),
      })
      const json = await res.json()
      if (res.ok) {
        setTickets(json.tickets || [])
        if (json.response_sla) setSla(json.response_sla)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, institutionId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/support`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit')
      setMsg('Ticket submitted. Our team will respond soon.')
      setForm({ subject: '', message: '' })
      await load()
    } catch (err: any) {
      setMsg(err.message || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Support</p>
      <h1 style={pageTitle}>Direct line to OptioHire</h1>
      <p style={pageSub}>Raise a query, report an issue, or request assistance.</p>

      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 12,
        background: INST.primaryPale, border: `1px solid ${INST.line}`,
        display: 'flex', alignItems: 'center', gap: 10, maxWidth: 480,
      }}>
        <LifeBuoy size={18} color={INST.primaryMid} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: INST.primary }}>Response time commitment</div>
          <div style={{ fontSize: 13, color: INST.inkSoft }}>{sla}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, marginTop: 22 }}>
        <div style={card}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>New ticket</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Subject</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            {msg && <p style={{ fontSize: 13, color: INST.primaryMid, margin: 0 }}>{msg}</p>}
            <button type="submit" disabled={submitting} style={btnPrimary}>
              {submitting ? 'Sending…' : 'Submit ticket'}
            </button>
          </form>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Your tickets</h2>
          {loading ? (
            <div style={{ display: 'flex', gap: 8, color: INST.inkSoft }}><Loader2 className="animate-spin" size={16} /> Loading…</div>
          ) : (
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Subject</th>
                    <th style={th}>Status</th>
                    <th style={th}>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 && (
                    <tr><td colSpan={3} style={{ ...td, color: INST.inkSoft }}>No tickets yet.</td></tr>
                  )}
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{t.subject}</div>
                        <div style={{ fontSize: 12, color: INST.inkSoft, marginTop: 2 }}>{t.message?.slice(0, 80)}</div>
                      </td>
                      <td style={td}><span style={statusBadge(t.status)}>{t.status}</span></td>
                      <td style={td}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
