import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomePageContent from './homepage-content'
import HeroDashboard from '@/components/hero/HeroDashboard'
import HeroSection from '@/components/hero/HeroSection'
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'OptioHire',
  description: 'OptioHire helps HR teams run faster, fairer hiring with automated applicant screening, transparent scoring, and interview-ready shortlists.',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="min-h-screen bg-[#f7f7f8]">
        <HeroSection />

        <HomePageContent />
      </div>
    </>
  )
}

