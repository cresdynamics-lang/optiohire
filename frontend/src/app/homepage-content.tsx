'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Users, Target, Shield, CheckCircle, TrendingUp, Zap } from 'lucide-react'

export default function HomePageContent() {
  const router = useRouter()

  return (
    <div>
      {/* What OptioHire Changes - Outcomes Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        {/* Tech background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              What OptioHire Changes
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real outcomes that transform how teams hire, from the moment candidates apply to the day they start.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Clock,
                title: "3x Faster Hiring",
                description: "Reduce time-to-hire from weeks to days with intelligent automation and smart candidate matching.",
                metric: "75% less time"
              },
              {
                icon: Target,
                title: "40% Better Hires",
                description: "Improve hire quality with data-driven insights that predict long-term success and cultural fit.",
                metric: "Higher retention"
              },
              {
                icon: TrendingUp,
                title: "60% Cost Savings",
                description: "Cut recruitment costs dramatically while maintaining quality standards and compliance.",
                metric: "Lower expenses"
              }
            ].map((outcome, index) => (
              <motion.div
                key={outcome.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl border border-gray-800/50 rounded-xl p-8 text-center hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                  <outcome.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{outcome.title}</h3>
                <p className="text-gray-300 mb-4">{outcome.description}</p>
                <div className="text-teal-400 font-semibold">{outcome.metric}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview - 3 Steps Short */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              A simple 3-step process that brings clarity and confidence to every hiring decision.
            </p>
            <button
              onClick={() => router.push('/how-it-works')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-lg hover:from-teal-500 hover:to-teal-400 transition-all duration-200 shadow-lg shadow-teal-500/30"
            >
              See Full Process
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Smart Screening",
                description: "AI analyzes resumes and applications to identify candidates with the specific skills your role requires."
              },
              {
                step: "2",
                title: "Fair Evaluation",
                description: "Each candidate receives an objective assessment, reducing bias and ensuring consistent evaluation criteria."
              },
              {
                step: "3",
                title: "Confident Decisions",
                description: "Teams receive clear recommendations with detailed insights, making confident hiring choices."
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white shadow-lg shadow-teal-500/40">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Preview */}
      <section className="py-20 px-4 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/20 to-transparent"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Built for Every Hiring Scenario
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Whether you're a startup hiring fast or an enterprise managing complex recruitment,
              OptioHire adapts to your needs.
            </p>
            <button
              onClick={() => router.push('/use-cases')}
              className="inline-flex items-center px-6 py-3 border-2 border-teal-500 text-teal-400 font-semibold rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/30"
            >
              Explore Use Cases
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Startups", description: "Hiring fast in competitive markets" },
              { name: "Growing SMEs", description: "Scaling teams efficiently" },
              { name: "HR Teams", description: "Managing high-volume recruitment" },
              { name: "Specialized Roles", description: "Finding technical experts" }
            ].map((useCase, index) => (
              <motion.div
                key={useCase.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-gradient-to-br from-gray-900/60 to-gray-950/60 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6 text-center hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{useCase.name}</h3>
                <p className="text-gray-400 text-sm">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-black to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Trust & Security First
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Your data and your candidates' privacy are protected with enterprise-grade security
              and responsible AI practices.
            </p>
            <button
              onClick={() => router.push('/trust-security')}
              className="inline-flex items-center px-6 py-3 border-2 border-gray-700 text-gray-300 font-semibold rounded-lg hover:border-white hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Learn About Security
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Data Protection",
                description: "GDPR compliant with end-to-end encryption for all sensitive information."
              },
              {
                icon: Users,
                title: "Bias Reduction",
                description: "Built-in algorithms that minimize unconscious bias in hiring decisions."
              },
              {
                icon: CheckCircle,
                title: "Transparent AI",
                description: "Human oversight with clear explanations of how AI recommendations are made."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
