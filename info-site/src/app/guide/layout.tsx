import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Guide | How to Master OptioHire',
  description: 'Everything you need to know about using OptioHire: Watcher Engine AI, 3-channel applications, talent pools, and interview scheduling.',
  keywords: 'optiohire guide, HR software tutorial, AI hiring manual, recruitment automation help'
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
