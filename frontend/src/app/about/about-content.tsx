'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BELIEFS = [
  {
    title: 'Skills over pedigree',
    body: 'Credentials add context — they should not drown out what someone can do on the job.',
  },
  {
    title: 'Fairness is a process',
    body: 'The same scorecard for every applicant. Bias shrinks when rules are written and applied.',
  },
  {
    title: 'Decisions you can explain',
    body: 'Leave every panel able to say why someone advanced — not shrug at a black-box rank.',
  },
  {
    title: 'Built for Kenyan reality',
    body: 'High volumes, multi-city teams, donor audits, lean HR — not Silicon Valley theatre.',
  },
]

const PILLARS = [
  {
    label: '01',
    title: 'Smart screening',
    body: 'One pipeline. Role-fit ranking from skills and readiness — shortlists in hours, not weeks of CV triage.',
  },
  {
    label: '02',
    title: 'Fair evaluation',
    body: 'Structured criteria for every candidate. Interviewers share one language for quality, not gut feel alone.',
  },
  {
    label: '03',
    title: 'Confident decisions',
    body: 'Ranked recommendations, scoring breakdowns, and an audit trail to schedule interviews with clear rationale.',
  },
]

const HR_AUDIENCES = [
  { title: 'Startups', body: 'First critical hires without burning founders on CV piles.', href: '/use-cases#startups' },
  { title: 'Scaling SMEs', body: 'One standard across Nairobi, Mombasa, Kisumu, and beyond.', href: '/use-cases#smes' },
  { title: 'Enterprise HR', body: 'Department scorecards, reporting, and decision history.', href: '/use-cases#enterprise' },
  { title: 'NGOs & development', body: 'Documented, bias-aware selection for panel roles.', href: '/use-cases#ngos' },
]

const CANDIDATE_AUDIENCES = [
  { title: 'Job seekers', body: 'Fair assessment and professional feedback loops.', href: '/jobs' },
  { title: 'Graduates', body: 'Campus-to-career pathways with clear next steps.', href: '/jobs' },
  { title: 'Career switchers', body: 'Skills-first profiles that highlight what you can do.', href: '/candidate/auth/signup' },
]

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-[#f4f5f8] text-[#12162a]">
      {/* Instant hero — solid brand blue, no remote images */}
      <section className="relative isolate overflow-hidden bg-[#2D2DDD]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(255,255,255,0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(15,20,60,0.35), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[min(78vh,620px)] max-w-6xl items-center px-4 py-24 sm:px-6 sm:py-28">
          <div className="about-reveal w-full max-w-xl rounded-3xl border border-white/25 bg-white/10 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8 md:p-10">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo/optiohire_mark_light.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                fetchPriority="high"
              />
              <p className="headline-platform-dark !text-shadow-none text-2xl !font-semibold tracking-tight sm:text-3xl">
                OptioHire
              </p>
            </div>
            <h1 className="headline-platform-dark mt-5 text-3xl !leading-[1.08] sm:text-4xl md:text-5xl">
              Our story starts in Nairobi
            </h1>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
              Skills-first hiring software so African teams can move past CV piles — and choose people who
              can do the work.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-2xl bg-white px-6 py-5 text-sm font-semibold text-[#2D2DDD] hover:bg-white/95 sm:text-base"
              >
                <a href="#story">
                  Read the story <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="story" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl about-reveal">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">Our story</p>
          <h2 className="headline-platform mt-3 text-3xl sm:text-4xl md:text-[2.75rem]">
            Built by Cres Dynamics for how hiring actually happens here
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[#12162a]/75">
            <p>
              OptioHire is the recruitment product of{' '}
              <a
                href="https://cresdynamics.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2D2DDD] underline-offset-2 hover:underline"
              >
                Cres Dynamics
              </a>
              , a Nairobi company building practical AI for African organisations.
            </p>
            <p>
              A role opens, hundreds apply, a small HR team skims CVs at night — then the best candidates
              vanish into the pile. We built OptioHire for high volume, fairness, and decisions that stand
              up to founders, boards, and donors.
            </p>
            <p className="font-medium text-[#12162a]">
              Mission: hire on capability — fairly, quickly, and with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#12162a]/08 bg-white px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="about-reveal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">What we believe</p>
            <h2 className="headline-platform mt-3 text-3xl sm:text-4xl">Principles that shape the product</h2>
          </div>
          <div className="mt-8 grid gap-6 border-t border-[#12162a]/08 pt-8 sm:grid-cols-2">
            {BELIEFS.map((b) => (
              <div key={b.title} className="about-reveal">
                <p className="headline-platform text-xl !leading-snug sm:text-2xl">{b.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#12162a]/65">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl about-reveal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">What we deliver</p>
            <h2 className="headline-platform mt-3 text-3xl sm:text-4xl">
              From application flood to a shortlist you trust
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p) => (
              <article
                key={p.label}
                className="rounded-2xl border border-[#2D2DDD]/10 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(45,45,221,0.35)] about-reveal"
              >
                <span className="headline-platform text-3xl text-[#2D2DDD]/35">{p.label}</span>
                <h3 className="headline-platform mt-3 text-xl !leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#12162a]/7">{p.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-5 border-t border-[#12162a]/08 pt-8 sm:grid-cols-3 about-reveal">
            {[
              { label: 'Faster shortlists', detail: 'Role-fit ranking instead of endless CV tabs' },
              { label: 'Stronger interviews', detail: 'Time spent with people who actually match' },
              { label: 'Auditable process', detail: 'Traceable rationale for panels and compliance' },
            ].map((item) => (
              <div key={item.label}>
                <p className="headline-platform text-lg">{item.label}</p>
                <p className="mt-1 text-sm text-[#12162a]/65">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HR + Candidates */}
      <section className="border-t border-[#12162a]/08 bg-[#eef0f5] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div className="about-reveal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">For HR</p>
            <h2 className="headline-platform mt-3 text-3xl">Hiring teams</h2>
            <p className="mt-2 text-sm text-[#12162a]/65">
              Professional neumorphic surfaces — soft depth, clear hierarchy, built for all-day use.
            </p>
            <div className="mt-6 grid gap-4">
              {HR_AUDIENCES.map((a) => (
                <Link
                  key={a.title}
                  href={a.href}
                  className="neu-hr group block rounded-2xl px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <h3 className="headline-platform text-lg !leading-snug group-hover:text-[#2525c4]">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#12162a]/65">{a.body}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/hr/auth/signin"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2D2DDD]"
            >
              Open HR workspace <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="about-reveal">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">For candidates</p>
            <h2 className="headline-platform mt-3 text-3xl !text-emerald-800">Job seekers</h2>
            <p className="mt-2 text-sm text-[#12162a]/65">
              Clean, fast surfaces focused on applications, skills, and clarity.
            </p>
            <div className="mt-6 grid gap-4">
              {CANDIDATE_AUDIENCES.map((a) => (
                <Link
                  key={a.title}
                  href={a.href}
                  className="group block rounded-2xl border border-emerald-200/80 bg-white px-5 py-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold tracking-tight text-emerald-900 group-hover:text-emerald-700">
                    {a.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#12162a]/65">{a.body}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
            >
              Browse open roles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 about-reveal">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">Trust</p>
            <h2 className="headline-platform mt-3 text-2xl sm:text-3xl">
              Security and fairness are product requirements
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#12162a]/7 sm:text-base">
              GDPR-aware handling, encryption in transit and at rest, bias-aware scoring, and
              recommendations teams can inspect.
            </p>
            <Link
              href="/security"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2D2DDD]"
            >
              Security & compliance <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="space-y-3 border-l-2 border-[#2D2DDD]/25 pl-5 text-sm leading-relaxed text-[#12162a]/75">
            <li>Structured criteria for every applicant</li>
            <li>Audit-friendly scores, shortlists, and outcomes</li>
            <li>Clear communication pathways for candidates</li>
            <li>Controls for HR, managers, and institution partners</li>
          </ul>
        </div>
      </section>

      <section className="bg-[#2D2DDD] px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center about-reveal">
          <p className="headline-platform-dark text-3xl sm:text-4xl">Hire the next chapter with us</p>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 sm:text-base">
            Walk the OptioHire workflow with your team — HR, campus, or candidate journeys.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-white px-7 py-5 font-semibold text-[#2D2DDD] hover:bg-white/95"
            >
              <Link href="/auth/options?mode=signup">
                Start free trial <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-2xl border-white/30 bg-transparent px-7 py-5 text-white hover:bg-white/10"
            >
              <Link href="/use-cases">See use cases</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
