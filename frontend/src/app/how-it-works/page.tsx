import { Metadata } from 'next'
import { ArrowRight, CheckCircle, Users, Target } from 'lucide-react'
import VideoSection from '@/components/ui/video-section'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export const metadata: Metadata = {
  title: 'From 300 Applications to Top 5 | OptioHire',
  description: 'Understand how OptioHire works: create a role, receive applications, scan candidates fairly, send automated shortlist/rejection updates, and schedule interviews.',
  keywords: 'how optiohire works, HR hiring workflow, candidate screening, shortlist automation, interview scheduling'
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_42%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_55%,#f1f5f9_100%)]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="headline-platform text-4xl sm:text-5xl lg:text-6xl mb-6">
            How OptioHire Works for HR Teams
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            OptioHire is built for HR managers and hiring managers. You create a job, receive applications in one
            pipeline, get fair AI-assisted screening, and move shortlisted candidates to interviews faster.
          </p>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every step is transparent and traceable, so your team can explain hiring decisions with confidence and
            maintain a professional candidate experience.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#video" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black">
              See It in Action
            </a>
            <a href="/auth/options?mode=signup" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-500">Shortlisting speed</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">3x faster shortlisting</p>
            <p className="mt-1 text-sm text-slate-600">Even for high-volume roles</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-500">Top-candidate coverage</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">95% found in first pass</p>
            <p className="mt-1 text-sm text-slate-600">Without manual CV marathons</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-medium text-slate-500">Process quality</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">Zero spreadsheet chaos</p>
            <p className="mt-1 text-sm text-slate-600">No WhatsApp threads or email chains</p>
          </div>
        </div>
      </section>

      {/* See It in Action Video Section */}
      <div id="video">
        <ErrorBoundary fallback={null}>
          <VideoSection
            useHowdyGo={false}
            title="See It in Action"
            description="Watch how OptioHire handles real hiring workflows from application intake to interview scheduling."
          />
        </ErrorBoundary>
      </div>

      {/* 3-Step Process */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              The OptioHire Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A practical, end-to-end workflow for real recruiting teams: post roles, process applications, screen
              fairly, and schedule interviews from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="headline-platform text-2xl !font-semibold mb-4">
                Create Job + Collect Applications
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                HR creates a job listing with role requirements and company details. Candidates apply through the
                configured channel (including email workflow), and all applications are captured into your OptioHire
                pipeline for the right job.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Role requirements captured clearly</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Applications routed to the correct job</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Centralized candidate pipeline</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="headline-platform text-2xl !font-semibold mb-4">
                AI Screening + Fair Ranking
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                The AI analyzes each application against your job requirements and produces a transparent score with
                reasoning. Candidates are categorized (shortlist, flagged, or reject) using the same criteria for
                consistency and fairness.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Requirement-based scoring</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Reasoning visible to HR</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Consistent evaluation across all candidates</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="headline-platform text-2xl !font-semibold mb-4">
                Candidate Updates + Interview Scheduling
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                OptioHire sends candidate outcome emails automatically (shortlisted or not selected). HR can then
                schedule interviews for shortlisted candidates directly from the dashboard and send interview invites
                with the meeting link.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Automated shortlist/rejection communication</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>One-click interview scheduling from dashboard</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Full decision trail for internal review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Teams See */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="headline-platform text-3xl sm:text-4xl mb-4">
              What Teams See
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A clean workspace for HR and hiring managers to track every candidate from first application to final interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/95 p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="headline-platform text-xl !font-semibold">Candidate Overview</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View all candidates per job with status, score, and reasoning in one list. Quickly identify who to
                review, who to shortlist, and who is not a fit.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Match percentage for each candidate</li>
                <li>• Key skills and experience highlights</li>
                <li>• Red flags and concerns (if any)</li>
                <li>• Clear shortlist / flagged / reject status</li>
              </ul>
            </div>

            <div className="bg-white/95 p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="headline-platform text-xl !font-semibold">Decision Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Move faster with structured recommendations and direct actions. Schedule interviews from shortlisted
                candidates and keep communication professional and timely.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ranked candidate recommendations</li>
                <li>• Detailed scoring breakdown</li>
                <li>• Interview scheduling actions</li>
                <li>• Outcome communication history</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Experience */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="headline-platform text-3xl sm:text-4xl mb-8">
            What Candidates Experience
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="headline-platform !font-semibold mb-2">Fair Assessment</h3>
              <p className="text-gray-600 text-sm">
                Every candidate is evaluated using the same transparent criteria,
                ensuring fair consideration regardless of background.
              </p>
            </div>

            <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="headline-platform !font-semibold mb-2">Clear Communication</h3>
              <p className="text-gray-600 text-sm">
                Candidates receive clear outcome communication (shortlisted or not selected) instead of waiting
                without feedback.
              </p>
            </div>

            <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="headline-platform !font-semibold mb-2">Respectful Process</h3>
              <p className="text-gray-600 text-sm">
                We handle all candidate data with care and respect,
                maintaining privacy and professional standards throughout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="headline-platform text-3xl sm:text-4xl mb-8">
            Real Results, Real Teams
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/95 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">3x</div>
              <div className="text-gray-600">Faster hiring process</div>
            </div>
            <div className="bg-white/95 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">40%</div>
              <div className="text-gray-600">Better hire quality</div>
            </div>
            <div className="bg-white/95 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">60%</div>
              <div className="text-gray-600">Less time wasted</div>
            </div>
          </div>

          <div className="bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-2">
              We publish only validated customer evidence.
            </p>
            <p className="text-gray-500">
              Case studies and verified client testimonials will appear here as soon as they are approved for publication.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 sm:p-10 shadow-xl">
          <h2 className="headline-platform-dark text-3xl sm:text-4xl mb-4">
            Ready to Experience Better Hiring?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Replace scattered hiring steps with one professional workflow your HR team can trust — from job post to
            interview scheduling.
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
