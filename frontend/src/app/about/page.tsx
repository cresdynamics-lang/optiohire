import { Metadata } from 'next'
import AboutContent from './about-content'

export const metadata: Metadata = {
  title: 'Our Story | OptioHire — Built in Nairobi for Skills-First Hiring',
  description:
    'OptioHire is an AI-powered recruitment platform by Cres Dynamics in Nairobi. Learn our mission: fair, skills-first hiring for startups, SMEs, enterprise HR, NGOs, and institutions across Kenya.',
  keywords:
    'about optiohire, cres dynamics nairobi, AI recruitment africa, skills-first hiring kenya, HR tech nairobi',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return <AboutContent />
}
