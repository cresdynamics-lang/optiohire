'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function HomePageContent() {
  const router = useRouter()
  const outcomes = [
    {
      title: 'Faster time-to-hire',
      metric: '3x faster',
      description: 'Automated screening and ranked candidates reduce manual review time across every role.',
    },
    {
      title: 'Better quality hires',
      metric: '+40%',
      description: 'Structured scorecards and role-fit signals improve hiring confidence and long-term retention.',
    },
    {
      title: 'Fairer decisions',
      metric: 'Bias-aware',
      description: 'Consistent evaluation rubrics help teams reduce noise and keep candidate review accountable.',
    },
  ]

  const useCases = [
    {
      title: 'High-growth startups',
      description: 'Move quickly without compromising candidate quality while hiring for critical roles.',
    },
    {
      title: 'Scaling SMEs',
      description: 'Standardize hiring workflows across teams and keep recruiters aligned as volume increases.',
    },
    {
      title: 'Enterprise HR teams',
      description: 'Unify hiring decisions with measurable, auditable reports across departments.',
    },
    {
      title: 'Specialist recruiting',
      description: 'Evaluate deeper role-readiness for technical and hard-to-fill positions.',
    },
  ]

  return (
    <div className="pb-20">
      <section className="px-4 pb-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_25px_80px_-50px_rgba(15,23,42,0.5)] backdrop-blur md:grid-cols-3 md:p-7">
          <div>
            <p className="text-sm font-semibold text-blue-700">Trusted hiring infrastructure</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Built for modern recruitment teams</h2>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
            <p className="text-sm text-slate-500">Data privacy</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Secure-by-default workflows</p>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
            <p className="text-sm text-slate-500">Decision quality</p>
            <p className="mt-1 text-base font-semibold text-slate-900">Clear scorecards and audit trail</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              Outcome-focused platform
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A sleek hiring workflow that keeps teams aligned.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              From screening to final decision, OptioHire gives every stakeholder the same reliable source of
              truth.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {outcomes.map((outcome) => (
              <div
                key={outcome.title}
                className="group rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <span className="h-5 w-5 rounded-full bg-blue-700/20" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{outcome.metric}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{outcome.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-xl sm:p-10">
          <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                <span className="h-2 w-2 rounded-full bg-blue-200" />
                How it works
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Structured hiring in three clear steps
              </h2>
              <p className="mt-4 max-w-2xl text-slate-200">
                Keep candidate evaluation consistent and transparent from intake to final approval.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-7 rounded-2xl px-6"
                onClick={() => router.push('/how-it-works')}
              >
                Explore Process
                <span className="ml-2 text-xs">-&gt;</span>
              </Button>
            </div>
            <div className="space-y-3">
              {[
                'Screen candidates using role-specific criteria',
                'Rank applicants with consistent, bias-aware scoring',
                'Share final recommendations with hiring stakeholders',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                  <p className="text-sm text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Designed for every hiring context
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                A professional UI and workflow model that scales from startup recruiting to enterprise hiring.
              </p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => router.push('/use-cases')}>
              View Use Cases
              <span className="ml-2 text-xs">-&gt;</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3">
                  <span className="h-5 w-5 rounded-full bg-blue-700/20" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{useCase.title}</h3>
                <p className="mt-2 text-slate-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Trust and transparency by design
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Keep your candidate data protected and your hiring process explainable at every stage.
              </p>
              <Button className="mt-6 rounded-2xl" onClick={() => router.push('/trust-security')}>
                Learn About Security
                <span className="ml-2 text-xs">-&gt;</span>
              </Button>
            </div>
            <div className="space-y-4">
              {[
                'Role-based access and secure data handling',
                'Consistent scorecards to reduce decision bias',
                'Human-in-the-loop oversight for AI recommendations',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
