import type { Metadata } from 'next'
import { ReferContent } from './refer-content'

export const metadata: Metadata = {
  title: 'Refer a Friend | OptioHire',
  description:
    'Share OptioHire with a friend or teammate — skills-first hiring for Kenyan teams.',
}

export default function ReferPage() {
  return <ReferContent />
}
