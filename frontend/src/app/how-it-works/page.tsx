import { Metadata } from 'next'
import HowItWorksContent from './how-it-works-content'

export const metadata: Metadata = {
  title: 'From 300 Applications to Top 5 | OptioHire',
  description:
    'Understand how OptioHire works: create a role, receive applications, scan candidates fairly, send automated shortlist/rejection updates, and schedule interviews.',
  keywords:
    'how optiohire works, HR hiring workflow, candidate screening, shortlist automation, interview scheduling',
}

export default function HowItWorksPage() {
  return <HowItWorksContent />
}
