import Link from 'next/link'
import { ArrowRight, CheckCircle2, Building2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePageContent from './homepage-content'

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
      <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_45%,#f1f5f9_100%)]">
        <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
          <div className="absolute inset-0 hero-dot-grid opacity-35" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-slate-900/10 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <h1 className="headline-platform text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                The hiring command center for HR teams.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                Post roles, receive applications, auto-screen candidates, and move to interviews with full
                transparency. OptioHire gives your team a faster, fairer, and more professional recruitment workflow.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 rounded-2xl bg-slate-900 px-7 text-white hover:bg-black">
                  <Link href="/auth/signup">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-300 bg-white/90 px-7 text-slate-700 hover:bg-white">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">Built for HR managers and hiring managers</p>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                {[
                  'One place for jobs, applications, and interview decisions',
                  'Consistent candidate scoring with transparent reasoning',
                  'Automated applicant updates for shortlist and rejection outcomes',
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2D2DDD] to-blue-500 text-lg font-bold text-white">
                  OH
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-900">OptioHire</p>
                  <p className="text-sm text-slate-500">Smarter recruitment operations</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <Building2 className="mt-0.5 h-4 w-4 text-blue-700" />
                  <p className="text-sm text-slate-700">Create and manage roles with company-specific application routing.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  <p className="text-sm text-slate-700">Screen applicants quickly using structured, bias-aware evaluation signals.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-violet-700" />
                  <p className="text-sm text-slate-700">Keep a clear audit trail from first application to final interview decision.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomePageContent />
      </div>
    </>
  )
}
