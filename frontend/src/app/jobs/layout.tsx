import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Open Jobs | OptioHire - AI-Powered Career Opportunities',
  description: 'Browse curated job openings from leading companies. Apply directly and get fairly evaluated by AI-powered smart screening.',
  keywords: 'job search kenya, tech jobs nairobi, AI recruitment portal, apply for jobs, remote jobs africa'
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
