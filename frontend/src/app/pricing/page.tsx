import { Metadata } from 'next'
import { Check, Star, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing | OptioHire - Transparent AI Hiring Solutions',
  description: 'Simple pricing for OptioHire, the B2B HR tech SaaS by Cres Dynamics in Nairobi that helps teams hire faster with smart screening and fair evaluation.',
  keywords: 'skills-first hiring pricing, recruitment software pricing, AI hiring platform cost, transparent hiring plans, B2B HR tech pricing'
}

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'KSH 2,500',
      period: 'month',
      description: 'Perfect for small teams getting started with AI hiring',
      features: [
        'Up to 50 applications/month',
        'Basic AI screening',
        'Email notifications',
        'Basic reporting',
        'Email support'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: 'KSH 5,000',
      period: 'month',
      description: 'Ideal for growing companies with regular hiring needs',
      features: [
        'Up to 200 applications/month',
        'Advanced AI matching',
        'Custom scoring criteria',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom integrations'
      ],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: 'KSH 10,000',
      period: 'month',
      description: 'Tailored solutions for large organizations with complex needs',
      features: [
        'Unlimited applications',
        'White-label solution',
        'Advanced AI customization',
        'Dedicated account manager',
        'Custom integrations',
        'SLA commitments',
        'On-premise deployment option'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ]

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 7-day free trial with full access to all Professional plan features. No credit card required.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day refund policy subject to terms. If you are not satisfied, our team will review and process eligible refunds.'
    }
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#f1f5f9_100%)]">
      {/* Hero Section */}
      <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="headline-platform text-4xl sm:text-5xl lg:text-6xl mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your hiring needs. Every plan includes skills-first
            screening and fair evaluation workflows with no hidden fees.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800">
            <Star className="w-4 h-4" />
            7-day free trial • No credit card required
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl border bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? 'border-blue-500 ring-2 ring-blue-200/70'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="rounded-full bg-blue-600 px-4 py-1 text-sm font-medium text-white">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="headline-platform text-2xl !font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full rounded-xl py-3 px-6 font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:shadow-xl'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
                <h3 className="headline-platform text-lg !font-semibold mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 sm:p-10 shadow-xl">
          <h2 className="headline-platform-dark text-3xl sm:text-4xl mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Evaluate OptioHire with a 7-day free trial and see how skills-first
            screening improves hiring quality and speed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-blue-700">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="rounded-xl border border-slate-400 px-8 py-4 font-semibold text-white transition-colors duration-200 hover:bg-white/10">
              Contact Sales
            </button>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}

