'use client'

import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Inbox,
  ScanLine,
  Scale,
  ListChecks,
  CalendarClock,
  Trophy,
  ShieldCheck,
  Zap,
  Eye,
  Building2,
  Users,
  UserCheck,
  Quote,
  GraduationCap,
  Rocket,
  LifeBuoy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import FeaturedJobs from '@/components/landing/featured-jobs'
import { InstitutionApplyDialog } from '@/components/landing/institution-apply-dialog'

/* ---------- flat design tokens ---------- */

const CARD = 'rounded-3xl border border-white/10 bg-white/[0.04]'
const CARD_HOVER = 'transition-colors hover:border-white/20 hover:bg-white/[0.07]'
const ACCENT = 'text-[#8ea6cf]' // single muted-blue accent, no gradients

/* ---------- shared helpers ---------- */

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
  duration = 60,
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
    // Steady linear count-up over `duration` seconds, driven by rAF.
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

/* ---------- 1. Hero ---------- */

function Hero() {
  return (
    <section className="relative px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Reveal>
          <Eyebrow>
            Hiring platform · Built in Africa
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-7 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            Hiring isn&apos;t broken by a lack of talent.
            <span className="mt-2 block text-[#8ea6cf]">It&apos;s missing the engine.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-400 sm:text-xl">
            OptioHire receives applications, screens CVs, scores candidates fairly, and hands your team
            interview-ready shortlists — all on one transparent, end-to-end platform.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-2xl bg-white px-7 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
              <Link href="/auth/options?mode=signup">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/15 bg-transparent px-7 py-6 text-base font-medium text-white hover:bg-white/5">
              <Link href="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 text-sm text-slate-500">
            Trusted by modern recruitment teams · Faster, fairer hiring · Full decision audit trail
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- 2. Stat counters ---------- */

const STATS = [
  { value: 12000, suffix: '+', label: 'Applications screened' },
  { value: 48, suffix: 'h', label: 'Avg. time to shortlist' },
  { value: 3, suffix: 'x', label: 'Faster hiring cycles' },
  { value: 100, suffix: '%', label: 'Decision audit trail' },
]

function Stats() {
  return (
    <section className="relative px-4 py-14 sm:px-6">
      <div className={`mx-auto max-w-6xl ${CARD} p-8 sm:p-10`}>
        <Reveal className="mb-8 text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>The platform, by the numbers</p>
        </Reveal>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <div className="text-4xl font-extrabold text-white sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 3. The stakes ---------- */

const STAKES = [
  { stat: '300+', label: 'CVs per open role — too many to read fairly' },
  { stat: '4 days', label: 'Manual shortlisting for a single position' },
  { stat: '75%', label: 'Candidates never hear back at all' },
  { stat: '<1%', label: 'Get any actionable feedback' },
]

function Stakes() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c98d8d]">The stakes</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
            Great hires are lost in the pile — every single week.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            The volume of applications has outgrown the humans meant to review them. The cost is measured in
            missed talent, slow cycles, and frustrated candidates.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAKES.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className={`h-full ${CARD} p-6`}>
                <p className="text-3xl font-extrabold text-white sm:text-4xl">{s.stat}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 4. Why the old way fails ---------- */

const OLD_WAYS = [
  { title: 'Manual CV screening', points: ['Hours lost per role', 'Inconsistent judgement', 'Fatigue = bias'] },
  { title: 'Generic ATS tools', points: ['Keyword box-ticking', 'No real evaluation', 'Candidates ghosted'] },
  { title: 'Spreadsheets & inboxes', points: ['No single source of truth', 'Lost applications', 'Zero audit trail'] },
]

function WhyOldWayFails() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>Why the old way fails</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
            The tools exist. A system that actually decides doesn&apos;t.
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {OLD_WAYS.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <div className={`h-full ${CARD} p-7`}>
                <h3 className="text-xl font-bold text-white">{w.title}</h3>
                <ul className="mt-5 space-y-3">
                  {w.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-slate-400">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#c98d8d]/40 text-xs text-[#c98d8d]">✕</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-2xl font-semibold text-white sm:text-3xl">
            You don&apos;t need another inbox. You need a <span className={ACCENT}>system</span>.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- 5. Process chain ---------- */

const STEPS = [
  { icon: Inbox, title: 'Ingest', desc: 'Applications arrive by email or portal — captured automatically.' },
  { icon: ScanLine, title: 'Parse', desc: 'CVs are read and structured into clean, comparable data.' },
  { icon: Scale, title: 'Score', desc: 'Every candidate is evaluated against the same role criteria.' },
  { icon: ListChecks, title: 'Shortlist', desc: 'Interview-ready rankings with transparent reasoning.' },
  { icon: CalendarClock, title: 'Interview', desc: 'Schedule and message candidates from one place.' },
  { icon: Trophy, title: 'Hire', desc: 'Decide with confidence — and a full audit trail.' },
]

function ProcessChain() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-14 max-w-3xl text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>The engine</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">One chain — from application to hire.</h2>
          <p className="mt-4 text-lg text-slate-400">
            Six steps that turn a flooded inbox into a fair, fast, defensible hiring decision.
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className={`group h-full ${CARD} ${CARD_HOVER} p-7`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-widest text-slate-600">0{i + 1}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-[#8ea6cf]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-400">{s.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- 6 & 7. Audience sections ---------- */

type AudienceProps = {
  eyebrow: string
  badgeClass: string
  title: string
  description: string
  bullets: { icon: typeof ShieldCheck; title: string; desc: string }[]
  ctaLabel: string
  ctaHref: string
  reverse?: boolean
}

function AudienceSection({ eyebrow, badgeClass, title, description, bullets, ctaLabel, ctaHref, reverse }: AudienceProps) {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className={`grid items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          <Reveal>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-slate-400">{description}</p>
            <Button asChild size="lg" className="mt-8 gap-2 rounded-2xl bg-white px-7 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
              <Link href={ctaHref}>
                {ctaLabel} <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {bullets.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.title} className={`${CARD} p-5`}>
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${badgeClass}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-white">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{b.desc}</p>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ---------- 8b. Enterprises & Institutions ---------- */

const ENTERPRISE_BULLETS = [
  { icon: Building2, title: 'Built for scale', desc: 'One scorecard and audit trail across every department and role.' },
  { icon: GraduationCap, title: 'Institutions & cohorts', desc: 'Onboard universities and manage student cohorts end-to-end.' },
  { icon: Rocket, title: 'Guided onboarding', desc: 'We set you up and coordinate every step with your team.' },
  { icon: LifeBuoy, title: 'Dedicated support', desc: 'A partner who tailors the platform to your hiring workflow.' },
]

function EnterpriseInstitutions() {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className={`${CARD} p-8 sm:p-12`}>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>For enterprises & institutions</p>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                Ready to scale hiring across your organization?
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                Apply now and our team will onboard you, coordinate setup, and take you through everything —
                from a tailored walkthrough to going live with your teams and cohorts.
              </p>
              <div className="mt-8">
                <InstitutionApplyDialog>
                  <Button size="lg" className="gap-2 rounded-2xl bg-white px-7 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
                    Apply now <ArrowRight className="h-5 w-5" />
                  </Button>
                </InstitutionApplyDialog>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid gap-4 sm:grid-cols-2">
                {ENTERPRISE_BULLETS.map((b) => {
                  const Icon = b.icon
                  return (
                    <div key={b.title} className={`${CARD} p-5`}>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b2842] text-[#9bb4de]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-base font-bold text-white">{b.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{b.desc}</p>
                    </div>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- 9. Values ---------- */

const VALUES = [
  { letter: 'F', icon: Scale, title: 'Fairness', desc: 'Every candidate is judged on the same criteria — structure over gut feel.' },
  { letter: 'S', icon: Zap, title: 'Speed', desc: 'Shortlists in hours, not weeks. Momentum wins the best people.' },
  { letter: 'T', icon: Eye, title: 'Transparency', desc: 'Clear reasoning and a full audit trail behind every decision.' },
]

function Values() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>Why we exist</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
            Close the gap between a CV and real capability.
          </h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => {
            const Icon = v.icon
            return (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className={`h-full ${CARD} p-8`}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl font-black text-[#8ea6cf]">
                      {v.letter}
                    </span>
                    <Icon className="h-6 w-6 text-slate-500" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{v.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-400">{v.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- 10. Testimonials ---------- */

const TESTIMONIALS = [
  {
    quote:
      'We went from four days of CV marathons to a ranked shortlist the same morning. Our hiring managers finally trust the process.',
    name: 'Amina K.',
    role: 'Head of People, Scaling SME',
  },
  {
    quote:
      'The audit trail alone is worth it. When a candidate asks why, we have a clear, consistent answer every time.',
    name: 'David M.',
    role: 'Talent Lead, High-growth Startup',
  },
  {
    quote:
      'As a candidate I actually knew where I stood. Applied once, tracked everything, got real feedback. Rare.',
    name: 'Brian O.',
    role: 'Software Engineer',
  },
]

function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>Real journeys</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">From stuck to hired — step by step.</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className={`flex h-full flex-col ${CARD} p-7`}>
                <Quote className="h-8 w-8 text-[#8ea6cf]/50" />
                <p className="mt-4 flex-1 text-slate-300">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.08] text-sm font-bold text-white">
                    {t.name.split(' ').map((w) => w[0]).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- 11. Where you fit ---------- */

const FITS = [
  { icon: Building2, title: 'Employers & HR', desc: 'Screen, score and shortlist with confidence.', href: '/auth/options?mode=signup' },
  { icon: UserCheck, title: 'Recruiters', desc: 'Fill roles faster with ranked, evidence-based pipelines.', href: '/auth/options?mode=signup' },
  { icon: Users, title: 'Job Seekers', desc: 'Apply once, track everything, get real feedback.', href: 'https://applications.optiohire.com/auth/signup' },
  { icon: ShieldCheck, title: 'Enterprises', desc: 'One scorecard and audit trail across every department.', apply: true },
]

function WhereYouFit() {
  return (
    <section className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${ACCENT}`}>One platform, every path</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">Where do you fit in?</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FITS.map((f, i) => {
            const Icon = f.icon
            const cardBody = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-[#8ea6cf]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                <span className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${ACCENT} transition-transform group-hover:translate-x-1`}>
                  {f.apply ? 'Apply now' : 'Explore'} <ArrowRight className="h-4 w-4" />
                </span>
              </>
            )
            return (
              <Reveal key={f.title} delay={i * 0.06}>
                {f.apply ? (
                  <InstitutionApplyDialog>
                    <button type="button" className={`group flex h-full w-full flex-col text-left ${CARD} ${CARD_HOVER} p-7`}>
                      {cardBody}
                    </button>
                  </InstitutionApplyDialog>
                ) : (
                  <Link href={f.href!} className={`group flex h-full flex-col ${CARD} ${CARD_HOVER} p-7`}>
                    {cardBody}
                  </Link>
                )}
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------- 12. Final CTA ---------- */

function FinalCta() {
  return (
    <section className="px-4 pb-24 pt-10 sm:px-6">
      <div className={`mx-auto max-w-6xl ${CARD} p-10 text-center sm:p-16`}>
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold text-white sm:text-5xl">
            The future of hiring is being built right now.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Screen smarter, decide fairer, and hire faster — all in one place.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-2xl bg-white px-8 py-6 text-base font-semibold text-slate-900 hover:bg-slate-200">
              <Link href="/auth/options?mode=signup">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-white/15 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/5">
              <Link href="/demo">Request a demo</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ---------- Page ---------- */

export default function LandingPage() {
  return (
    <div className="relative bg-[#0f1729] text-slate-100">
      <Hero />
      <Stats />
      <Stakes />
      <WhyOldWayFails />
      <ProcessChain />
      <AudienceSection
        eyebrow="For employers & HR teams"
        badgeClass="bg-[#1b2842] text-[#9bb4de]"
        title="Stop screening CVs manually. Start hiring confidently."
        description="Cut through hundreds of applicants fairly and fast, with a clear audit trail your stakeholders can trust."
        ctaLabel="Start hiring"
        ctaHref="/auth/options?mode=signup"
        bullets={[
          { icon: Zap, title: '3x faster shortlisting', desc: 'From stacked inboxes to interview-ready lists.' },
          { icon: Scale, title: 'Bias-aware scoring', desc: 'The same criteria for every candidate.' },
          { icon: ShieldCheck, title: 'Full audit trail', desc: 'Answer any decision with confidence.' },
          { icon: Trophy, title: 'Milestone insights', desc: 'Know when a role hits key applicant counts.' },
        ]}
      />
      <AudienceSection
        eyebrow="For job seekers"
        badgeClass="bg-[#17302a] text-[#8fceb3]"
        title="Stop guessing. Start landing the right roles."
        description="Cut through the noise, stand out on merit, and track every application with full transparency."
        ctaLabel="Find your next role"
        ctaHref="https://applications.optiohire.com/auth/signup"
        reverse
        bullets={[
          { icon: Zap, title: '1-click applications', desc: 'Apply with one unified profile.' },
          { icon: Eye, title: 'Real-time tracking', desc: 'Never guess where you stand.' },
          { icon: Scale, title: 'Judged on merit', desc: 'Structured evaluation beyond the CV.' },
          { icon: CalendarClock, title: 'Direct interviews', desc: 'Schedule and message in one place.' },
        ]}
      />
      <EnterpriseInstitutions />
      <FeaturedJobs />
      <Values />
      <Testimonials />
      <WhereYouFit />
      <FinalCta />
    </div>
  )
}
