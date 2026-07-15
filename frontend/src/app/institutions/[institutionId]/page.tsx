'use client'

import { useEffect, useState, use, type CSSProperties } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import { Users, Target, MessageSquare, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { useInstitution } from './layout'
import { INST, authHeaders } from './theme'

const PIE_COLORS = ['#2563EB', '#0EA5E9', '#6366F1', '#38BDF8', '#1E3A5F', '#93C5FD']

export default function InstitutionDashboardPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token, institution } = useInstitution()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/dashboard`, {
        headers: authHeaders(token),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard')
      setData(json)
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, institutionId])

  if (loading && !data) {
    return (
      <div style={{ padding: 48, display: 'flex', alignItems: 'center', gap: 10, color: INST.inkSoft }}>
        <Loader2 className="animate-spin" size={18} /> Loading live dashboard…
      </div>
    )
  }

  if (error && !data) {
    return (
      <div style={{ padding: 48 }}>
        <p style={{ color: INST.danger, marginBottom: 12 }}>{error}</p>
        <button onClick={() => void load()} style={btnPrimary}>Retry</button>
      </div>
    )
  }

  const kpi = data?.kpi || {}
  const cards = [
    { label: 'Total Students Onboarded', value: kpi.total_students_onboarded ?? 0, icon: Users, hint: 'All students on OptioHire' },
    { label: 'Matched This Month', value: kpi.matched_this_month ?? 0, icon: Target, hint: 'Matched to employers' },
    { label: 'Contacted This Week', value: kpi.contacted_this_week ?? 0, icon: MessageSquare, hint: 'Employer engagement' },
    { label: 'Placements Confirmed', value: kpi.placements_confirmed ?? 0, icon: CheckCircle2, hint: 'Hired / interning' },
  ]

  const engagement = (data?.employer_engagement || []).map((r: any) => ({
    week: String(r.week).slice(5),
    engagements: r.engagements,
  }))
  const departments = data?.departments || []
  const skills = data?.top_skills || []
  const feed = data?.recent_activity || []
  const upcoming = data?.upcoming_onboarding || []

  return (
    <div style={{ padding: '28px 28px 48px', maxWidth: 1280 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: INST.primaryMid, marginBottom: 6 }}>
            Main dashboard
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: INST.ink, margin: 0 }}>
            {institution?.name || data?.institution?.name || 'Institution'}
          </h1>
          <p style={{ color: INST.inkSoft, marginTop: 8, fontSize: 14, maxWidth: 560 }}>
            How are your students performing on OptioHire right now?
          </p>
        </div>
        <button onClick={() => void load()} style={btnGhost}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 }}>
        {cards.map((c) => (
          <div key={c.label} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: INST.inkSoft }}>{c.label}</span>
              <c.icon size={16} color={INST.primaryMid} />
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: INST.ink, lineHeight: 1 }}>
              {c.value}
            </div>
            <div style={{ fontSize: 11, color: INST.inkSoft, marginTop: 8 }}>{c.hint}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Activity feed */}
        <div style={{ ...card, minHeight: 360 }}>
          <h2 style={sectionTitle}>Live activity feed</h2>
          <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feed.length === 0 && (
              <p style={{ color: INST.inkSoft, fontSize: 13 }}>No recent student activity yet. Onboard a cohort to see live updates.</p>
            )}
            {feed.map((item: any, i: number) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 10, background: INST.paper,
                border: `1px solid ${INST.line}`,
              }}>
                <div style={{ fontSize: 13.5, color: INST.ink, fontWeight: 500 }}>{item.message}</div>
                <div style={{ fontSize: 11, color: INST.inkSoft, marginTop: 4 }}>
                  {item.department ? `${item.department} · ` : ''}
                  {item.time ? new Date(item.time).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Employer engagement chart */}
        <div style={{ ...card, minHeight: 360 }}>
          <h2 style={sectionTitle}>Employer engagement (30 days)</h2>
          {engagement.length === 0 ? (
            <p style={{ color: INST.inkSoft, fontSize: 13 }}>No employer engagement in the last 30 days yet.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={engagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke={INST.line} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="engagements" fill={INST.primaryMid} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Top skills */}
        <div style={card}>
          <h2 style={sectionTitle}>Top matched skills this month</h2>
          {skills.length === 0 ? (
            <p style={{ color: INST.inkSoft, fontSize: 13 }}>Skills will appear as employers engage with your students.</p>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {skills.map((s: any, i: number) => (
                <li key={s.skill} style={{ fontSize: 14, color: INST.ink }}>
                  <span style={{ fontWeight: 700, color: INST.primaryMid, marginRight: 6 }}>{i + 1}.</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{s.skill}</span>
                  <span style={{ color: INST.inkSoft }}> · {s.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Departments */}
        <div style={card}>
          <h2 style={sectionTitle}>Departments breakdown</h2>
          {departments.length === 0 ? (
            <p style={{ color: INST.inkSoft, fontSize: 13 }}>No department data yet.</p>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={departments.map((d: any) => ({ name: d.department, value: d.active || d.total }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {departments.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {departments.slice(0, 5).map((d: any, i: number) => (
                  <span key={d.department} style={{ fontSize: 11, color: INST.inkSoft }}>
                    <span style={{ color: PIE_COLORS[i % PIE_COLORS.length], fontWeight: 700 }}>●</span> {d.department} ({d.active}/{d.total})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming onboarding */}
        <div style={card}>
          <h2 style={sectionTitle}>Upcoming onboarding sessions</h2>
          {upcoming.length === 0 ? (
            <p style={{ color: INST.inkSoft, fontSize: 13 }}>No upcoming sessions. Request one from Onboarding Sessions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((s: any) => (
                <div key={s.id} style={{
                  padding: 12, borderRadius: 10, border: `1px solid ${INST.line}`, background: INST.paper,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: INST.ink }}>
                    {s.department || 'All departments'}
                  </div>
                  <div style={{ fontSize: 12, color: INST.inkSoft, marginTop: 4 }}>
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString() : 'TBD'}
                    {' · '}
                    {s.expected_count ?? 0} students
                  </div>
                  <div style={{ fontSize: 11, color: INST.primaryMid, marginTop: 4 }}>
                    {s.facilitator || s.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const card: CSSProperties = {
  background: INST.raised,
  border: `1px solid ${INST.line}`,
  borderRadius: 16,
  padding: 18,
  boxShadow: '0 10px 30px -24px rgba(15,39,68,0.45)',
}

const sectionTitle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: INST.ink,
  margin: '0 0 14px',
}

const btnPrimary: CSSProperties = {
  background: INST.primaryMid, color: '#fff', border: 'none', borderRadius: 10,
  padding: '10px 14px', fontWeight: 600, cursor: 'pointer',
}

const btnGhost: CSSProperties = {
  background: INST.raised, color: INST.primary, border: `1px solid ${INST.line}`,
  borderRadius: 10, padding: '8px 12px', fontWeight: 600, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
