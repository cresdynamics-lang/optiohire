'use client'

import { useState, useEffect } from 'react'

/* ─── tiny sub-components ──────────────────────────────────────────────── */

function LiveDot() {
  return (
    <span className="oh-live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#15a36b]" />
  )
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: color }}
    >
      {initials}
    </span>
  )
}

function Badge({ label, variant }: { label: string; variant: 'blue' | 'green' | 'red' }) {
  const cls = {
    blue: 'bg-[#ddeeff] text-[#1246a0]',
    green: 'bg-[#d4f5e6] text-[#0a6640]',
    red: 'bg-[#fde8e8] text-[#a32d2d]',
  }[variant]
  return (
    <span className={`${cls} shrink-0 rounded-full px-[7px] py-0.5 text-[10px] font-bold`}>
      {label}
    </span>
  )
}

function StatusPill({ label, variant }: { label: string; variant: 'review' | 'short' | 'interview' | 'rej' }) {
  const cls = {
    review: 'bg-[#fff8e0] text-[#7a5a00]',
    short: 'bg-[#d4f5e6] text-[#0a6640]',
    interview: 'bg-[#ddeeff] text-[#1246a0]',
    rej: 'bg-[#fde8e8] text-[#a32d2d]',
  }[variant]
  return (
    <span className={`${cls} rounded-full px-[9px] py-[3px] text-[10px] font-bold`}>{label}</span>
  )
}

function ProgBar({ pct, color }: { pct: string; color: string }) {
  return (
    <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-[#eee]">
      <div
        className="oh-prog h-full rounded-full"
        style={{ '--prog-w': pct, background: color } as React.CSSProperties}
      />
    </div>
  )
}

/* ─── HR panel ─────────────────────────────────────────────────────────── */
const CANDIDATES = [
  { id: 'c1', initials: 'AK', color: '#3b3bba', name: 'Amara Konte',     role: 'UX Lead · 6 yrs',          badge: '92%', bv: 'blue' as const,  cls: 'oh-cand-row' },
  { id: 'c2', initials: 'PO', color: '#7a3bba', name: 'Peter Odhiambo', role: 'Product Designer · 4 yrs',  badge: '88%', bv: 'blue' as const,  cls: 'oh-cand-row' },
  { id: 'c3', initials: 'ZN', color: '#15a36b', name: 'Zara Njoroge',   role: 'Sr. Designer · 7 yrs',     badge: '97%', bv: 'green' as const, cls: 'oh-cand-row oh-cand-perfect', perfect: true },
  { id: 'r1', initials: 'TM', color: '#c0a0a0', name: 'Tom Mwangi',     role: 'Junior Design · 1 yr',     badge: '41%', bv: 'red' as const,   cls: 'oh-cand-row oh-cand-rej', rej: true },
  { id: 'r2', initials: 'LK', color: '#b0a0c0', name: 'Lisa Kamau',     role: 'Graphic Art · 2 yrs',      badge: '36%', bv: 'red' as const,   cls: 'oh-cand-row oh-cand-rej', rej: true },
]

function HRPanel() {
  const [scheduled, setScheduled] = useState(false)
  return (
    <div>
      {/* KPI grid */}
      <div className="mb-2.5 grid grid-cols-2 gap-2">
        {[
          { label: 'Shortlisted', val: '5',   sub: 'of 48 applicants', color: '#0a6640' },
          { label: 'Avg Score',   val: '84%',  sub: 'this role',         color: '#1a1a2e' },
          { label: 'Rejected',    val: '43',   sub: 'auto-screened out', color: '#a32d2d' },
          { label: 'Time to Fill',val: '4d',   sub: 'avg this month',    color: '#1a1a2e' },
        ].map((k) => (
          <div key={k.label} className="rounded-[10px] border border-[#eee] bg-white px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[.05em] text-[#888]">{k.label}</p>
            <p className="mt-0.5 text-[22px] font-bold leading-none" style={{ color: k.color }}>{k.val}</p>
            <p className="mt-0.5 text-[10px] text-[#888]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Live feed label */}
      <p className="oh-live-lbl mb-2 flex items-center text-[10px] font-bold uppercase tracking-[.07em] text-[#15a36b]">
        <LiveDot />Live feed · Senior Product Designer
      </p>

      {/* Notification */}
      <div className="oh-notif mb-2 flex items-start gap-2 rounded-[9px] border border-[#c7ceff] bg-[#eef2ff] px-3 py-2">
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] bg-[#3b3bba]">
          <svg viewBox="0 0 13 13" fill="none" stroke="white" strokeWidth="1.5" className="h-[13px] w-[13px]">
            <rect x="1" y="2.5" width="11" height="8.5" rx="1.5" />
            <path d="M1 4L6.5 7.5 12 4" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-semibold text-[#2a2a7a]">5 candidates shortlisted ✦</p>
          <p className="mt-0.5 text-[10.5px] text-[#555]">AI screening completed · just now</p>
        </div>
      </div>

      {/* Candidates */}
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.07em] text-[#888]">Candidates</p>
      {CANDIDATES.map((c, i) => (
        <div
          key={c.id}
          className={`${c.cls} mb-1.5 flex items-center gap-2 rounded-[8px] border px-2 py-2`}
          style={{ animationDelay: `${0.35 + i * 0.18}s` }}
        >
          <Avatar initials={c.initials} color={c.color} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold text-[#1a1a2e]">{c.name}</p>
            <p className="truncate text-[10.5px] text-[#888]">{c.role}</p>
          </div>
          {c.perfect && (
            <span className="shrink-0 rounded-full bg-[#15a36b] px-[6px] py-0.5 text-[9.5px] font-bold text-white">
              Perfect match
            </span>
          )}
          {c.rej && (
            <span className="shrink-0 rounded-full bg-[#f0a0a0] px-[6px] py-0.5 text-[9.5px] font-bold text-[#7a1a1a]">
              Rejected
            </span>
          )}
          <Badge label={c.badge} variant={c.bv} />
        </div>
      ))}

      {/* Schedule button */}
      <div className="oh-sched-wrap mt-2">
        <button
          onClick={() => setScheduled(true)}
          className={`flex w-full items-center justify-center gap-1.5 rounded-[8px] px-3 py-2.5 text-[12px] font-semibold text-white transition-colors ${scheduled ? 'bg-[#15a36b]' : 'bg-[#1a1a2e] hover:bg-[#2e2e6e]'}`}
        >
          {!scheduled ? (
            <>
              <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-[13px] w-[13px]">
                <rect x="1" y="2" width="11" height="10" rx="1.5" />
                <path d="M3.5 1v1.5M9.5 1v1.5M1 5h11" />
              </svg>
              Schedule interview · Zara
            </>
          ) : '✓ Confirmed!'}
        </button>
        {scheduled && (
          <p className="mt-1.5 text-center text-[11px] font-semibold text-[#15a36b]">
            ✓ Confirmed — Thu 29 May, 10:00 AM
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Student panel ─────────────────────────────────────────────────────── */
const APPS = [
  { id:'a1', logo:'OH', logoBg:'#3b3bba', co:'OptioHire',   role:'Product Design Intern', status:'Interview',    sv:'interview' as const, pct:'80%',  pc:'#3b3bba' },
  { id:'a2', logo:'GR', logoBg:'#15a36b', co:'GreenRoute',  role:'UX Research Intern',    status:'Shortlisted',  sv:'short'     as const, pct:'60%',  pc:'#15a36b' },
  { id:'a3', logo:'NK', logoBg:'#c07020', co:'NovakTech',   role:'UI Designer',           status:'In Review',    sv:'review'    as const, pct:'35%',  pc:'#c07020' },
  { id:'a4', logo:'FX', logoBg:'#a03030', co:'FlexCorp',    role:'Visual Designer',       status:'Not selected', sv:'rej'       as const, pct:'100%', pc:'#e24b4a' },
]

function StudentPanel() {
  return (
    <div>
      <p className="oh-live-lbl mb-2 flex items-center text-[10px] font-bold uppercase tracking-[.07em] text-[#15a36b]">
        <LiveDot />Your applications
      </p>
      {APPS.map((a, i) => (
        <div
          key={a.id}
          className="oh-app-card mb-2 rounded-[10px] border border-[#eee] bg-white p-3"
          style={{ animationDelay: `${0.2 + i * 0.2}s` }}
        >
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[9px] font-bold text-white"
              style={{ background: a.logoBg }}
            >
              {a.logo}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#1a1a2e]">{a.co}</p>
              <p className="text-[10.5px] text-[#888]">{a.role}</p>
            </div>
            <StatusPill label={a.status} variant={a.sv} />
          </div>
          <ProgBar pct={a.pct} color={a.pc} />
        </div>
      ))}
      {/* AI tip */}
      <div className="oh-match-tip mt-1 rounded-[9px] border border-[#b0e5cc] bg-[#f0faf6] px-3 py-2.5">
        <p className="text-[11px] font-bold text-[#0a6640]">✦ AI Match Tip</p>
        <p className="mt-0.5 text-[11px] text-[#2a5a3a]">
          Add a portfolio link to boost your GreenRoute score from 78% → 91%
        </p>
      </div>
    </div>
  )
}

/* ─── Main card ─────────────────────────────────────────────────────────── */
export default function HeroDashboard() {
  const [tab, setTab] = useState<'hr' | 'student'>('hr')
  const [animKey, setAnimKey] = useState(0)

  // Loop animations continuously every 6 seconds (includes a short pause)
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimKey((prev) => prev + 1)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div key={animKey} className="oh-dashboard-card w-full rounded-[14px] bg-white p-4 shadow-[0_2px_20px_rgba(0,0,0,.07)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#3b3bba] text-[11px] font-bold text-white">
          OH
        </span>
        <div>
          <p className="text-[14px] font-semibold text-[#1a1a2e]">OptioHire</p>
          <p className="text-[11px] text-[#888]">Smarter recruitment operations</p>
        </div>
      </div>

      {/* Tab row */}
      <div className="mb-3 flex gap-1.5">
        {(['hr', 'student'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
              tab === t
                ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                : 'border-[#ddd] bg-white text-[#888] hover:border-[#999]'
            }`}
          >
            {t === 'hr' ? '🏢 HR View' : '🎓 Student View'}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'hr' ? <HRPanel /> : <StudentPanel />}
    </div>
  )
}
