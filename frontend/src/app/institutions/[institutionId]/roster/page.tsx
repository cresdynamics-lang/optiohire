'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Download, RefreshCw } from 'lucide-react'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    enrolled: { bg: '#F1F1EA', color: '#7A7A6E' },
    invited: { bg: '#E1EBF0', color: '#3E6C8E' },
    activated: { bg: '#E3F1E9', color: '#2A7A52' },
    shortlisted: { bg: '#F5EAD2', color: '#B98A2E' },
    interviewing: { bg: '#EDE6F5', color: '#6B4FA0' },
    placed: { bg: '#E4EEE7', color: '#1F4D3D' },
    interning: { bg: '#DCF0F2', color: '#1E7E8C' },
    pool: { bg: '#EEEEE6', color: '#3E5449' },
    requires_review: { bg: '#F5E3DE', color: '#9C3B2C' },
}

const FILTERS = ['all', 'activated', 'shortlisted', 'interviewing', 'placed', 'interning', 'invited', 'requires_review'] as const

export default function RosterPage({ params }: { params: Promise<{ institutionId: string }> }) {
    const { institutionId } = use(params)
    const router = useRouter()
    const [candidates, setCandidates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [cohorts, setCohorts] = useState<any[]>([])
    const [selectedCohort, setSelectedCohort] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [search, setSearch] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

    const token = typeof window !== 'undefined' ? localStorage.getItem('institution_token') : null

    useEffect(() => {
        if (!token) { router.replace('/institutions/auth/signin'); return }
        fetch(`/api/institutions/${institutionId}/cohorts`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => {
                if (d.cohorts?.length > 0) {
                    setCohorts(d.cohorts)
                    setSelectedCohort(d.cohorts[0].id)
                }
            })
    }, [institutionId, router, token])

    useEffect(() => {
        if (!selectedCohort || !token) return
        setLoading(true)
        const params = new URLSearchParams({
            page: pagination.page.toString(),
            limit: '50',
            ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
            ...(search ? { search } : {}),
        })
        fetch(`/api/institutions/${institutionId}/cohorts/${selectedCohort}/roster?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => {
            setCandidates(d.candidates || [])
            setPagination(d.pagination || { page: 1, total: 0, pages: 1 })
        }).catch(() => setError('Failed to load roster')).finally(() => setLoading(false))
    }, [institutionId, selectedCohort, statusFilter, search, pagination.page, token])

    const getInitials = (name: string) => (name || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

    const StatusSeal = ({ status }: { status: string }) => {
        const s = STATUS_COLORS[status] || STATUS_COLORS.enrolled
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px 3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '.02em', border: `1.4px dashed ${s.color}`, background: s.bg, color: s.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                {status.replace('_', ' ')}
            </span>
        )
    }

    return (
        <div style={{ padding: '26px 34px 60px', maxWidth: 1240, fontFamily: 'Inter, sans-serif', color: '#152A22' }}>
            {/* Topbar */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, gap: 20, flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: '#B98A2E', fontWeight: 600, marginBottom: 4 }}>
                        {cohorts.find(c => c.id === selectedCohort)?.name || 'Cohort'}
                    </div>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, margin: 0 }}>Candidate Roster</h1>
                    <p style={{ color: '#3E5449', fontSize: 13.5, marginTop: 4 }}>All students from this cohort and where each one stands in the pipeline.</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {cohorts.length > 1 && (
                        <select value={selectedCohort} onChange={e => setSelectedCohort(e.target.value)}
                            style={{ border: '1px solid #DCE1D5', background: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#152A22' }}>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                        <Download size={14} /> Export CSV
                    </button>
                    <button style={{ background: '#1F4D3D', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        Resend invites to inactive
                    </button>
                </div>
            </div>

            {error && <div style={{ color: '#9C3B2C', marginBottom: 16 }}>{error}</div>}

            <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06)' }}>
                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '14px 20px', borderBottom: '1px solid #DCE1D5' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3E5449' }} />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, student ID or department…"
                            style={{ width: '100%', border: '1px solid #DCE1D5', borderRadius: 8, padding: '8px 12px 8px 34px', fontSize: 13, background: '#F3F5EF', fontFamily: 'inherit' }}
                        />
                    </div>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)} style={{
                            border: `1px solid ${statusFilter === f ? '#2F6B54' : '#DCE1D5'}`,
                            background: statusFilter === f ? '#E4EEE7' : '#fff',
                            color: statusFilter === f ? '#1F4D3D' : '#3E5449',
                            borderRadius: 20, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}>
                            {f === 'all' ? `All (${pagination.total})` : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#3E5449', fontSize: 13 }}>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                        Loading roster…
                    </div>
                ) : candidates.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#3E5449', fontSize: 13 }}>
                        No candidates found. {selectedCohort && <a href={`/institutions/${institutionId}/onboarding`} style={{ color: '#1F4D3D', fontWeight: 600 }}>Upload a roster →</a>}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Candidate', 'Department', 'Status', 'Matched to', 'Match score', 'Last activity', ''].map(h => (
                                    <th key={h} style={{ textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: '#3E5449', fontWeight: 600, padding: '10px 14px', borderBottom: '1px solid #DCE1D5' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map(c => (
                                <tr key={c.id} style={{ transition: 'background .1s' }} onMouseEnter={e => (e.currentTarget.style.background = '#FAFBF7')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13, verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#E4EEE7', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                                {getInitials(c.candidate_name || '')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{c.candidate_name || c.email}</div>
                                                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#3E5449' }}>{c.student_id || c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13, verticalAlign: 'middle' }}>{c.department || '—'}</td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', verticalAlign: 'middle' }}><StatusSeal status={c.row_status} /></td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13, color: '#3E5449', verticalAlign: 'middle' }}>{c.matched_to || '—'}</td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13, verticalAlign: 'middle' }}>
                                        {c.match_score ? (
                                            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: c.match_score >= 80 ? '#2A7A52' : c.match_score >= 65 ? '#B98A2E' : '#3E5449' }}>
                                                {c.match_score}%
                                            </span>
                                        ) : <span style={{ color: '#3E5449' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 12, color: '#3E5449', verticalAlign: 'middle' }}>
                                        {c.last_activity ? new Date(c.last_activity).toLocaleDateString() : c.row_status === 'invited' ? "Hasn't opened invite" : '—'}
                                    </td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button style={{ border: '1px solid #DCE1D5', background: '#fff', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>👁</button>
                                            <button style={{ border: '1px solid #DCE1D5', background: '#fff', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✉</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#3E5449' }}>Showing {candidates.length} of {pagination.total} students</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? .5 : 1 }}>Prev</button>
                            <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.pages ? .5 : 1 }}>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
