'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Download, RefreshCw, X, Eye, Mail } from 'lucide-react'

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
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
    const [resending, setResending] = useState(false)
    
    // Candidate details modal state
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null)

    const token = typeof window !== 'undefined' ? localStorage.getItem('institution_token') : null

    // Search Debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPagination(p => ({ ...p, page: 1 }))
        }, 400)
        return () => clearTimeout(timer)
    }, [search])

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
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
        })
        fetch(`/api/institutions/${institutionId}/cohorts/${selectedCohort}/roster?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => {
            setCandidates(d.candidates || [])
            setPagination(d.pagination || { page: 1, total: 0, pages: 1 })
        }).catch(() => setError('Failed to load roster')).finally(() => setLoading(false))
    }, [institutionId, selectedCohort, statusFilter, debouncedSearch, pagination.page, token])

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

    const handleExportCSV = async () => {
        if (!selectedCohort || !token) return
        try {
            const res = await fetch(`/api/institutions/${institutionId}/cohorts/${selectedCohort}/roster?all=true`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const d = await res.json()
            const list = d.candidates || []
            if (list.length === 0) { alert('No candidates to export.'); return }

            const headers = ['Name', 'Email', 'Student ID', 'Department', 'Phone', 'Status', 'Match Score', 'Matched To', 'Last Activity']
            const csvRows = [
                headers.join(','),
                ...list.map((c: any) => [
                    `"${c.candidate_name || ''}"`,
                    `"${c.email || ''}"`,
                    `"${c.student_id || ''}"`,
                    `"${c.department || ''}"`,
                    `"${c.phone || ''}"`,
                    `"${c.row_status || ''}"`,
                    c.match_score || '',
                    `"${c.matched_to || ''}"`,
                    c.last_activity ? new Date(c.last_activity).toLocaleDateString() : ''
                ].join(','))
            ]
            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n")
            const encodedUri = encodeURI(csvContent)
            const link = document.createElement("a")
            link.setAttribute("href", encodedUri)
            link.setAttribute("download", `roster_${cohorts.find(c => c.id === selectedCohort)?.name || 'cohort'}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch {
            alert('Failed to export CSV.')
        }
    }

    const handleResendInvites = async () => {
        if (!selectedCohort || !token) return
        if (!confirm('Are you sure you want to resend onboarding emails to all pending/inactive candidates in this cohort?')) return
        setResending(true)
        try {
            const res = await fetch(`/api/institutions/${institutionId}/cohorts/${selectedCohort}/resend-invites`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            alert(data.message || 'Invitations resent.')
        } catch {
            alert('Failed to resend invitations.')
        } finally {
            setResending(false)
        }
    }

    const handleResendSingle = async (candidateId: string, email: string) => {
        if (!selectedCohort || !token) return
        if (!confirm(`Resend invitation email to ${email}?`)) return
        try {
            const res = await fetch(`/api/institutions/${institutionId}/cohorts/${selectedCohort}/roster/${candidateId}/resend-invite`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            alert(data.message || 'Invitation resent.')
        } catch {
            alert('Failed to resend invitation.')
        }
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
                        <select value={selectedCohort} onChange={e => { setSelectedCohort(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
                            style={{ border: '1px solid #DCE1D5', background: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontWeight: 600, color: '#152A22' }}>
                            {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                    <button 
                        onClick={handleExportCSV}
                        style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                    >
                        <Download size={14} /> Export CSV
                    </button>
                    <button 
                        onClick={handleResendInvites}
                        disabled={resending}
                        style={{ background: '#1F4D3D', color: '#fff', border: 'none', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? .7 : 1 }}
                    >
                        {resending ? 'Resending...' : 'Resend invites to inactive'}
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
                        <button key={f} onClick={() => { setStatusFilter(f); setPagination(p => ({ ...p, page: 1 })) }} style={{
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
                        <RefreshCw size={20} className="animate-spin" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
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
                                                {Math.round(c.match_score)}%
                                            </span>
                                        ) : <span style={{ color: '#3E5449' }}>—</span>}
                                    </td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 12, color: '#3E5449', verticalAlign: 'middle' }}>
                                        {c.last_activity ? new Date(c.last_activity).toLocaleDateString() : c.row_status === 'invited' ? "Hasn't opened invite" : '—'}
                                    </td>
                                    <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button 
                                                onClick={() => setSelectedCandidate(c)}
                                                style={{ border: '1px solid #DCE1D5', background: '#fff', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="View Details"
                                            >
                                                <Eye size={14} style={{ color: '#3E5449' }} />
                                            </button>
                                            <button 
                                                onClick={() => handleResendSingle(c.id, c.email)}
                                                style={{ border: '1px solid #DCE1D5', background: '#fff', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                title="Resend Invite"
                                            >
                                                <Mail size={14} style={{ color: '#3E5449' }} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div style={{ padding: '14px 20px', display: 'flex', justifyStyle: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#3E5449' }}>Showing {candidates.length} of {pagination.total} students</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? .5 : 1 }}>Prev</button>
                            <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.pages ? .5 : 1 }}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            {selectedCandidate && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: 16 }}>
                    <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {/* Modal Header */}
                        <div style={{ background: '#1F4D3D', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, margin: 0 }}>Student Profile Details</h3>
                            <button onClick={() => setSelectedCandidate(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, borderBottom: '1px solid #DCE1D5', paddingBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E4EEE7', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                                    {getInitials(selectedCandidate.candidate_name || '')}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{selectedCandidate.candidate_name}</h4>
                                    <span style={{ fontSize: 12, color: '#3E5449' }}>{selectedCandidate.email}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Student ID</span>
                                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{selectedCandidate.student_id || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Department</span>
                                    <span style={{ fontWeight: 600 }}>{selectedCandidate.department || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Phone</span>
                                    <span style={{ fontWeight: 600 }}>{selectedCandidate.phone || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Funnel Status</span>
                                    <StatusSeal status={selectedCandidate.row_status} />
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Matched Role</span>
                                    <span style={{ fontWeight: 600 }}>{selectedCandidate.matched_to || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Match Score</span>
                                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>{selectedCandidate.match_score ? `${Math.round(selectedCandidate.match_score)}%` : '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyStyle: 'space-between', fontSize: 13, borderBottom: '1px solid #F3F5EF', paddingBottom: 6 }}>
                                    <span style={{ color: '#3E5449', fontWeight: 500 }}>Last Activity</span>
                                    <span style={{ fontWeight: 600 }}>{selectedCandidate.last_activity ? new Date(selectedCandidate.last_activity).toLocaleString() : '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ background: '#F3F5EF', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button onClick={() => setSelectedCandidate(null)} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
