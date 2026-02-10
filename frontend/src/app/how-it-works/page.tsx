import { Metadata } from 'next'
import { ArrowRight, CheckCircle, Users, Target, Award } from 'lucide-react'
import VideoSection from '@/components/ui/video-section'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'How OptioHire Works | Simple, Fair Hiring Process',
  description: 'See how OptioHire removes uncertainty from hiring with a simple 3-step process that focuses on real skills and job readiness.',
  keywords: 'hiring process, recruitment workflow, candidate screening, fair hiring, hiring automation'
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            How OptioHire Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A simple, transparent process that brings clarity and confidence to every hiring decision.
            No more guesswork, just data-driven insights that help you find the right person for the role.
          </p>
        </div>
      </section>

      {/* See It in Action Video Section */}
      <ErrorBoundary fallback={null}>
        <VideoSection
          useHowdyGo={true}
          title="See It in Action"
          description="Watch how our AI-powered platform transforms your hiring process"
        />
      </ErrorBoundary>

      {/* 3-Step Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The OptioHire Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three clear steps that transform how teams evaluate and select candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Smart Screening
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our AI analyzes resumes and applications to identify candidates who demonstrate
                the specific skills and experience your role requires. No more sifting through
                hundreds of unqualified applicants.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Skills-based matching</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Experience validation</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Automated qualification</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Fair Evaluation
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Each candidate receives an objective assessment based on role requirements,
                reducing unconscious bias and ensuring fair consideration for all qualified applicants.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Bias-aware scoring</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Transparent criteria</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Consistent evaluation</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Confident Decisions
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Teams receive clear recommendations with detailed insights, making it easy to
                identify top candidates and move forward with confidence in their hiring choices.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Data-driven insights</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Clear recommendations</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <span>Confidence in choices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Teams See */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Teams See
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A clean, intuitive dashboard that brings clarity to the hiring process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-gray-900">Candidate Overview</h3>
              </div>
              <p className="text-gray-600 mb-4">
                See all qualified candidates at a glance with clear scoring and key highlights.
                No more digging through resumes to find the right person.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Match percentage for each candidate</li>
                <li>• Key skills and experience highlights</li>
                <li>• Red flags and concerns (if any)</li>
                <li>• Comparison tools for side-by-side evaluation</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-teal-600" />
                <h3 className="text-xl font-semibold text-gray-900">Decision Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Get actionable recommendations based on data, not just gut feelings.
                Make confident hiring decisions with clear rationale.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Top candidate recommendations</li>
                <li>• Detailed scoring breakdown</li>
                <li>• Interview question suggestions</li>
                <li>• Risk assessment for each candidate</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Experience */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            What Candidates Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fair Assessment</h3>
              <p className="text-gray-600 text-sm">
                Every candidate is evaluated using the same transparent criteria,
                ensuring fair consideration regardless of background.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Clear Communication</h3>
              <p className="text-gray-600 text-sm">
                Candidates receive timely updates about their application status
                and constructive feedback when appropriate.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Respectful Process</h3>
              <p className="text-gray-600 text-sm">
                We handle all candidate data with care and respect,
                maintaining privacy and professional standards throughout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Real Results, Real Teams
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-teal-600 mb-2">3x</div>
              <div className="text-gray-600">Faster hiring process</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-teal-600 mb-2">40%</div>
              <div className="text-gray-600">Better hire quality</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-teal-600 mb-2">60%</div>
              <div className="text-gray-600">Less time wasted</div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
            <Award className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <blockquote className="text-lg text-gray-700 mb-4">
              "OptioHire transformed our hiring from a stressful guessing game into a
              confident, data-driven process. We found better candidates faster and
              made hires we're actually excited about."
            </blockquote>
            <cite className="text-gray-500">- Sarah Johnson, Head of Talent, TechCorp Nairobi</cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Experience Better Hiring?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of teams who've discovered how OptioHire makes hiring
            simpler, fairer, and more successful.
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
