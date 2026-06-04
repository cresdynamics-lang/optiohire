import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePageContent from './homepage-content'
import HeroDashboard from '@/components/hero/HeroDashboard'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OptioHire',
  description: 'OptioHire helps HR teams run faster, fairer hiring with automated applicant screening, transparent scoring, and interview-ready shortlists.',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-[#f7f7f8]">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden px-6 py-11 md:px-10 lg:px-14">
          {/* Radial glow – right side */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-3/5 opacity-70"
            style={{ background: 'radial-gradient(ellipse at 70% 40%, #e4e4f0 0%, transparent 65%)' }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            {/* ── LEFT ── */}
            <div>
              <h1 className="headline-platform text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2a2a7a]">
                The hiring command center for HR teams.
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                Post roles, receive applications, auto-screen candidates, and move to interviews with full
                transparency. OptioHire gives your team a faster, fairer, and more professional recruitment workflow.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 rounded-2xl bg-[#2a2a7a] px-7 py-6 text-base font-semibold text-white hover:bg-[#1a1a5a]">
                  <Link href="/auth/signup?role=employer">Get Started Free <ArrowRight className="ml-1 inline h-5 w-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-[#15a36b] bg-[#DCFCE7]/30 px-7 py-6 text-base font-medium text-[#15a36b] hover:bg-[#DCFCE7]/50 shadow-sm">
                  <Link href="/auth/signup?role=candidate">Join as Candidate</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-2xl px-7 py-6 text-base font-medium text-slate-600 hover:bg-slate-100">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>

              <p className="mt-8 text-sm font-medium text-slate-500 italic">
                Built for HR teams & Job Seekers
              </p>

              {/* Animated feature list */}
              <ul className="mt-4 flex flex-col gap-3">
                {[
                  'One place for jobs, applications, and interview decisions',
                  'Consistent candidate scoring with transparent reasoning',
                  'Automated applicant updates for shortlist and rejection outcomes',
                ].map((text, i) => (
                  <li
                    key={text}
                    className="oh-feat flex items-center gap-3 text-base text-slate-600"
                    style={{ animationDelay: `${0.3 + i * 0.25}s` }}
                  >
                    <span className="oh-tick-wrap relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#15a36b]">
                      <span className="oh-tick-fill absolute inset-0 rounded-full bg-[#15a36b]" style={{ animationDelay: `${0.3 + i * 0.25}s` }} />
                      <svg viewBox="0 0 9 9" className="relative z-10 h-3 w-3">
                        <path
                          d="M1.5 4.5L3.8 7 7.5 2.5"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="oh-tick-path"
                          style={{ animationDelay: `${0.45 + i * 0.25}s` }}
                        />
                      </svg>
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── RIGHT – animated dashboard card ── */}
            <div className="flex h-full items-stretch">
              <HeroDashboard />
            </div>
          </div>
        </section>

        <HomePageContent />
      </div>
    </>
  )
}

