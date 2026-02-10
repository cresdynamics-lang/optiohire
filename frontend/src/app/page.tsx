'use client'

import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/ui/error-boundary'
// Disable SSR for NeuralNetworkHero to avoid dependency issues with troika-three-text
const NeuralNetworkHero = dynamic(
  () => {
    return import('@/components/ui/neural-network-hero')
      .then((mod) => {
        if (!mod || !mod.default) {
          throw new Error('NeuralNetworkHero component not found')
        }
        return mod
      })
      .catch((err) => {
        console.error('Failed to load NeuralNetworkHero:', err)
        // Return a fallback component
        return {
          default: function NeuralNetworkHeroFallback() {
            return (
              <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-4">Hire Smarter. Not Harder.</h1>
                  <p className="text-gray-400 mb-8">OptioHire helps teams identify job-ready talent faster by focusing on real skills, readiness, and role fit — not just resumes.</p>
                </div>
              </div>
            )
          }
        }
      })
  },
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Transform Your Hiring Process with AI Precision</h1>
          <p className="text-gray-400 mb-8">Transform your hiring process with intelligent automation, advanced analytics, and bias-free candidate screening.</p>
        </div>
      </div>
    ),
  }
)
// Load homepage content immediately on client - no lazy loading delay
// This ensures features are available on first load
const HomePageContent = dynamic(
  () => {
    return import('./homepage-content')
      .then((mod) => {
        if (!mod || !mod.default) {
          throw new Error('HomePageContent component not found')
        }
        return mod
      })
      .catch((err) => {
        console.error('Failed to load HomePageContent:', err)
        // Return a fallback component
        return {
          default: function HomePageContentFallback() {
            return (
              <div className="py-20 text-center text-white">
                <p>Failed to load content. Please refresh the page.</p>
              </div>
            )
          }
        }
      })
  },
  {
    ssr: true,
    loading: () => <div className="py-20 text-center text-white">Loading content...</div>
  }
)

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OptioHire",
  "description": "AI-powered recruitment platform that helps teams identify job-ready talent faster",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}

export default function HomePage() {
  const router = useRouter()

  return (
    <ErrorBoundary>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="min-h-screen relative bg-black">
        {/* Neural Network Hero Section */}
        <ErrorBoundary fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">Hire Smarter. Not Harder.</h1>
              <p className="text-gray-400 mb-8">OptioHire helps teams identify job-ready talent faster by focusing on real skills, readiness, and role fit — not just resumes.</p>
              <p className="text-sm text-gray-500 mb-8">Built for modern teams hiring in fast-moving markets like Nairobi.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Request a Demo
                </button>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        }>
          <NeuralNetworkHero
            title="Hire Smarter. Not Harder."
            description="OptioHire helps teams identify job-ready talent faster by focusing on real skills, readiness, and role fit — not just resumes."
            badgeText="Built for Africa"
            badgeLabel="Local"
            ctaButtons={[
              {
                text: "Request a Demo",
                href: "/auth/signup",
                onClick: () => router.push('/auth/signup'),
                primary: true
              },
              {
                text: "Sign In",
                href: "/auth/signin",
                onClick: () => router.push('/auth/signin')
              }
            ]}
          />
        </ErrorBoundary>

        {/* Lazy load content below the fold with Suspense boundary */}
        <ErrorBoundary fallback={null}>
          <Suspense fallback={
            <div className="min-h-[400px] bg-black flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <HomePageContent />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}