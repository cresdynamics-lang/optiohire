'use client'

import { useRouter } from 'next/navigation'
import HomePageContent from './homepage-content'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OptioHire',
  description: 'AI-powered recruitment platform that helps teams identify job-ready talent faster',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function HomePage() {
  const router = useRouter()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-black">
        {/* Simple static hero - same pattern as other pages */}
        <section className="py-20 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-figtree font-semibold mb-6 text-white">
              Hire Smarter. Not Harder.
            </h1>
            <p className="text-lg font-figtree font-light text-gray-300 mb-8">
              OptioHire helps teams identify job-ready talent faster by focusing on real skills, readiness, and role fit — not just resumes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-colors"
              >
                Request a Demo
              </button>
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-6 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-teal-500 hover:text-teal-400 transition-colors"
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
