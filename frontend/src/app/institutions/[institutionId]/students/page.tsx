'use client'

import { useEffect, useState, use } from 'react'
import { Loader2, Search } from 'lucide-react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import {
  pageWrap, pageTitle, pageSub, eyebrow, card, inputStyle, labelStyle,
  btnGhost, statusBadge, tableWrap, th, td,
} from '../ui'

export default function StudentsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token } = useInstitution()
  const [students, setStudents] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const q = new URLSearchParams()
      if (search) q.set('search', search)
      if (department) q.set('department', department)
      if (status) q.set('status', status)
      const res = await fetch(`/api/institutions/${institutionId}/students?${q}`, {
        headers: authHeaders(token),
      })
      const json = await res.json()
      if (res.ok) {
        setStudents(json.students || [])
        setTotal(json.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, institutionId])

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Students</p>
      <h1 style={pageTitle}>Student roster</h1>
      <p style={pageSub}>Every student from your institution on OptioHire — searchable and filterable.</p>

      <div style={{ ...card, marginTop: 22, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: 13, color: INST.inkSoft }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, email, or student ID"
                style={{ ...inputStyle, paddingLeft: 34 }}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. ICT" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="placed">Placed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button onClick={() => void load()} style={btnGhost}>Apply</button>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: INST.inkSoft }}>{total} students</span>
          {loading && <Loader2 className="animate-spin" size={16} color={INST.primaryMid} />}
        </div>
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Department</th>
                <th style={th}>Profile</th>
                <th style={th}>Matches</th>
                <th style={th}>Status</th>
                <th style={th}>Cohort</th>
              </tr>
            </thead>
            <tbody>
              {!loading && students.length === 0 && (
                <tr><td colSpan={6} style={{ ...td, color: INST.inkSoft }}>No students found.</td></tr>
              )}
              {students.map((s) => (
                <tr key={s.id}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{s.candidate_name || '—'}</div>
                    <div style={{ fontSize: 12, color: INST.inkSoft }}>{s.email}</div>
                  </td>
                  <td style={td}>{s.department || '—'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: INST.line, borderRadius: 99, maxWidth: 80 }}>
                        <div style={{
                          width: `${s.profile_completion || 0}%`, height: '100%',
                          background: INST.primaryMid, borderRadius: 99,
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{s.profile_completion || 0}%</span>
                    </div>
                  </td>
                  <td style={td}>{s.matched_to ? 1 : 0}</td>
                  <td style={td}><span style={statusBadge(s.employment_status || s.row_status)}>{s.employment_status || s.row_status}</span></td>
                  <td style={td}>{s.cohort_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
