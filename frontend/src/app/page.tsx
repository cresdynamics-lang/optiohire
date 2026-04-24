'use client'

import { useRouter } from 'next/navigation'
import HomePageContent from './homepage-content'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OptioHire',
  description: 'B2B HR tech SaaS by Cres Dynamics in Nairobi, Kenya, helping companies hire 3x faster through smart screening, fair evaluation, and confident decisions.',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function HomePage() {
  const router = useRouter()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
        <section className="relative py-20 px-4 flex items-center justify-center min-h-[60vh] overflow-hidden">
          <div className="absolute inset-0 hero-dot-grid opacity-55" aria-hidden />
          <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-float-slow" aria-hidden />
          <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl animate-float-slower" aria-hidden />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl animate-float" aria-hidden />
          <div className="text-center max-w-2xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 brand-gradient-text">
              Hire Smarter. Not Harder.
            </h1>
            <p className="text-lg text-slate-600 mb-8">
              Built by Cres Dynamics in Nairobi, OptioHire helps companies hire 3x faster through skills-first evaluation, role readiness, and cultural fit.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25"
              >
                Request a Demo
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-6 py-3 border border-slate-300 bg-white text-slate-700 font-medium rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        <HomePageContent />
      </div>
    </>
  )
}
