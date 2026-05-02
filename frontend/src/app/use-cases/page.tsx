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
      description: 'Hiring your first 20 employees? Do not let a bad process cost you.',
      pain: 'Lean teams cannot spend days manually screening CVs',
      solution: 'Fast shortlist generation with structured, role-fit scoring',
      outcomes: ['3x faster shortlist cycles', 'Higher confidence in final interviews', 'Cleaner hiring records'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Building2,
      title: 'Scaling SMEs',
      description: 'Your team is in Nairobi, Mombasa, and Kisumu — keep hiring consistent.',
      pain: 'Different teams use different hiring standards',
      solution: 'One shared scorecard and process for every vacancy',
      outcomes: ['Consistent candidate quality', 'Aligned interviewer feedback', 'Faster hiring decisions'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'Enterprise HR',
      description: 'Unify 10 departments. One scorecard. One source of truth.',
      pain: 'Large organizations struggle with fragmented recruiter workflows',
      solution: 'Centralized review, reporting, and final recommendation tracking',
      outcomes: ['Cross-department consistency', 'Auditable decision history', 'Lower process risk'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Briefcase,
      title: 'NGOs & development orgs',
      description: 'Donor-funded roles need fair, documented selection. We make that easy.',
      pain: 'Funding stakeholders require traceable and fair hiring decisions',
      solution: 'Bias-aware scoring with full audit trails for every candidate',
      outcomes: ['Documented fairness', 'Compliance-ready reporting', 'Faster panel alignment'],
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#f1f5f9_100%)]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Use Cases
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From startups to high-volume HR teams, OptioHire adapts to your hiring scenario
            with skills-first assessments, fair evaluations, and faster confident decisions.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className="rounded-2xl border border-slate-200 bg-white/95 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${useCase.color} rounded-lg flex items-center justify-center mb-6`}>
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {useCase.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {useCase.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">The Challenge</h4>
                    <p className="text-sm text-gray-600">{useCase.pain}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">How OptioHire Helps</h4>
                    <p className="text-sm text-gray-600">{useCase.solution}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Results</h4>
                    <ul className="space-y-1">
                      {useCase.outcomes.map((outcome, i) => (
                        <li key={i} className="text-sm text-blue-700 flex items-center">
                          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="flex w-full items-center justify-center rounded-lg bg-blue-50 px-4 py-2 font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Industry-Specific Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored approaches for different industries and organizational contexts.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'Technology', count: '500+ hires' },
              { name: 'Finance', count: '300+ hires' },
              { name: 'Healthcare', count: '200+ hires' },
              { name: 'Retail', count: '400+ hires' },
              { name: 'Manufacturing', count: '150+ hires' },
              { name: 'Education', count: '100+ hires' },
            ].map((industry) => (
              <div key={industry.name} className="text-center">
                <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                  <p className="text-sm text-blue-700">{industry.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Size Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              For Every Company Size
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a startup hiring your first 10 people or an enterprise managing
              complex global recruitment, we have solutions that scale with your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white/95 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">1-50</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Early Stage</h3>
              <p className="text-gray-600 mb-4">
                Startups and small teams focused on quality hires that drive growth.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fast, focused hiring</li>
                <li>• Cultural fit assessment</li>
                <li>• Growth potential evaluation</li>
              </ul>
            </div>

            <div className="text-center p-8 bg-white/95 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">51-500</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Growing Companies</h3>
              <p className="text-gray-600 mb-4">
                Scaling businesses needing efficient processes for multiple roles.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Volume hiring support</li>
                <li>• Team collaboration tools</li>
                <li>• Process standardization</li>
              </ul>
            </div>

            <div className="text-center p-8 bg-white/95 rounded-2xl shadow-sm border border-slate-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enterprise</h3>
              <p className="text-gray-600 mb-4">
                Large organizations with complex hiring needs and compliance requirements.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Advanced analytics</li>
                <li>• Compliance automation</li>
                <li>• Multi-team coordination</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 sm:p-10 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find Your Use Case
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Every hiring scenario is different. Let's discuss how OptioHire can
            be tailored to your specific needs and challenges.
          </p>
          <button className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700">
            Request a Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          </div>
        </div>
      </section>
    </div>
  )
}
