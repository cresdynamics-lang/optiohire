import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, AlertTriangle, TrendingDown, Target, Shield, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why OptioHire | Smarter Hiring for Modern Teams',
  description: 'Discover why teams choose OptioHire, a B2B HR tech SaaS by Cres Dynamics in Nairobi, to hire faster with fair evaluations and transparent AI recommendations.',
  keywords: 'skills-first hiring, fair evaluation, role readiness, cultural fit hiring, transparent AI hiring, better hiring decisions'
}

export default function WhyOptioHirePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#f1f5f9_100%)]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="headline-platform text-4xl sm:text-5xl lg:text-6xl mb-6">
            Why OptioHire?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Traditional hiring is slow, biased, and uncertain. OptioHire helps teams hire 3x
            faster with smart screening, fair evaluation, and confident data-backed decisions.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              The Reality of Modern Hiring
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teams face the same frustrating challenges, regardless of company size or industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="headline-platform text-xl !font-semibold mb-3">
                Slow & Inefficient
              </h3>
              <p className="text-gray-600">
                Weeks spent reviewing hundreds of resumes, only to interview candidates
                who aren't qualified. Valuable time wasted on unqualified applicants.
              </p>
            </div>

            <div className="text-center p-6">
              <TrendingDown className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="headline-platform text-xl !font-semibold mb-3">
                Biased & Unfair
              </h3>
              <p className="text-gray-600">
                Unconscious bias creeps into every stage of hiring, leading to missed
                opportunities and unfair processes that disadvantage qualified candidates.
              </p>
            </div>

            <div className="text-center p-6">
              <Target className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="headline-platform text-xl !font-semibold mb-3">
                High Risk Decisions
              </h3>
              <p className="text-gray-600">
                Hiring feels like gambling. Teams make costly decisions based on gut feelings
                rather than data, leading to expensive turnover and team disruption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Resumes Fail */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              Why Traditional Methods Fall Short
            </h2>
            <p className="text-lg text-gray-600">
              Resumes and ATS systems promise efficiency, but deliver frustration.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="headline-platform text-xl !font-semibold mb-4">
                Resumes Don't Show Real Readiness
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A resume lists what someone did in the past, not whether they're ready to
                excel in your specific role today. Keywords and formatting tricks often
                mask genuine capability gaps.
              </p>
            </div>

            <div className="bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="headline-platform text-xl !font-semibold mb-4">
                ATS Systems Create False Matches
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Applicant tracking systems rely on keyword matching, which favors candidates
                who game the system rather than those who actually possess the required skills.
                Quality gets lost in the algorithm.
              </p>
            </div>

            <div className="bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="headline-platform text-xl !font-semibold mb-4">
                Manual Review is Inconsistent
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Human reviewers bring their own biases and fatigue, leading to inconsistent
                evaluations. What gets prioritized varies by who's doing the reviewing,
                creating unfair advantages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OptioHire Philosophy */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              The OptioHire Philosophy
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe hiring should be about finding the right person for the role,
              not playing a numbers game with resumes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="headline-platform text-2xl !font-semibold">Focus on Readiness</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                We evaluate what candidates can contribute today, not just what they've
                done before. Every assessment focuses on current capability and role alignment.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Skills validation over keyword matching</li>
                <li>• Experience assessment, not just job titles</li>
                <li>• Role-fit analysis for each position</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="headline-platform text-2xl !font-semibold">Built for Fairness</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every candidate deserves fair consideration. We design our system to
                minimize bias and ensure consistent, objective evaluation criteria.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Bias-aware algorithms and scoring</li>
                <li>• Transparent evaluation processes</li>
                <li>• Consistent standards across all candidates</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="headline-platform text-2xl !font-semibold">Designed for Teams</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                We work with real hiring teams facing real challenges. Every feature
                is built based on actual hiring workflows and pain points.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Intuitive interfaces for busy recruiters</li>
                <li>• Collaboration tools for hiring teams</li>
                <li>• Integration with existing workflows</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="headline-platform text-2xl !font-semibold">Fast-Market Ready</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Built for markets like Nairobi where speed matters. We help teams
                move quickly while maintaining quality and fairness in hiring.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Rapid candidate processing</li>
                <li>• Quick time-to-decision</li>
                <li>• Scalable for growing teams</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              Not Just Another AI Tool
            </h2>
            <p className="text-lg text-gray-600">
              OptioHire isn't generic AI hype. We're a serious solution for serious hiring challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/95 p-6 rounded-2xl border border-slate-200">
              <h3 className="headline-platform !font-semibold mb-3">What We Are</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Focused on hiring outcomes</li>
                <li>✓ Designed for fairness and ethics</li>
                <li>✓ Built for real hiring teams</li>
                <li>✓ Transparent and accountable</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="headline-platform !font-semibold mb-3">What We're Not</h3>
              <ul className="space-y-2 text-gray-500">
                <li>✗ Generic AI resume filtering</li>
                <li>✗ Black-box algorithms</li>
                <li>✗ Overhyped automation</li>
                <li>✗ One-size-fits-all solutions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 sm:p-10 shadow-xl">
          <h2 className="headline-platform-dark text-3xl sm:text-4xl mb-4">
            Ready to Hire with Confidence?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Join teams who've discovered that better hiring isn't about having more
            data — it's about having the right insights.
          </p>
          <Link
            href="/auth/options?mode=signup"
            className="inline-flex items-center rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            Start free trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
