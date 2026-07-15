'use client'

import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Inbox,
  ScanLine,
  CalendarClock,
  Scale,
  Eye,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InstitutionApplyDialog } from '@/components/landing/institution-apply-dialog'

const CARD = 'rounded-3xl border border-white/10 bg-white/[0.04]'
const CARD_HOVER = 'transition-colors hover:border-white/20 hover:bg-white/[0.07]'
const ACCENT = 'text-[#8ea6cf]'

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${ACCENT}`}>
      {children}
    </span>
  )
}

function Counter({
  value,
  prefix = '',
  suffix = '',
  duration = 10,
}: {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const shouldReduceMotion = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (shouldReduceMotion) {
      setN(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const totalMs = duration * 1000
    const tick = (now: number) => {
      const progress = Math.min((now - start) / totalMs, 1)
      setN(Math.round(progress * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, shouldReduceMotion])

  return (
    <span ref={ref} className="tabular-nums text-white">
      {prefix}
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

const STATS = [
  { value: 3, suffix: 'x', label: 'Faster shortlisting', desc: 'Even for high-volume roles' },
  { value: 95, suffix: '%', label: 'Found in first pass', desc: 'Without manual CV marathons' },
  { value: 100, suffix: '%', label: 'Zero spreadsheet chaos', desc: 'No WhatsApp threads or email chains' },
]

const STEPS = [
  {
    num: '01',
    icon: Inbox,
    title: 'Create job + collect applications',
    desc: 'HR creates a job listing with role requirements and company details. Candidates apply through your configured channel, and every application lands in one pipeline for the right role.',
    bullets: ['Role requirements captured clearly', 'Applications routed to the correct job', 'Centralized candidate pipeline'],
  },
  {
    num: '02',
    icon: ScanLine,
    title: 'AI screening + fair ranking',
    desc: 'Each application is analyzed against your job requirements and scored with transparent reasoning. Candidates are categorized — shortlist, flagged, or reject — using the same criteria every time.',
    bullets: ['Requirement-based scoring', 'Reasoning visible to HR', 'Consistent evaluation across all candidates'],
  },
  {
    num: '03',
    icon: CalendarClock,
    title: 'Updates + interview scheduling',
    desc: 'OptioHire sends outcome emails automatically. HR schedules interviews for shortlisted candidates from the dashboard and sends invites with meeting links — all with a full decision trail.',
    bullets: ['Automated shortlist/rejection communication', 'One-click interview scheduling', 'Full decision trail for internal review'],
  },
]

const TEAM_FEATURES = [
  {
    icon: Users,
    title: 'Candidate overview',
    desc: 'View all candidates per job with status, score, and reasoning in one list. Quickly identify who to review, shortlist, or pass on.',
    bullets: ['Match percentage for each candidate', 'Key skills and experience highlights', 'Red flags and concerns (if any)', 'Clear shortlist / flagged / reject status'],
  },
  {
    icon: Target,
    title: 'Decision support',
    desc: 'Move faster with structured recommendations and direct actions. Schedule interviews from shortlisted candidates and keep communication professional.',
    bullets: ['Ranked candidate recommendations', 'Detailed scoring breakdown', 'Interview scheduling actions', 'Outcome communication history'],
  },
]

const CANDIDATE_EXPERIENCE = [
  { icon: Scale, title: 'Fair assessment', desc: 'Every candidate is evaluated using the same transparent criteria, regardless of background.' },
  { icon: Eye, title: 'Clear communication', desc: 'Candidates receive clear outcome communication instead of waiting without feedback.' },
  { icon: ShieldCheck, title: 'Respectful process', desc: 'All candidate data is handled with care, maintaining privacy and professional standards.' },
]

const RESULTS = [
  { value: 3, suffix: 'x', label: 'Faster hiring process' },
  { value: 40, suffix: '%', label: 'Better hire quality' },
  { value: 60, suffix: '%', label: 'Less time wasted' },
]

export default function HowItWorksContent() {
  return (
    <div className="relative min-h-screen bg-[#0f1729] text-slate-100">
      {/* Hero */}
      <section className="relative px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-24">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:mt-6 sm:text-5xl md:text-6xl">
              From 300 applications
              <span className="mt-2 block text-[#8ea6cf]">to your top 5.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 sm:mt-6 sm:text-xl">
              OptioHire is built for HR managers and hiring managers. Create a job, receive applications in one
              pipeline, get fair AI-assisted screening, and move shortlisted candidates to interviews faster.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-relaxed text-slate-500 sm:mt-4">
              Every step is transparent and traceable — so your team can explain hiring decisions with confidence
              and maintain a professional candidate experience.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
              <Button asChild size="lg" className="gap-2 rounded-2xl bg-white px-7 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
                <a href="#process">
                  See the workflow <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/15 bg-transparent px-7 py-6 text-base font-medium text-white hover:bg-white/5">
                <Link href="/auth/options?mode=signup">Start free trial</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-6 sm:px-6 sm:pb-8">
        <div className={`mx-auto max-w-5xl ${CARD} p-6 sm:p-8`}>
          <div className="grid gap-6 sm:grid-cols-3">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06} className="text-center">
                <div className="text-3xl font-extrabold sm:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm font-semibold text-white">{s.label}</p>
                <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3-step process */}
      <section id="process" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>The process</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">The OptioHire workflow</h2>
            <p className="mt-4 text-lg text-slate-400">
              A practical, end-to-end flow for real recruiting teams: post roles, process applications, screen
              fairly, and schedule interviews from one place.
            </p>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <Reveal key={step.title} delay={i * 0.08}>
                  <div className={`h-full ${CARD} ${CARD_HOVER} p-7`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold tracking-widest text-slate-600">{step.num}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-[#8ea6cf]">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-400">{step.desc}</p>
                    <ul className="mt-5 space-y-2">
                      {step.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-slate-400">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8ea6cf]" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* What teams see */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-3xl text-center">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>For your team</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">What teams see</h2>
            <p className="mt-4 text-lg text-slate-400">
              A clean workspace for HR and hiring managers to track every candidate from first application to final interview.
            </p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {TEAM_FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className={`h-full ${CARD} p-8`}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-[#8ea6cf]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-xl font-bold text-white">{f.title}</h3>
                    </div>
                    <p className="mt-4 leading-relaxed text-slate-400">{f.desc}</p>
                    <ul className="mt-5 space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="text-sm text-slate-500">• {b}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Candidate experience */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-3xl text-center">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>For candidates</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">What candidates experience</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {CANDIDATE_EXPERIENCE.map((c, i) => {
              const Icon = c.icon
              return (
                <Reveal key={c.title} delay={i * 0.06}>
                  <div className={`h-full ${CARD} p-7 text-center`}>
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-[#8ea6cf]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-white">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-10 text-center">
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>Outcomes</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Real results, real teams</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {RESULTS.map((r, i) => (
              <Reveal key={r.label} delay={i * 0.06}>
                <div className={`${CARD} p-6 text-center`}>
                  <div className="text-3xl font-extrabold sm:text-4xl">
                    <Counter value={r.value} suffix={r.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{r.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.15} className="mt-8">
            <div className={`${CARD} p-8 text-center`}>
              <p className="text-lg text-slate-300">We publish only validated customer evidence.</p>
              <p className="mt-2 text-sm text-slate-500">
                Case studies and verified client testimonials will appear here as soon as they are approved for publication.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 pt-8 sm:px-6">
        <div className={`mx-auto max-w-6xl ${CARD} p-10 text-center sm:p-16`}>
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold text-white sm:text-5xl">
              Ready to experience better hiring?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
              Replace scattered hiring steps with one professional workflow your HR team can trust — from job post to
              interview scheduling.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2 rounded-2xl bg-white px-8 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
                <Link href="/auth/options?mode=signup">
                  Start free trial <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/15 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/5">
                <Link href="/demo">Request a demo</Link>
              </Button>
              <InstitutionApplyDialog>
                <Button variant="outline" size="lg" className="rounded-2xl border-white/15 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/5">
                  Apply as enterprise
                </Button>
              </InstitutionApplyDialog>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
