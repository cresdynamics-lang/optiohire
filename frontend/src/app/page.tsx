'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePageContent from './homepage-content'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OptioHire',
  description: 'B2B HR tech SaaS by Cres Dynamics in Nairobi, Kenya, helping companies hire 3x faster through smart screening, fair evaluation, and confident decisions.',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function HomePage() {
  const router = useRouter()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#f1f5f9_100%)]">
        <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-32">
          <div className="absolute inset-0 hero-dot-grid opacity-35" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-slate-900/10 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">
                Built by Cres Dynamics
              </p>
              <h1 className="text-balance text-4xl font-bold leading-tight text-slate-900 sm:text-5xl md:text-6xl">
                A modern hiring platform for teams that want speed and quality.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                OptioHire helps your team screen fairly, shortlist confidently, and hire top candidates faster
                with structured, skills-first workflows.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => router.push('/auth/signup')} className="gap-2 rounded-2xl bg-slate-900 px-7 text-white hover:bg-black">
                  Request Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/auth/signin')}
                  className="rounded-2xl border-slate-300 bg-white/90 px-7 text-slate-700 hover:bg-white"
                >
                  Sign In
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                {['3x faster hiring cycles', 'Bias-aware evaluations', 'Clear hiring reports'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <HomePageContent />
      </div>
    </>
  )
}
