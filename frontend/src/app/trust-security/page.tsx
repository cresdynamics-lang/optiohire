import { Metadata } from 'next'
import { Shield, Lock, Eye, Users, CheckCircle, FileText, AlertTriangle, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Trust & Security | Ethical AI Hiring | OptioHire',
  description: 'Learn about OptioHire\'s commitment to data privacy, responsible AI, bias reduction, and ethical hiring practices that protect both candidates and employers.',
  keywords: 'data privacy, ethical AI, bias reduction, responsible hiring, GDPR compliance, candidate protection'
}

export default function TrustSecurityPage() {
  const trustPrinciples = [
    {
      icon: Shield,
      title: 'Data Protection & Privacy',
      description: 'We treat candidate data with the utmost care and respect, implementing industry-leading security measures to protect personal information.',
      details: [
        'End-to-end encryption for all data transmission',
        'GDPR and local privacy law compliance',
        'Regular security audits and penetration testing',
        'Data minimization - we only collect what we need',
        'Right to data deletion and portability'
      ]
    },
    {
      icon: Users,
      title: 'Bias Reduction & Fair Hiring',
      description: 'Our system is designed from the ground up to minimize unconscious bias and ensure fair consideration for all qualified candidates.',
      details: [
        'Bias-aware algorithms trained on diverse datasets',
        'Regular bias audits and algorithm transparency',
        'Consistent evaluation criteria for all candidates',
        'Human oversight in final decision-making',
        'Diverse hiring panel recommendations'
      ]
    },
    {
      icon: Eye,
      title: 'Transparency & Accountability',
      description: 'We believe in clear communication about how our system works and maintains detailed records of all hiring decisions.',
      details: [
        'Open about our evaluation methodology',
        'Detailed scoring explanations for candidates',
        'Audit trails for all hiring decisions',
        'Regular reporting on system performance',
        'Independent third-party reviews'
      ]
    },
    {
      icon: Heart,
      title: 'Responsible AI Development',
      description: 'Our AI systems are built with ethical considerations at every stage, prioritizing human well-being over automation efficiency.',
      details: [
        'Human-centered design principles',
        'Ethical AI guidelines and frameworks',
        'Regular impact assessments',
        'Feedback loops from users and candidates',
        'Continuous improvement based on real-world outcomes'
      ]
    }
  ]

  const securityFeatures = [
    {
      icon: Lock,
      title: 'Account Security',
      description: 'Multi-factor authentication, secure password policies, and session management to protect your account.'
    },
    {
      icon: FileText,
      title: 'Data Encryption',
      description: 'All sensitive data is encrypted at rest and in transit using industry-standard encryption protocols.'
    },
    {
      icon: AlertTriangle,
      title: 'Access Controls',
      description: 'Role-based permissions ensure team members only access the information they need for their roles.'
    },
    {
      icon: CheckCircle,
      title: 'Compliance Monitoring',
      description: 'Continuous monitoring and automated reporting to ensure ongoing compliance with data protection laws.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Trust & Security
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your trust is our foundation. We build OptioHire with unwavering commitment
            to data privacy, ethical AI practices, and responsible hiring that protects
            both candidates and employers.
          </p>
        </div>
      </section>

      {/* Trust Principles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Trust Principles
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Every decision we make prioritizes the protection and fair treatment of people
              over business efficiency or technical optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {trustPrinciples.map((principle, index) => (
              <div key={principle.title} className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <principle.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{principle.title}</h3>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {principle.description}
                </p>

                <ul className="space-y-3">
                  {principle.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Security & Compliance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade security measures protect your data and ensure
              compliance with the highest standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Candidate Protection */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Protecting Candidates
            </h2>
            <p className="text-lg text-gray-600">
              We believe candidates deserve respect, fairness, and transparency throughout the hiring process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Data Privacy Rights</h3>
                  <p className="text-gray-600 text-sm">
                    Candidates can request access to their data, corrections, or complete deletion at any time.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Bias Prevention</h3>
                  <p className="text-gray-600 text-sm">
                    Our algorithms are continuously monitored and updated to prevent discriminatory outcomes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transparent Scoring</h3>
                  <p className="text-gray-600 text-sm">
                    Candidates receive clear explanations of how their applications are evaluated.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Feedback Opportunities</h3>
                  <p className="text-gray-600 text-sm">
                    Candidates can provide feedback on their experience to help us improve.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Data Handling</h3>
                  <p className="text-gray-600 text-sm">
                    All candidate information is encrypted and stored securely with access controls.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ethical AI Use</h3>
                  <p className="text-gray-600 text-sm">
                    Our AI enhances human decision-making without replacing human judgment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Compliance */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Certifications & Compliance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain the highest standards for data protection and ethical AI practices.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'GDPR Compliant', status: 'Certified' },
              { name: 'SOC 2 Type II', status: 'In Progress' },
              { name: 'ISO 27001', status: 'Certified' },
              { name: 'Ethical AI', status: 'Framework' },
            ].map((cert) => (
              <div key={cert.name} className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{cert.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    cert.status === 'Certified' ? 'bg-green-100 text-green-800' :
                    cert.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Questions About Trust & Security?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're committed to transparency. If you have questions about our practices
            or want to learn more about how we protect data and ensure fair hiring,
            we're here to help.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Data Protection</h3>
              <p className="text-gray-600 text-sm mb-3">
                Questions about GDPR, data privacy, or security practices.
              </p>
              <a href="mailto:privacy@optiohire.com" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                privacy@optiohire.com
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Ethical AI</h3>
              <p className="text-gray-600 text-sm mb-3">
                Questions about bias reduction, fairness, or AI ethics.
              </p>
              <a href="mailto:ethics@optiohire.com" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                ethics@optiohire.com
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              For general inquiries about trust and security:
            </p>
            <a href="mailto:trust@optiohire.com" className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-200">
              Contact Trust Team
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
