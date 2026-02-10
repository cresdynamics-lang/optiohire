import { Metadata } from 'next'
import { ArrowRight, Rocket, Building2, Users, Briefcase, Zap, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Use Cases | OptioHire for Every Hiring Scenario',
  description: 'Discover how OptioHire serves startups, growing companies, HR teams, and various hiring scenarios with tailored recruitment solutions.',
  keywords: 'hiring use cases, recruitment scenarios, startup hiring, enterprise HR, volume hiring, specialized recruitment'
}

export default function UseCasesPage() {
  const useCases = [
    {
      icon: Rocket,
      title: 'Startups Hiring Fast',
      description: 'Growing startups need to hire quickly without compromising on quality. OptioHire helps identify candidates who can contribute immediately.',
      pain: 'Need great hires yesterday but can\'t afford months of recruitment',
      solution: 'Rapid screening with focus on growth potential and role fit',
      outcomes: ['50% faster hiring cycles', 'Higher retention rates', 'Cost-effective scaling'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Building2,
      title: 'Growing SMEs Scaling Teams',
      description: 'Small to medium businesses expanding their teams need efficient hiring that supports their growth trajectory.',
      pain: 'Hiring multiple roles simultaneously while maintaining quality',
      solution: 'Streamlined processes for volume hiring with consistent quality',
      outcomes: ['3x faster scaling', 'Consistent hire quality', 'Reduced hiring costs'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Users,
      title: 'HR Teams Managing Volume',
      description: 'Dedicated HR teams handling high-volume recruitment need tools that maintain quality while increasing efficiency.',
      pain: 'Managing hundreds of applications across multiple roles',
      solution: 'Automated screening with human oversight for quality control',
      outcomes: ['60% time savings', 'Better candidate experience', 'Improved team productivity'],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Briefcase,
      title: 'Specialized Technical Roles',
      description: 'Finding qualified developers, engineers, and technical specialists requires deep understanding of technical skills.',
      pain: 'Hard to assess real technical capabilities from resumes',
      solution: 'Skills-focused evaluation with technical competency validation',
      outcomes: ['95% technical match accuracy', 'Reduced technical interviews', 'Better team fit'],
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Zap,
      title: 'Sales & Operations Hiring',
      description: 'High-performing sales teams and operational roles require specific behavioral assessments beyond basic qualifications.',
      pain: 'Traditional methods miss critical behavioral competencies',
      solution: 'Role-specific evaluation criteria with behavioral insights',
      outcomes: ['40% higher performance', 'Lower turnover', 'Better team dynamics'],
      color: 'from-teal-500 to-blue-600'
    },
    {
      icon: Target,
      title: 'Entry-Level & Graduate Hiring',
      description: 'Identifying promising early-career talent requires looking beyond traditional qualifications and experience.',
      pain: 'Hard to assess potential in candidates with limited experience',
      solution: 'Focus on growth potential, learning ability, and cultural fit',
      outcomes: ['Higher long-term retention', 'Better cultural integration', 'Future-ready talent'],
      color: 'from-pink-500 to-rose-600'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Use Cases
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From startups hiring their first key roles to enterprises managing complex
            recruitment at scale, OptioHire adapts to your hiring scenario and delivers
            consistent, high-quality results.
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
                className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:border-teal-200"
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
                        <li key={i} className="text-sm text-teal-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mr-2"></span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors duration-200 font-medium">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
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
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-semibold text-gray-900 mb-1">{industry.name}</h3>
                  <p className="text-sm text-teal-600">{industry.count}</p>
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
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-teal-600 mb-2">1-50</div>
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

            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-teal-600 mb-2">51-500</div>
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

            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="text-4xl font-bold text-teal-600 mb-2">500+</div>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Find Your Use Case
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Every hiring scenario is different. Let's discuss how OptioHire can
            be tailored to your specific needs and challenges.
          </p>
          <button className="inline-flex items-center px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200">
            Request a Demo
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
