import { Metadata } from 'next'
import { ArrowRight, Rocket, Building2, Users, Briefcase } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Use Cases | OptioHire for Kenyan Hiring Teams',
  description: 'Use cases for startups, SMEs, enterprise HR, and NGOs in Kenya. Fair, fast, auditable hiring at scale.',
  keywords: 'skills-first hiring use cases, startup hiring, SME recruitment, volume hiring, technical hiring, role readiness hiring'
}

export default function UseCasesPage() {
  const useCases = [
    {
      icon: Rocket,
      title: 'High-growth startups',
      description:
        'Hiring your first 20 employees? Do not let a weak process cost you.',
      pain: 'Lean teams cannot spend days manually screening CVs',
      solution: 'Fast shortlist generation with structured, role-fit scoring',
      outcomes: ['3x faster shortlist cycles', 'Higher confidence in final interviews', 'Cleaner hiring records'],
    },
    {
      icon: Building2,
      title: 'Scaling SMEs',
      description:
        'Your team is in Nairobi, Mombasa, and Kisumu — keep hiring consistent.',
      pain: 'Different teams use different hiring standards',
      solution: 'One shared scorecard and process for every vacancy',
      outcomes: ['Consistent candidate quality', 'Aligned interviewer feedback', 'Faster hiring decisions'],
    },
    {
      icon: Users,
      title: 'Enterprise HR',
      description: 'Unify 10 departments. One scorecard. One source of truth.',
      pain: 'Large organizations struggle with fragmented recruiter workflows',
      solution: 'Centralized review, reporting, and final recommendation tracking',
      outcomes: ['Cross-department consistency', 'Auditable decision history', 'Lower process risk'],
    },
    {
      icon: Briefcase,
      title: 'NGOs & development orgs',
      description:
        'Donor-funded roles need fair, documented selection. We make that easy.',
      pain: 'Funding stakeholders require traceable and fair hiring decisions',
      solution: 'Bias-aware scoring with full audit trails for every candidate',
      outcomes: ['Documented fairness', 'Compliance-ready reporting', 'Faster panel alignment'],
    },
  ]

  return (
    <div className="min-h-screen bg-[#eef0f3] text-slate-900">
      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f0f2f5] pt-32 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="headline-platform text-4xl sm:text-5xl lg:text-6xl mb-6">
            Use Cases
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From startups to high-volume HR teams, OptioHire adapts to your hiring scenario
            with skills-first assessments, fair evaluations, and faster confident decisions.
          </p>
        </div>
      </section>

      {/* Use Cases Grid — 2 columns from smallest screens up */}
      <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6">
            {useCases.map((useCase, index) => (
              <article
                key={useCase.title}
                className="group min-w-0 flex flex-col rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-6 lg:p-8 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
              >
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2 sm:mb-3">
                  USE CASE {index + 1}
                </p>

                <div className="mb-3 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-colors group-hover:border-[#2D2DDD]/25 group-hover:bg-[#2D2DDD]/[0.06]">
                  <useCase.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </div>

                <h3 className="headline-platform text-base sm:text-xl lg:text-2xl !font-semibold mb-2 sm:mb-3 leading-snug">
                  {useCase.title}
                </h3>

                <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">
                  {useCase.description}
                </p>

                <div className="space-y-3 sm:space-y-4 flex-1 text-xs sm:text-sm">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">The challenge</h4>
                    <p className="text-slate-600 leading-relaxed">{useCase.pain}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">How OptioHire helps</h4>
                    <p className="text-slate-600 leading-relaxed">{useCase.solution}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Results</h4>
                    <ul className="space-y-1">
                      {useCase.outcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span
                            className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#2D2DDD]"
                            aria-hidden
                          />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-sm font-medium text-slate-800 transition-colors duration-200 hover:border-[#2D2DDD]/40 hover:bg-[#2D2DDD]/[0.06] hover:text-[#2D2DDD]"
                  >
                    Learn more
                    <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="headline-platform text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">
              Industry-specific solutions
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Tailored approaches for different industries and organizational contexts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Technology', count: '500+ hires' },
              { name: 'Finance', count: '300+ hires' },
              { name: 'Healthcare', count: '200+ hires' },
              { name: 'Retail', count: '400+ hires' },
              { name: 'Manufacturing', count: '150+ hires' },
              { name: 'Education', count: '100+ hires' },
            ].map((industry) => (
              <div key={industry.name} className="text-center min-w-0">
                <div className="rounded-xl border border-slate-200 bg-[#f7f8fa] p-3 sm:p-4 transition-shadow duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm">
                  <h3 className="headline-platform text-sm sm:text-base !font-semibold mb-1 truncate">
                    {industry.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">{industry.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Size Section */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#e8eaee]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="headline-platform text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">
              For every company size
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you&apos;re a startup hiring your first 10 people or an enterprise managing
              complex global recruitment, we have solutions that scale with your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">1–50</div>
              <h3 className="headline-platform text-lg sm:text-xl !font-semibold mb-3">Early stage</h3>
              <p className="text-slate-600 mb-4 text-sm sm:text-base">
                Startups and small teams focused on quality hires that drive growth.
              </p>
              <ul className="text-sm text-slate-600 space-y-1 text-left max-w-xs mx-auto">
                <li>• Fast, focused hiring</li>
                <li>• Cultural fit assessment</li>
                <li>• Growth potential evaluation</li>
              </ul>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">51–500</div>
              <h3 className="headline-platform text-lg sm:text-xl !font-semibold mb-3">Growing companies</h3>
              <p className="text-slate-600 mb-4 text-sm sm:text-base">
                Scaling businesses needing efficient processes for multiple roles.
              </p>
              <ul className="text-sm text-slate-600 space-y-1 text-left max-w-xs mx-auto">
                <li>• Volume hiring support</li>
                <li>• Team collaboration tools</li>
                <li>• Process standardization</li>
              </ul>
            </div>

            <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
              <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">500+</div>
              <h3 className="headline-platform text-lg sm:text-xl !font-semibold mb-3">Enterprise</h3>
              <p className="text-slate-600 mb-4 text-sm sm:text-base">
                Large organizations with complex hiring needs and compliance requirements.
              </p>
              <ul className="text-sm text-slate-600 space-y-1 text-left max-w-xs mx-auto">
                <li>• Advanced analytics</li>
                <li>• Compliance automation</li>
                <li>• Multi-team coordination</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#1a1d24]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#22262e] p-8 sm:p-10 shadow-xl">
            <h2 className="headline-platform-dark text-2xl sm:text-3xl lg:text-4xl mb-4">
              Find your use case
            </h2>
            <p className="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Every hiring scenario is different. Let&apos;s discuss how OptioHire can
              be tailored to your specific needs and challenges.
            </p>
            <button
              type="button"
              className="inline-flex items-center rounded-xl bg-[#2D2DDD] px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white transition-colors duration-200 hover:bg-[#2525c5]"
            >
              Request a demo
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
