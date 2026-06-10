'use client'

import { useState } from 'react'
import HeroSection from '@/components/hero/HeroSection'
import HomePageContent from './homepage-content'

export default function HomeClientWrapper() {
  const [role, setRole] = useState<'hr' | 'candidate'>('hr')

  return (
    <>
      <HeroSection role={role} setRole={setRole} />
      <HomePageContent role={role} />
    </>
  )
}
