import { Metadata } from 'next'
import UseCasesContent from './use-cases-content'

export const metadata: Metadata = {
  title: 'Use Cases | OptioHire for Kenyan Hiring Teams',
  description:
    'See how OptioHire fits startups, scaling SMEs, enterprise HR, and NGOs in Kenya - skills-first screening, shared scorecards, and auditable hiring decisions.',
  keywords:
    'skills-first hiring use cases, startup hiring Kenya, SME recruitment, enterprise HR, NGO hiring, OptioHire',
  alternates: {
    canonical: '/use-cases',
  },
}

export default function UseCasesPage() {
  return <UseCasesContent />
}
