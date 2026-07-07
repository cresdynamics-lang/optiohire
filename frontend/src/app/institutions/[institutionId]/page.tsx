'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Users, Briefcase, Award, ArrowUpRight } from 'lucide-react'

interface DashboardData {
    institution: any
    current_cohort: any
    stats: {
        enrolled: number; activated: number; shortlisted: number; interviewing: number;
        placed: number; interning: number; requires_review: number; pool: number
    }
    cohorts: any[]
    top_employers?: any[]
    recent_activity?: any[]
}

export default function InstitutionOverviewPage({ params }: { params: Promise<{ institutionId: string }> }) {
    const { institutionId } = use(params)
    const router = useRouter()
    const [data, setData] = useState<DashboardData | null>(null)
    const [selectedCohortId, setSelectedCohortId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('institution_token')
        if (!token) { router.replace('/institutions/auth/signin'); return }

        setLoading(true)
        const url = `/api/institutions/${institutionId}/dashboard` + (selectedCohortId ? `?cohortId=${selectedCohortId}` : '')
        fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => {
            if (d.error) setError(d.error)
            else {
                setData(d)
                if (!selectedCohortId && d.current_cohort) {
                    setSelectedCohortId(d.current_cohort.id)
                }
            }
        }).catch(() => setError('Failed to load dashboard')).finally(() => setLoading(false))
    }, [institutionId, selectedCohortId, router])

    const stats = data?.stats
    const total = stats ? stats.enrolled : 0

    const funnelStages = stats ? [
        { label: 'Enrolled by institution', count: stats.enrolled, pct: '100%', color: '#3E5449' },
        { label: 'Invitation activated', count: stats.activated, pct: total ? `${Math.round(stats.activated / total * 100)}%` : '0%', color: '#3E6C8E' },
        { label: 'Shortlisted', count: stats.shortlisted, pct: stats.activated ? `${Math.round(stats.shortlisted / stats.activated * 100)}%` : '0%', color: '#B98A2E' },
        { label: 'Interviewing', count: stats.interviewing, pct: stats.shortlisted ? `${Math.round(stats.interviewing / stats.shortlisted * 100)}%` : '0%', color: '#2A7A52' },
        { label: 'Placed / Interning', count: (stats.placed + stats.interning), pct: stats.interviewing ? `${Math.round((stats.placed + stats.interning) / stats.interviewing * 100)}%` : '0%', color: '#1F4D3D' },
    ] : []

    const statCards = stats ? [
        { n: stats.enrolled, l: 'Students onboarded', d: 'Full cohort loaded', icon: Users },
        { n: stats.activated, l: 'Accounts activated', d: total ? `${Math.round(stats.activated / total * 100)}% activation rate` : '', icon: TrendingUp },
        { n: stats.shortlisted, l: 'Shortlisted somewhere', d: 'Across all open roles', icon: Award },
        { n: stats.interviewing, l: 'In interview stage', d: 'Active interview discussions', icon: Briefcase },
        { n: stats.placed, l: 'Placed — full-time', d: 'Confirmed employment', icon: Award },
        { n: stats.interning, l: 'Placed — internship', d: 'Active internships', icon: Briefcase },
    ] : []

    const handleExportLedger = () => {
        if (!data || !funnelStages.length) return
        let csvContent = "data:text/csv;charset=utf-8," 
            + "Stage,Count,Percentage of previous\n"
            + funnelStages.map(s => `"${s.label}",${s.count},"${s.pct}"`).join("\n")
        
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `matriculation_ledger_${data.current_cohort?.name || 'cohort'}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (loading && !data) return (
        <div style={{ padding: '40px 34px', color: '#152A22', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 28 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} style={{ height: 90, borderRadius: 10, background: '#E9ECE5', animation: 'pulse 1.5s infinite' }} />
                ))}
            </div>
        </div>
    )

    if (error) return (
        <div style={{ padding: '40px 34px', color: '#9C3B2C' }}>
            <p>{error}</p>
        </div>
    )

    return (
        <div style={{ padding: '26px 34px 60px', maxWidth: 1240, fontFamily: 'Inter, sans-serif', color: '#152A22' }}>
            {/* Topbar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: '#B98A2E', fontWeight: 600, marginBottom: 4 }}>
                        {data?.current_cohort?.name || 'Dashboard'}
                    </div>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
                        Good morning, {data?.institution?.name?.split(' ')[0] || 'Admin'}.
                    </h1>
                    <p style={{ color: '#3E5449', fontSize: 13.5, marginTop: 4, maxWidth: 520 }}>
                        {stats?.enrolled || 0} finalists are moving through the OptioHire pipeline. Here's where they stand today.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {data?.cohorts && data.cohorts.length > 0 && (
                        <select 
                            value={selectedCohortId} 
                            onChange={(e) => setSelectedCohortId(e.target.value)}
                            style={{ border: '1px solid #DCE1D5', background: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#152A22' }}
                        >
                            {data.cohorts.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    )}
                    <Link href={`/institutions/${institutionId}/onboarding`}
                        style={{ background: '#1F4D3D', color: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        + New Cohort Upload
                    </Link>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 28 }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, padding: '16px 16px 14px', boxShadow: '0 1px 2px rgba(21,42,34,0.06), 0 6px 20px rgba(21,42,34,0.06)' }}>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, color: '#1F4D3D' }}>{card.n.toLocaleString()}</div>
                        <div style={{ fontSize: 11.5, color: '#3E5449', marginTop: 3, lineHeight: 1.3 }}>{card.l}</div>
                        {card.d && <div style={{ fontSize: 10.5, fontWeight: 600, marginTop: 8, color: '#2A7A52' }}>{card.d}</div>}
                    </div>
                ))}
            </div>

            {/* Matriculation Ledger */}
            <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06), 0 6px 20px rgba(21,42,34,0.06)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #DCE1D5' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 16.5, fontWeight: 600, margin: 0 }}>The Matriculation Ledger</h2>
                        <div style={{ fontSize: 12, color: '#3E5449', marginTop: 2 }}>Every student's journey from enrolment to placement, stamped stage by stage.</div>
                    </div>
                    <button 
                        onClick={handleExportLedger}
                        style={{ border: '1px solid transparent', background: 'transparent', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#3E5449', cursor: 'pointer' }}
                    >
                        Export ledger →
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', padding: '4px 2px 8px' }}>
                    {funnelStages.map((stage, i) => (
                        <div key={i} style={{ flex: 1, minWidth: 118, position: 'relative', padding: '14px 14px 16px', borderRight: i < funnelStages.length - 1 ? '1px dashed #DCE1D5' : 'none' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2.5px solid ${stage.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 16, marginBottom: 10, transform: 'rotate(-4deg)', color: stage.color }}>
                                {stage.count}
                            </div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#152A22' }}>{stage.label}</div>
                            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#3E5449', marginTop: 2 }}>{stage.pct} of previous</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Employers and Recent Activity side-by-side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, marginBottom: 24 }}>
                {/* Top Employers */}
                <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06), 0 6px 20px rgba(21,42,34,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #DCE1D5' }}>
                        <div>
                            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 16.5, fontWeight: 600, margin: 0 }}>Where our graduates are landing</h2>
                            <div style={{ fontSize: 12, color: '#3E5449', marginTop: 2 }}>Top employers matching this cohort, by placements secured</div>
                        </div>
                    </div>
                    <div style={{ padding: 20 }}>
                        {!data?.top_employers || data.top_employers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#3E5449', fontSize: 13 }}>No placements recorded yet.</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Employer', 'Role type', 'Placed', 'Avg. match score'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: '#3E5449', fontWeight: 600, padding: '10px 14px', borderBottom: '1px solid #DCE1D5' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.top_employers.map((emp: any, i: number) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #DCE1D5' }}>
                                            <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{emp.employer}</td>
                                            <td style={{ padding: '12px 14px', fontSize: 13, color: '#3E5449' }}>{emp.role_type}</td>
                                            <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{emp.placed}</td>
                                            <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: emp.avg_score >= 80 ? '#2A7A52' : emp.avg_score >= 65 ? '#B98A2E' : '#3E5449' }}>
                                                {emp.avg_score}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06), 0 6px 20px rgba(21,42,34,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #DCE1D5' }}>
                        <div>
                            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 16.5, fontWeight: 600, margin: 0 }}>Recent Activity</h2>
                            <div style={{ fontSize: 12, color: '#3E5449', marginTop: 2 }}>Latest activity across the cohort</div>
                        </div>
                    </div>
                    <div style={{ padding: '6px 20px 20px', maxHeight: 350, overflowY: 'auto' }}>
                        {!data?.recent_activity || data.recent_activity.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#3E5449', fontSize: 13 }}>No recent activity.</div>
                        ) : (
                            data.recent_activity.map((act: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < data.recent_activity.length - 1 ? '1px solid #DCE1D5' : 'none' }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E4EEE7', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyStyle: 'center', flexShrink: 0, fontWeight: 'bold' }}>
                                        ★
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{act.title}</div>
                                        <div style={{ fontSize: 12, color: '#3E5449', marginTop: 2 }}>{act.desc}</div>
                                        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#3E5449', marginTop: 5 }}>
                                            {new Date(act.time).toLocaleDateString()} {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Cohorts table */}
            <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #DCE1D5' }}>
                    <div>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 16.5, fontWeight: 600, margin: 0 }}>Recent Cohorts</h2>
                        <div style={{ fontSize: 12, color: '#3E5449', marginTop: 2 }}>Active programmes and placement progress</div>
                    </div>
                    <Link href={`/institutions/${institutionId}/cohorts`}
                        style={{ color: '#1F4D3D', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View all <ArrowUpRight size={14} />
                    </Link>
                </div>
                <div style={{ padding: 20 }}>
                    {data?.cohorts?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3E5449', fontSize: 13 }}>
                            No cohorts yet. <Link href={`/institutions/${institutionId}/onboarding`} style={{ color: '#1F4D3D', fontWeight: 600 }}>Upload your first roster →</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                            {data?.cohorts?.map((c: any) => (
                                <div key={c.id} style={{ border: '1px solid #DCE1D5', borderRadius: 10, padding: 18, background: '#FAFBF7' }}>
                                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: '#B98A2E', fontWeight: 700 }}>{c.academic_level || 'Cohort'}</div>
                                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, margin: '6px 0 4px' }}>{c.name}</h3>
                                    <div style={{ fontSize: 12, color: '#3E5449', marginBottom: 14 }}>{c.programme || 'General'} · {new Date(c.created_at).getFullYear()}</div>
                                    <div style={{ height: 6, background: '#EFE9D8', borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
                                        <div style={{ height: '100%', background: '#1F4D3D', width: `${c.total_candidates > 0 ? Math.round((parseInt(c.placed || 0) / parseInt(c.total_candidates)) * 100) : 0}%`, borderRadius: 10 }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#3E5449' }}>
                                        <span>{c.total_candidates || 0} enrolled</span>
                                        <span>{c.placed || 0} placed</span>
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
