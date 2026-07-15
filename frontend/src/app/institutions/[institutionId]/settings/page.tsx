'use client'

import { useEffect, useState, use } from 'react'
import { useInstitution } from '../layout'
import { INST, authHeaders } from '../theme'
import {
  pageWrap, pageTitle, pageSub, eyebrow, card, btnPrimary, btnGhost, labelStyle, inputStyle,
} from '../ui'
import { ImageUpload } from '@/components/ui/image-upload'

type Tab =
  | 'profile'
  | 'contact'
  | 'departments'
  | 'access'
  | 'notifications'
  | 'reports'
  | 'privacy'
  | 'agreement'
  | 'security'

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Institution Profile' },
  { id: 'contact', label: 'Named Contact' },
  { id: 'departments', label: 'Departments' },
  { id: 'access', label: 'Student Access' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'reports', label: 'Report Schedule' },
  { id: 'privacy', label: 'Data & Privacy' },
  { id: 'agreement', label: 'Partnership Agreement' },
  { id: 'security', label: 'Password & Security' },
]

const DEFAULT_DEPTS = ['ICT', 'Engineering', 'Business', 'Hospitality', 'Beauty']

function prefsKey(id: string) {
  return `institution_prefs_${id}`
}

export default function SettingsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const { institutionId } = use(params)
  const { token, institution, user, setInstitution, setUser } = useInstitution()
  const [tab, setTab] = useState<Tab>('profile')
  const [msg, setMsg] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    contact_email: '',
    phone: '',
    website: '',
    location: 'Kenya',
    accreditation: 'TVETA, TVET-CDACC',
    brand_accent_hex: '#2563EB',
    logo_url: '',
  })

  const [contact, setContact] = useState({
    name: '',
    title: 'Career Services Lead',
    email: '',
    phone: '',
  })

  const [departments, setDepartments] = useState(DEFAULT_DEPTS.map((d) => ({ name: d, sub_contact: '' })))
  const [newDept, setNewDept] = useState('')
  const [selfRegister, setSelfRegister] = useState(true)
  const [manualApprove, setManualApprove] = useState(false)

  const [notif, setNotif] = useState({
    email: true,
    sms: false,
    inapp: true,
    student_registered: true,
    student_matched: true,
    student_contacted: true,
    placement_confirmed: true,
    quarterly_report: true,
  })

  const [reportSchedule, setReportSchedule] = useState<'begin' | 'end' | 'both'>('end')

  useEffect(() => {
    setProfile((p) => ({
      ...p,
      name: institution?.name || '',
      contact_email: user?.email || '',
      logo_url: institution?.logo_url || '',
    }))
    setContact((c) => ({
      ...c,
      name: user?.name || '',
      email: user?.email || '',
    }))
    try {
      const raw = localStorage.getItem(prefsKey(institutionId))
      if (raw) {
        const prefs = JSON.parse(raw)
        if (prefs.contact) setContact(prefs.contact)
        if (prefs.departments) setDepartments(prefs.departments)
        if (prefs.profile) {
          setProfile((p) => ({
            ...p,
            ...prefs.profile,
            name: institution?.name || prefs.profile.name || p.name,
            logo_url: institution?.logo_url || prefs.profile.logo_url || p.logo_url,
          }))
        }
        if (typeof prefs.selfRegister === 'boolean') setSelfRegister(prefs.selfRegister)
        if (typeof prefs.manualApprove === 'boolean') setManualApprove(prefs.manualApprove)
        if (prefs.notif) setNotif(prefs.notif)
        if (prefs.reportSchedule) setReportSchedule(prefs.reportSchedule)
      }
    } catch { /* ignore */ }
  }, [institution, user, institutionId])

  const savePrefs = (patch: Record<string, unknown>) => {
    const current = (() => {
      try { return JSON.parse(localStorage.getItem(prefsKey(institutionId)) || '{}') } catch { return {} }
    })()
    const next = {
      ...current,
      profile,
      contact,
      departments,
      selfRegister,
      manualApprove,
      notif,
      reportSchedule,
      ...patch,
    }
    localStorage.setItem(prefsKey(institutionId), JSON.stringify(next))
  }

  const saveProfile = async () => {
    if (!token) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/settings`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({
          name: profile.name,
          contact_email: profile.contact_email,
          brand_accent_hex: profile.brand_accent_hex,
          logo_url: profile.logo_url || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')
      const nextInst = {
        ...institution,
        name: json.name || profile.name,
        id: institutionId,
        slug: institution?.slug || '',
        logo_url: json.logo_url ?? profile.logo_url ?? null,
      }
      localStorage.setItem('institution_data', JSON.stringify(nextInst))
      setInstitution(nextInst)
      savePrefs({ profile })
      setMsg('Institution profile saved.')
    } catch (e: any) {
      setMsg(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const saveContact = async () => {
    if (!token) return
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch(`/api/institutions/${institutionId}/settings`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({
          admin_name: contact.name.trim() || null,
          contact_email: contact.email.trim() || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Failed to save contact')
      const nextUser = { ...(user || { id: '', email: contact.email }), name: contact.name, email: contact.email || user?.email || '' }
      localStorage.setItem('institution_user', JSON.stringify(nextUser))
      setUser(nextUser)
      savePrefs({ contact })
      setMsg('Named contact saved.')
    } catch (e: any) {
      setMsg(e.message || 'Failed to save contact')
    } finally {
      setSaving(false)
    }
  }

  const sectionTitle = (t: string) => (
    <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: INST.ink }}>{t}</h2>
  )

  return (
    <div style={pageWrap}>
      <p style={eyebrow}>Settings</p>
      <h1 style={pageTitle}>Manage your partnership</h1>
      <p style={pageSub}>Profile, contacts, departments, access, notifications, privacy, and security.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, marginTop: 22 }}>
        <div style={{ ...card, padding: 10, height: 'fit-content' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setMsg(null) }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                padding: '10px 12px', borderRadius: 8, marginBottom: 2, fontSize: 13,
                fontWeight: tab === t.id ? 700 : 500,
                background: tab === t.id ? INST.primaryPale : 'transparent',
                color: tab === t.id ? INST.primary : INST.inkSoft,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={card}>
          {msg && <p style={{ fontSize: 13, color: INST.primaryMid, marginTop: 0 }}>{msg}</p>}

          {tab === 'profile' && (
            <div>
              {sectionTitle('Institution profile')}
              <p style={{ fontSize: 13, color: INST.inkSoft, marginTop: -6, marginBottom: 16 }}>
                What employers see when they look up where a student studied.
              </p>
              <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
                <ImageUpload
                  label="Institution logo"
                  value={profile.logo_url}
                  onChange={(url) => setProfile((p) => ({ ...p, logo_url: url || '' }))}
                  endpoint="/api/upload/profile-image?folder=institution-logos"
                  authToken={token}
                />
                <div>
                  <label style={labelStyle}>Institution name</label>
                  <input style={inputStyle} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Contact email</label>
                  <input style={inputStyle} value={profile.contact_email} onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input style={inputStyle} value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Accreditation bodies</label>
                  <input style={inputStyle} value={profile.accreditation} onChange={(e) => setProfile({ ...profile, accreditation: e.target.value })} />
                </div>
                <button onClick={() => void saveProfile()} disabled={saving} style={btnPrimary}>
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div>
              {sectionTitle('Named contact management')}
              <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input style={inputStyle} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={contact.title} onChange={(e) => setContact({ ...contact, title: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </div>
                <button
                  style={btnPrimary}
                  disabled={saving}
                  onClick={() => void saveContact()}
                >
                  {saving ? 'Saving…' : 'Save contact'}
                </button>
              </div>
            </div>
          )}

          {tab === 'departments' && (
            <div>
              {sectionTitle('Departments')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
                {departments.map((d, i) => (
                  <div key={d.name + i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
                    <input
                      style={inputStyle}
                      value={d.name}
                      onChange={(e) => {
                        const next = [...departments]
                        next[i] = { ...d, name: e.target.value }
                        setDepartments(next)
                      }}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Sub-contact (optional)"
                      value={d.sub_contact}
                      onChange={(e) => {
                        const next = [...departments]
                        next[i] = { ...d, sub_contact: e.target.value }
                        setDepartments(next)
                      }}
                    />
                    <button
                      style={btnGhost}
                      onClick={() => setDepartments(departments.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={inputStyle} placeholder="New department" value={newDept} onChange={(e) => setNewDept(e.target.value)} />
                  <button
                    style={btnGhost}
                    onClick={() => {
                      if (!newDept.trim()) return
                      setDepartments([...departments, { name: newDept.trim(), sub_contact: '' }])
                      setNewDept('')
                    }}
                  >
                    Add
                  </button>
                </div>
                <button style={btnPrimary} onClick={() => { savePrefs({ departments }); setMsg('Departments saved.') }}>
                  Save departments
                </button>
              </div>
            </div>
          )}

          {tab === 'access' && (
            <div>
              {sectionTitle('Student access settings')}
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={selfRegister} onChange={(e) => setSelfRegister(e.target.checked)} />
                <span>
                  <strong>Self-register with partner code</strong>
                  <div style={{ fontSize: 13, color: INST.inkSoft }}>Students can create profiles using your institution code.</div>
                </span>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18, cursor: 'pointer' }}>
                <input type="checkbox" checked={manualApprove} onChange={(e) => setManualApprove(e.target.checked)} />
                <span>
                  <strong>Manual approval before live</strong>
                  <div style={{ fontSize: 13, color: INST.inkSoft }}>Institution must approve each student before their profile goes live.</div>
                </span>
              </label>
              <button
                style={btnPrimary}
                onClick={() => { savePrefs({ selfRegister, manualApprove }); setMsg('Access settings saved.') }}
              >
                Save access settings
              </button>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              {sectionTitle('Notification preferences')}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {(['email', 'sms', 'inapp'] as const).map((k) => (
                  <label key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={notif[k]} onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })} />
                    {k === 'inapp' ? 'In-platform' : k.toUpperCase()}
                  </label>
                ))}
              </div>
              {([
                ['student_registered', 'New student registered'],
                ['student_matched', 'Student matched to employer'],
                ['student_contacted', 'Student contacted by employer'],
                ['placement_confirmed', 'Placement confirmed'],
                ['quarterly_report', 'New quarterly report available'],
              ] as const).map(([k, label]) => (
                <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, fontSize: 13.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={notif[k]} onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })} />
                  {label}
                </label>
              ))}
              <button style={{ ...btnPrimary, marginTop: 8 }} onClick={() => { savePrefs({ notif }); setMsg('Notification preferences saved.') }}>
                Save preferences
              </button>
            </div>
          )}

          {tab === 'reports' && (
            <div>
              {sectionTitle('Report schedule')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {([
                  ['begin', 'Beginning of the quarter'],
                  ['end', 'End of the quarter'],
                  ['both', 'Both'],
                ] as const).map(([v, label]) => (
                  <label key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, cursor: 'pointer' }}>
                    <input type="radio" name="rs" checked={reportSchedule === v} onChange={() => setReportSchedule(v)} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnPrimary} onClick={() => { savePrefs({ reportSchedule }); setMsg('Report schedule saved.') }}>
                  Save schedule
                </button>
                <button style={btnGhost} onClick={() => setMsg('On-demand report requested — check Reports to export now.')}>
                  Request on-demand report
                </button>
              </div>
            </div>
          )}

          {tab === 'privacy' && (
            <div>
              {sectionTitle('Data and privacy')}
              <p style={{ fontSize: 14, color: INST.inkSoft, lineHeight: 1.6 }}>
                OptioHire stores student roster fields needed for matching (name, email, department, programme,
                placement status, and employer engagement metadata). Message content between students and employers
                is not shared with the institution.
              </p>
              <ul style={{ fontSize: 14, color: INST.ink, lineHeight: 1.7, paddingLeft: 18 }}>
                <li>View <a href="https://optiohire.com/privacy" style={{ color: INST.primaryMid }}>data protection policy</a></li>
                <li>Request a data audit via Support</li>
                <li>Student data is used for matching, placement reporting, and partnership analytics only</li>
              </ul>
              <button style={{ ...btnPrimary, marginTop: 8 }} onClick={() => setMsg('Data audit request noted — open Support to follow up with our team.')}>
                Request data audit
              </button>
            </div>
          )}

          {tab === 'agreement' && (
            <div>
              {sectionTitle('Partnership agreement')}
              <div style={{
                padding: 16, borderRadius: 12, border: `1px dashed ${INST.line}`, background: INST.paper, marginBottom: 14,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{institution?.name || 'Institution'} × OptioHire</div>
                <div style={{ fontSize: 13, color: INST.inkSoft }}>Digital partnership agreement on file. Renewals and amendments are managed here.</div>
              </div>
              <button style={btnGhost} onClick={() => setMsg('Agreement PDF will be emailed to your named contact.')}>
                Download signed copy
              </button>
            </div>
          )}

          {tab === 'security' && (
            <div>
              {sectionTitle('Password and security')}
              <p style={{ fontSize: 13, color: INST.inkSoft, marginBottom: 14 }}>
                Signed in as <strong>{user?.email}</strong>. Password changes go through the OptioHire account reset flow.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 420 }}>
                <a href="/auth/forgot-password" style={{ ...btnPrimary, textAlign: 'center', textDecoration: 'none' }}>
                  Change password
                </a>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                  <input type="checkbox" defaultChecked={false} /> Enable two-factor authentication (coming soon)
                </label>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>Login activity</h3>
              <div style={{ fontSize: 13, color: INST.inkSoft }}>
                Last sign-in: this session · {typeof window !== 'undefined' ? window.location.hostname : 'institutions.optiohire.com'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
