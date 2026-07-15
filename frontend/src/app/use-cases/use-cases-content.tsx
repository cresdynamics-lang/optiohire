'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { type ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SCENARIOS = [
  {
    id: 'startups',
    label: '01',
    title: 'High-growth startups',
    lead: 'Hiring your first twenty people should not feel like a gamble.',
    challenge: 'Lean teams cannot spend days sorting CVs when every hire changes the company.',
    help: 'OptioHire turns applications into a ranked shortlist with a clear role-fit score - so you interview the right five, not the loudest twenty.',
    outcomes: ['Shorter shortlist cycles', 'Higher confidence in final interviews', 'Hiring records you can defend'],
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Startup team collaborating around a table',
  },
  {
    id: 'smes',
    label: '02',
    title: 'Scaling SMEs',
    lead: 'Nairobi, Mombasa, Kisumu - one hiring standard across every city.',
    challenge: 'Different managers use different barometers, and quality drifts between teams.',
    help: 'One shared scorecard and process for every vacancy keeps feedback aligned and decisions consistent.',
    outcomes: ['Consistent candidate quality', 'Aligned interviewer feedback', 'Faster cross-site decisions'],
    image:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Managers reviewing work together in an office',
  },
  {
    id: 'enterprise',
    label: '03',
    title: 'Enterprise HR',
    lead: 'Ten departments. One scorecard. One source of truth.',
    challenge: 'Fragmented recruiter workflows hide risk and slow final recommendations.',
    help: 'Centralized review, reporting, and recommendation tracking give leadership a single auditable trail.',
    outcomes: ['Cross-department consistency', 'Auditable decision history', 'Lower process risk'],
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Modern corporate office interior',
  },
  {
    id: 'ngos',
    label: '04',
    title: 'NGOs & development orgs',
    lead: 'Donor-funded roles need fair, documented selection - without slowing the panel.',
    challenge: 'Funding stakeholders expect traceable, bias-aware decisions you can show, not just claim.',
    help: 'Structured scoring and full audit trails make fairness evidence, not a side note in the minutes.',
    outcomes: ['Documented fairness', 'Compliance-ready reporting', 'Faster panel alignment'],
    image:
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Community workshop with notebooks and discussion',
  },
]

const SCALE = [
  {
    range: '1–50',
    title: 'Early stage',
    body: 'Quality over volume - focused hires that set culture and momentum.',
  },
  {
    range: '51–500',
    title: 'Growing companies',
    body: 'Repeatable process across multiple open roles without losing judgment.',
  },
  {
    range: '500+',
    title: 'Enterprise',
    body: 'Coordination, analytics, and compliance when many teams hire at once.',
  },
]

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Education',
  'Hospitality',
  'Public sector',
]

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function UseCasesContent() {
  const reduce = useReducedMotion()

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1f2c]">
      {/* Hero - one composition: brand, headline, line, CTA, full-bleed image */}
      <section className="relative isolate min-h-[min(92vh,760px)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=80"
          alt="Modern city workplace skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0c121c]/92 via-[#0c121c]/72 to-[#0c121c]/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(45,45,221,0.28),transparent_55%)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(92vh,760px)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo/optiohire_mark_light.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <p className="font-[family-name:var(--font-display-italic)] text-3xl tracking-tight text-white sm:text-4xl">
                OptioHire
              </p>
            </div>
            <h1 className="mt-6 text-balance font-[family-name:var(--font-display-italic)] text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl">
              Built for how Kenyan teams actually hire
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/75 sm:text-lg">
              Skills-first screening, shared scorecards, and auditable decisions - whether you are filling
              your first roles or coordinating departments nationwide.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-2xl bg-white px-7 py-6 text-base font-semibold text-[#0c121c] hover:bg-white/90"
              >
                <a href="#scenarios">
                  Explore scenarios <ArrowRight className="ml-1 h-5 w-5" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scenarios - one purpose each, editorial not card grid */}
      <section id="scenarios" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">Scenarios</p>
            <h2 className="mt-3 font-[family-name:var(--font-display-italic)] text-3xl text-[#1a1f2c] sm:text-4xl md:text-5xl">
              Find the hire path that matches your team
            </h2>
          </Reveal>

          <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
            {SCENARIOS.map((s, i) => {
              const reverse = i % 2 === 1
              return (
                <Reveal key={s.id} delay={0.05}>
                  <article
                    id={s.id}
                    className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${
                      reverse ? 'lg:[&>*:first-child]:order-2' : ''
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
                      <Image
                        src={s.image}
                        alt={s.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-[#0c121c]/45 to-transparent"
                        aria-hidden
                      />
                      <span className="absolute bottom-4 left-4 font-[family-name:var(--font-display-italic)] text-5xl text-white/90">
                        {s.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-display-italic)] text-2xl text-[#1a1f2c] sm:text-3xl">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-lg leading-relaxed text-[#1a1f2c]/80">{s.lead}</p>
                      <div className="mt-8 space-y-5 border-t border-[#1a1f2c]/10 pt-6 text-sm sm:text-base">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1f2c]/45">
                            The challenge
                          </p>
                          <p className="mt-1.5 leading-relaxed text-[#1a1f2c]/75">{s.challenge}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1a1f2c]/45">
                            How OptioHire helps
                          </p>
                          <p className="mt-1.5 leading-relaxed text-[#1a1f2c]/75">{s.help}</p>
                        </div>
                        <ul className="space-y-2 pt-1">
                          {s.outcomes.map((o) => (
                            <li key={o} className="flex items-start gap-2.5 text-[#1a1f2c]/8">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D2DDD]" aria-hidden />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Scale - one section, no card chrome */}
      <section className="border-y border-[#1a1f2c]/08 bg-white px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">Scale</p>
            <h2 className="mt-3 font-[family-name:var(--font-display-italic)] text-3xl sm:text-4xl">
              The same clarity at every company size
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#1a1f2c]/65 sm:text-lg">
              From your first ten hires to multi-team recruitment - process depth grows with you, without
              rewriting how fair decisions get made.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-10 border-t border-[#1a1f2c]/10 pt-10 md:grid-cols-3 md:gap-8">
            {SCALE.map((item, i) => (
              <Reveal key={item.range} delay={i * 0.06}>
                <p className="font-[family-name:var(--font-display-italic)] text-4xl text-[#2D2DDD] sm:text-5xl">
                  {item.range}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#1a1f2c]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#1a1f2c]/65 sm:text-base">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industries - text list, no fake counters */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">Industries</p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display-italic)] text-3xl sm:text-4xl">
              Role-fit that travels across sectors
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#1a1f2c]/65">
              Scorecards adapt to the job - technical screens for product teams, compliance depth for finance
              and NGOs, volume workflows for retail and hospitality.
            </p>
          </Reveal>
          <motion.ul
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#1a1f2c]/10 pt-8"
          >
            {INDUSTRIES.map((name) => (
              <li
                key={name}
                className="font-[family-name:var(--font-display-italic)] text-xl text-[#1a1f2c]/85 sm:text-2xl"
              >
                {name}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
        <div
          className="absolute inset-0 bg-[#0c121c]"
          aria-hidden
        />
        <div
          className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-[#2D2DDD]/25 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-[family-name:var(--font-display-italic)] text-3xl text-white sm:text-4xl md:text-5xl">
              OptioHire for your next hire
            </p>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              Tell us your scenario - startup first hires, multi-city SMEs, enterprise panels, or
              donor-funded roles - and we will show the workflow that fits.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-2xl bg-white px-8 py-6 text-base font-semibold text-[#0c121c] hover:bg-white/90"
              >
                <Link href="/auth/options?mode=signup">
                  Start free trial <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-2xl border-white/20 bg-transparent px-8 py-6 text-base font-medium text-white hover:bg-white/10"
              >
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
