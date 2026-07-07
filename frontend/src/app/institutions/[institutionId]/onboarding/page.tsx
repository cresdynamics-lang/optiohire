'use client'

import { useState, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, ChevronRight, ChevronLeft, Send, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface CsvRow {
    [key: string]: string
}

interface MappedCandidate {
    candidate_name: string
    email: string
    student_id?: string
    department?: string
    phone?: string
    raw_row: CsvRow
}

type Step = 1 | 2 | 3 | 4

const OPTIOHIRE_FIELDS = [
    { key: 'email', label: 'Email address', required: true },
    { key: 'full_name', label: 'Candidate name', required: true },
    { key: 'student_id', label: 'Student ID', required: false },
    { key: 'department', label: 'Department / Programme', required: false },
    { key: 'phone', label: 'Phone number', required: false },
    { key: 'grad_year', label: 'Expected graduation year', required: false },
]

export default function BulkOnboardingPage({ params }: { params: Promise<{ institutionId: string }> }) {
    const { institutionId } = use(params)
    const router = useRouter()
    const fileRef = useRef<HTMLInputElement>(null)
    const [step, setStep] = useState<Step>(1)
    const [cohortName, setCohortName] = useState('')
    const [academicLevel, setAcademicLevel] = useState('')
    const [placementTracks, setPlacementTracks] = useState<string[]>([])
    const [csvHeaders, setCsvHeaders] = useState<string[]>([])
    const [csvRows, setCsvRows] = useState<CsvRow[]>([])
    const [filename, setFilename] = useState('')
    const [mapping, setMapping] = useState<Record<string, string>>({})
    const [validated, setValidated] = useState<{ valid: MappedCandidate[]; flagged: any[]; duplicates: number }>({ valid: [], flagged: [], duplicates: 0 })
    const [sending, setSending] = useState(false)
    const [sendingStage, setSendingStage] = useState('')
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const token = typeof window !== 'undefined' ? localStorage.getItem('institution_token') : null

    // ─── Robust CSV Parsing ──────────────────────────────────────────

    const parseCSV = (text: string): { headers: string[]; rows: CsvRow[] } => {
        const lines: string[][] = []
        let row: string[] = []
        let inQuotes = false
        let entry = ''

        for (let i = 0; i < text.length; i++) {
            const char = text[i]
            const nextChar = text[i + 1]

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    entry += '"'
                    i++ // Skip next quote
                } else {
                    inQuotes = !inQuotes
                }
            } else if (char === ',' && !inQuotes) {
                row.push(entry.trim())
                entry = ''
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    i++ // Skip \n
                }
                row.push(entry.trim())
                if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
                    lines.push(row)
                }
                row = []
                entry = ''
            } else {
                entry += char
            }
        }
        if (entry || row.length > 0) {
            row.push(entry.trim())
            lines.push(row)
        }

        if (lines.length === 0) return { headers: [], rows: [] }
        const headers = lines[0].map(h => h.replace(/^"|"$/g, '').trim())
        const rows = lines.slice(1).map(line => {
            const r: CsvRow = {}
            headers.forEach((h, idx) => {
                r[h] = (line[idx] || '').replace(/^"|"$/g, '').trim()
            })
            return r
        })
        return { headers, rows }
    }

    const processCSVText = (text: string) => {
        try {
            const { headers, rows } = parseCSV(text)
            if (headers.length === 0 || rows.length === 0) {
                setError('The file appears to be empty or invalid.')
                return
            }
            setCsvHeaders(headers)
            setCsvRows(rows)
            // Auto-map based on common field names
            const autoMap: Record<string, string> = {}
            OPTIOHIRE_FIELDS.forEach(field => {
                const match = headers.find(h => h.toLowerCase().includes(field.key.replace('full_', '').replace('_', '')) || h.toLowerCase() === field.key)
                if (match) autoMap[field.key] = match
            })
            setMapping(autoMap)
            setStep(2)
        } catch (err) {
            setError('Failed to parse file.')
        }
    }

    const handleFile = (file: File) => {
        setError(null)
        setFilename(file.name)
        const ext = file.name.split('.').pop()?.toLowerCase()
        
        if (ext === 'xlsx' || ext === 'xls') {
            const reader = new FileReader()
            reader.onload = e => {
                try {
                    const data = e.target!.result
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const csvContent = XLSX.utils.sheet_to_csv(worksheet)
                    processCSVText(csvContent)
                } catch (err) {
                    setError('Failed to parse Excel file.')
                }
            }
            reader.readAsArrayBuffer(file)
            return
        }

        const reader = new FileReader()
        reader.onload = e => {
            processCSVText(e.target!.result as string)
        }
        reader.readAsText(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) { handleFile(file) }
    }

    // ─── Validation (step 2 → 3) ─────────────────────────────────

    const runValidation = () => {
        const emailKey = mapping.email
        const nameKey = mapping.full_name
        if (!emailKey || !nameKey) { setError('Please map the Email and Name columns'); return }
        setError(null)

        const valid: MappedCandidate[] = []
        const flagged: any[] = []
        const seen = new Set<string>()
        let dups = 0

        csvRows.forEach(row => {
            const email = (row[emailKey] || '').toLowerCase().trim()
            const name = (row[nameKey] || '').trim()
            if (!email || !email.includes('@')) { flagged.push({ ...row, _reason: 'Missing or invalid email' }); return }
            if (!name) { flagged.push({ ...row, _reason: 'Missing name' }); return }
            if (seen.has(email)) { dups++; return }
            seen.add(email)
            valid.push({
                candidate_name: name,
                email,
                student_id: row[mapping.student_id || ''] || undefined,
                department: row[mapping.department || ''] || undefined,
                phone: row[mapping.phone || ''] || undefined,
                raw_row: row
            })
        })

        setValidated({ valid, flagged, duplicates: dups })
        setStep(3)
    }

    // ─── Commit (step 4) ─────────────────────────────────────────

    const handleCommit = async () => {
        if (!token) return
        setSending(true)
        setError(null)
        
        try {
            setSendingStage('1. Creating graduating cohort...')
            const cohortRes = await fetch(`/api/institutions/${institutionId}/cohorts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: cohortName || 'New Cohort', academic_level: academicLevel, placement_tracks: placementTracks })
            })
            const cohortData = await cohortRes.json()
            if (!cohortRes.ok) { setError(cohortData.error || 'Failed to create cohort'); setSending(false); return }

            const cohortId = cohortData.id

            setSendingStage('2. Enrolling candidates & preparing email queue...')
            const commitRes = await fetch(`/api/institutions/${institutionId}/cohorts/${cohortId}/commit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ valid: validated.valid, filename })
            })

            if (!commitRes.ok) {
                const d = await commitRes.json()
                setError(d.error || 'Failed to commit candidates')
            } else {
                setSendingStage('3. Onboarding invitations sent successfully!')
                setSent(true)
            }
        } catch {
            setError('A network error occurred. Please try again.')
        } finally {
            setSending(false)
            setSendingStage('')
        }
    }

    const toggleTrack = (t: string) => setPlacementTracks(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

    const StepIndicator = () => (
        <div style={{ display: 'flex', padding: '0 20px', marginTop: 2 }}>
            {(['Upload list', 'Map fields', 'Review', 'Send invitations'] as const).map((label, i) => {
                const n = (i + 1) as Step
                const done = step > n
                const active = step === n
                return (
                    <button key={n} onClick={() => n < step && setStep(n)}
                        style={{ flex: 1, textAlign: 'left', padding: '16px 16px 16px 0', position: 'relative', border: 'none', background: 'none', cursor: n < step ? 'pointer' : 'default' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                width: 26, height: 26, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'IBM Plex Mono, monospace', fontSize: 11.5,
                                border: `1.6px solid ${active || done ? '#1F4D3D' : '#DCE1D5'}`,
                                background: active ? '#1F4D3D' : done ? '#E4EEE7' : 'transparent',
                                color: active ? '#fff' : done ? '#1F4D3D' : '#3E5449'
                            }}>
                                {done ? '✓' : n}
                            </span>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? '#152A22' : '#3E5449' }}>{label}</span>
                        </span>
                        <span style={{ position: 'absolute', bottom: 0, left: 0, right: 16, height: 2, background: active || done ? '#1F4D3D' : '#DCE1D5', display: 'block' }} />
                    </button>
                )
            })}
        </div>
    )

    return (
        <div style={{ padding: '26px 34px 60px', maxWidth: 1240, fontFamily: 'Inter, sans-serif', color: '#152A22' }}>
            <div style={{ marginBottom: 26 }}>
                <div style={{ fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', color: '#B98A2E', fontWeight: 600, marginBottom: 4 }}>Bulk Onboarding</div>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>Bring a new cohort into OptioHire</h1>
                <p style={{ color: '#3E5449', fontSize: 13.5, marginTop: 4, maxWidth: 520 }}>Upload your student list once. Everyone gets an account, an email, and a place in the pipeline — automatically.</p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, boxShadow: '0 1px 2px rgba(21,42,34,0.06), 0 6px 20px rgba(21,42,34,0.06)' }}>
                <StepIndicator />

                {/* ── Step 1: Cohort details + Upload ── */}
                {step === 1 && (
                    <div style={{ padding: 20 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3E5449', marginBottom: 6 }}>Cohort name *</label>
                                <input value={cohortName} onChange={e => setCohortName(e.target.value)} placeholder="2026 · Informatics & Business IT"
                                    style={{ width: '100%', border: '1px solid #DCE1D5', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', background: '#F3F5EF' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3E5449', marginBottom: 6 }}>Academic level</label>
                                <select value={academicLevel} onChange={e => setAcademicLevel(e.target.value)}
                                    style={{ width: '100%', border: '1px solid #DCE1D5', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', background: '#F3F5EF' }}>
                                    <option value="">Select level</option>
                                    <option value="certificate">Certificate</option>
                                    <option value="diploma">Diploma</option>
                                    <option value="degree">Degree</option>
                                    <option value="postgraduate">Postgraduate</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3E5449', marginBottom: 6 }}>Placement tracks</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['internship', 'attachment', 'job_ready'].map(t => (
                                        <button key={t} onClick={() => toggleTrack(t)} style={{
                                            border: `1px solid ${placementTracks.includes(t) ? '#1F4D3D' : '#DCE1D5'}`,
                                            background: placementTracks.includes(t) ? '#E4EEE7' : '#fff',
                                            color: placementTracks.includes(t) ? '#1F4D3D' : '#3E5449',
                                            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            {t.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ background: '#F5E3DE', border: '1px solid #e8c8c0', borderRadius: 8, color: '#9C3B2C', padding: '12px 16px', fontSize: 13, marginBottom: 20 }}>
                                ⚠ {error}
                            </div>
                        )}

                        <div
                            onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                            style={{ border: '2px dashed #DCE1D5', borderRadius: 12, padding: '44px 24px', textAlign: 'center', background: '#F3F5EF', cursor: 'pointer' }}
                            onClick={() => fileRef.current?.click()}
                        >
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#E4EEE7', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                <Upload size={22} />
                            </div>
                            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, margin: '0 0 6px' }}>Drag your student list here</h3>
                            <p style={{ fontSize: 12.5, color: '#3E5449', margin: '0 0 16px' }}>CSV or Excel format containing name, email, student ID, department, etc. Up to 5,000 rows.</p>
                            <button style={{ background: '#1F4D3D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Choose CSV / Excel file
                            </button>
                            {filename && <div style={{ marginTop: 12, fontSize: 12, color: '#1F4D3D', fontWeight: 600 }}>📄 {filename}</div>}
                            <div style={{ marginTop: 12, fontSize: 11.5, color: '#3E5449' }}>or paste from Google Sheets · <span style={{ color: '#1F4D3D', fontWeight: 600, cursor: 'pointer' }}>download our template</span></div>
                        </div>
                        <input ref={fileRef} type="file" accept=".csv, .xlsx, .xls" style={{ display: 'none' }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) { handleFile(f) } }} />
                    </div>
                )}

                {/* ── Step 2: Field mapping ── */}
                {step === 2 && (
                    <div style={{ padding: 20 }}>
                        <div style={{ marginBottom: 14, fontSize: 13, color: '#3E5449' }}>
                            <strong>{filename}</strong> — {csvRows.length} rows detected. Match each column to an OptioHire field.
                        </div>
                        {OPTIOHIRE_FIELDS.map(field => (
                            <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: 10, alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #DCE1D5' }}>
                                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, background: '#EFE9D8', padding: '6px 10px', borderRadius: 6 }}>
                                    {field.label} {field.required ? <span style={{ color: '#9C3B2C' }}>*</span> : ''}
                                </div>
                                <div style={{ textAlign: 'center', color: '#3E5449' }}>→</div>
                                <select value={mapping[field.key] || ''} onChange={e => setMapping(m => ({ ...m, [field.key]: e.target.value }))}
                                    style={{ width: '100%', border: '1px solid #DCE1D5', borderRadius: 6, padding: '7px 8px', fontSize: 12.5 }}>
                                    <option value="">— skip —</option>
                                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        ))}
                        {error && <div style={{ color: '#9C3B2C', fontSize: 13, marginTop: 12 }}>{error}</div>}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                            <button onClick={() => setStep(1)} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Back</button>
                            <button onClick={runValidation} style={{ background: '#1F4D3D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Continue to review
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Review ── */}
                {step === 3 && (
                    <div style={{ padding: 20 }}>
                        {[
                            ['Institution', 'Loaded from your account'],
                            ['Cohort name', cohortName || 'Unnamed Cohort'],
                            ['Rows detected', csvRows.length.toString()],
                            ['Valid entries', validated.valid.length.toString()],
                            ['Duplicate entries removed', validated.duplicates.toString()],
                            ['Flagged for manual check', validated.flagged.length > 0 ? `${validated.flagged.length} (missing data)` : '0'],
                        ].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyStyle: 'space-between', padding: '9px 0', borderBottom: '1px solid #DCE1D5', fontSize: 13 }}>
                                <div style={{ color: '#3E5449' }}>{k}</div>
                                <div style={{ fontWeight: 600, color: k === 'Flagged for manual check' && validated.flagged.length > 0 ? '#9C3B2C' : '#152A22' }}>{v}</div>
                            </div>
                        ))}

                        {validated.valid.length > 0 && (
                            <div style={{ marginTop: 16, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>{['Name', 'Student ID', 'Department', 'Email'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.06em', color: '#3E5449', fontWeight: 600, padding: '10px 14px', borderBottom: '1px solid #DCE1D5' }}>{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {validated.valid.slice(0, 4).map((r, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13 }}>{r.candidate_name}</td>
                                                <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13, fontFamily: 'IBM Plex Mono, monospace' }}>{r.student_id || '—'}</td>
                                                <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13 }}>{r.department || '—'}</td>
                                                <td style={{ padding: '12px 14px', borderBottom: '1px solid #DCE1D5', fontSize: 13 }}>{r.email}</td>
                                            </tr>
                                        ))}
                                        {validated.valid.length > 4 && (
                                            <tr><td colSpan={4} style={{ padding: '12px 14px', color: '#3E5449', textAlign: 'center', fontSize: 13 }}>+ {validated.valid.length - 4} more rows</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                            <button onClick={() => setStep(2)} style={{ border: '1px solid #DCE1D5', background: '#fff', padding: '9px 15px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Back</button>
                            <button onClick={() => setStep(4)} style={{ background: '#1F4D3D', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Looks good — continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Send ── */}
                {step === 4 && (
                    <div style={{ padding: 20 }}>
                        {sent ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E4EEE7', color: '#1F4D3D', display: 'flex', alignItems: 'center', justifyStyle: 'center', margin: '0 auto 16px', fontSize: 28, fontWeight: 'bold' }}>✓</div>
                                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, margin: '0 0 8px' }}>Invitations queued!</h3>
                                <p style={{ color: '#3E5449', fontSize: 13 }}>{validated.valid.length} students have been enrolled, and onboarding emails are being dispatched in the background.</p>
                                <button onClick={() => router.push(`/institutions/${institutionId}/roster`)}
                                    style={{ marginTop: 20, background: '#1F4D3D', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                    View Roster →
                                </button>
                            </div>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                                    <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 19, margin: '0 0 8px' }}>Ready to onboard {validated.valid.length} students</h3>
                                    <p style={{ color: '#3E5449', fontSize: 13, maxWidth: 480, margin: '0 auto' }}>
                                        Each student receives a personal onboarding email inviting them to activate their OptioHire account, complete their profile, and upload their CV.
                                    </p>
                                </div>

                                <div style={{ background: '#F3F5EF', border: '1px solid #DCE1D5', borderRadius: 10, padding: '16px 20px', maxWidth: 520, margin: '0 auto 20px' }}>
                                    <div style={{ marginBottom: 10 }}>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: '#3E5449', display: 'block', marginBottom: 6 }}>Email subject line</label>
                                        <input defaultValue={`Your ${localStorage.getItem('institution_data') ? JSON.parse(localStorage.getItem('institution_data') || '{}').name : 'University'} Career Profile is ready — activate on OptioHire`}
                                            style={{ width: '100%', border: '1px solid #DCE1D5', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif', background: '#fff' }} />
                                    </div>
                                </div>

                                {error && <div style={{ color: '#9C3B2C', textAlign: 'center', fontSize: 13, marginBottom: 12 }}>{error}</div>}

                                {sending && (
                                    <div style={{ maxWidth: 520, margin: '0 auto 24px', textAlign: 'center', padding: '10px 0' }}>
                                        <Loader2 className="animate-spin" size={32} style={{ color: '#1F4D3D', margin: '0 auto 12px' }} />
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#152A22' }}>{sendingStage}</div>
                                        <div style={{ fontSize: 12, color: '#3E5449', marginTop: 4 }}>Please do not close this window while processing.</div>
                                    </div>
                                )}

                                {!sending && (
                                    <div style={{ textAlign: 'center' }}>
                                        <button onClick={handleCommit}
                                            style={{ background: '#B98A2E', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                            <Send size={16} />
                                            Send {validated.valid.length} invitations
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
