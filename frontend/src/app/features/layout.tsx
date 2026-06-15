import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | OptioHire - AI-Powered Recruitment Tools',
  description: 'Explore OptioHire features: AI candidate screening, intelligent pipelines, automated workflows, and advanced recruitment analytics.',
  keywords: 'AI recruitment features, automated screening tool, hiring pipeline automation, recruitment analytics dashboard'
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
