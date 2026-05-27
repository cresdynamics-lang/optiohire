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
              <h1
                className="font-serif italic font-bold leading-[1.13] text-[#2a2a7a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 2.6rem)' }}
              >
                The hiring<br />command center<br />for HR teams.
              </h1>

              <p className="mt-4 max-w-md text-[13.5px] leading-[1.65] text-[#555]">
                Post roles, receive applications, auto-screen candidates, and move to interviews with full
                transparency. OptioHire gives your team a faster, fairer, and more professional recruitment workflow.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button asChild className="rounded-[8px] bg-[#1a1a2e] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-black">
                  <Link href="/auth/signup">Get Started <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
                </Button>
                <Button asChild variant="outline" className="rounded-[8px] border-[#ccc] bg-white px-5 py-2.5 text-[13px] font-medium text-[#1a1a2e] hover:bg-slate-50">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>

              <p className="mt-5 text-[11.5px] text-[#888]">Built for HR managers and hiring managers</p>

              {/* Animated feature list */}
              <ul className="mt-3 flex flex-col gap-2">
                {[
                  'One place for jobs, applications, and interview decisions',
                  'Consistent candidate scoring with transparent reasoning',
                  'Automated applicant updates for shortlist and rejection outcomes',
                ].map((text, i) => (
                  <li
                    key={text}
                    className="oh-feat flex items-center gap-2.5 text-[12.5px] text-[#444]"
                    style={{ animationDelay: `${0.3 + i * 0.25}s` }}
                  >
                    <span className="oh-tick-wrap relative flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#15a36b]">
                      <span className="oh-tick-fill absolute inset-0 rounded-full bg-[#15a36b]" style={{ animationDelay: `${0.3 + i * 0.25}s` }} />
                      <svg viewBox="0 0 9 9" className="relative z-10 h-[9px] w-[9px]">
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

