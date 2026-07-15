'use client'

import { useEffect, useState, use } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import { pageWrap, pageTitle, pageSub, eyebrow, card, btnPrimary, btnGhost, tableWrap, th, td, labelStyle, inputStyle } from '../ui'

export default function ReportsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token, institution } = useInstitution()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [dept, setDept] = useState('')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/institutions/${institutionId}/reports/summary`, {
          headers: authHeaders(token),
        })
        const json = await res.json()
        if (res.ok) setSummary(json)
      } finally {
        setLoading(false)
      }
    })()
  }, [token, institutionId])

  const downloadCsv = () => {
    if (!summary) return
    const rows = [
      ['Department', 'Students', 'Placed', 'In pipeline'],
      ...(summary.by_department || []).map((d: any) => [d.department, d.students, d.placed, d.in_pipeline]),
      [],
      ['Cohort', 'Programme', 'Students', 'Placed'],
      ...(summary.by_cohort || []).map((c: any) => [c.name, c.programme || '', c.students, c.placed]),
    ]
    const csv = rows.map((r) => r.map((c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${institution?.slug || 'institution'}-graduate-activity-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printPdf = () => {
    window.print()
  }

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Reports · Compliance</p>
      <h1 style={pageTitle}>Graduate activity reports</h1>
      <p style={pageSub}>
        Download quarterly summaries for CUE, TVETA, or TVET-CDACC — filter by date, department, or cohort.
      </p>

      <div style={{ ...card, marginTop: 22, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Optional" style={inputStyle} />
          </div>
          <button onClick={downloadCsv} style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Excel / CSV
          </button>
          <button onClick={printPdf} style={btnGhost}>PDF</button>
        </div>
        {(from || to || dept) && (
          <p style={{ fontSize: 12, color: INST.inkSoft, marginTop: 10 }}>
            Filters applied in export label only for now — summary reflects live platform data
            {dept ? ` · highlighting “${dept}”` : ''}.
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: INST.inkSoft }}>
          <Loader2 className="animate-spin" size={16} /> Loading report summary…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>By department</h2>
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Department</th>
                    <th style={th}>Students</th>
                    <th style={th}>Placed</th>
                    <th style={th}>Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.by_department || []).filter((d: any) => !dept || String(d.department).toLowerCase().includes(dept.toLowerCase())).map((d: any) => (
                    <tr key={d.department}>
                      <td style={td}>{d.department}</td>
                      <td style={td}>{d.students}</td>
                      <td style={td}>{d.placed}</td>
                      <td style={td}>{d.in_pipeline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={card}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>By cohort</h2>
            <div style={tableWrap}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Cohort</th>
                    <th style={th}>Programme</th>
                    <th style={th}>Students</th>
                    <th style={th}>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.by_cohort || []).map((c: any) => (
                    <tr key={c.id}>
                      <td style={td}>{c.name}</td>
                      <td style={td}>{c.programme || '—'}</td>
                      <td style={td}>{c.students}</td>
                      <td style={td}>{c.placed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
