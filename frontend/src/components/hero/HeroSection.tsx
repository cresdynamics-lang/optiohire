'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Briefcase, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroDashboard from '@/components/hero/HeroDashboard'

interface HeroSectionProps {
  role: 'hr' | 'candidate'
  setRole: (role: 'hr' | 'candidate') => void
}

export default function HeroSection({ role, setRole }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 py-11 md:px-10 lg:px-14">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-3/5 opacity-70"
        style={{ background: 'radial-gradient(ellipse at 70% 40%, #e4e4f0 0%, transparent 65%)' }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Toggle Switch */}
        <div className="flex justify-center md:justify-start mb-8">
          <div className="bg-slate-100 p-1.5 rounded-full flex items-center border border-slate-200 shadow-sm">
            <button
              onClick={() => setRole('hr')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                role === 'hr'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              I'm a Hiring Manager
            </button>
            <button
              onClick={() => setRole('candidate')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                role === 'candidate'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <User className="w-4 h-4" />
              I'm a Job Seeker
            </button>
          </div>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* ── LEFT ── */}
          <div className="transition-all duration-500 min-h-[400px]">
            {role === 'hr' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="headline-platform text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2a2a7a]">
                  The hiring command center for HR teams.
                </h1>

                <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                  Post roles, receive applications, auto-screen candidates, and move to interviews with full
                  transparency. OptioHire gives your team a faster, fairer, and more professional recruitment workflow.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="gap-2 rounded-2xl bg-slate-900 px-7 py-6 text-base font-semibold text-white hover:bg-black">
                    <Link href="/auth/options?mode=signup">Get Started <ArrowRight className="ml-1 inline h-5 w-5" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-300 bg-white/90 px-7 py-6 text-base font-medium text-slate-700 hover:bg-slate-50">
                    <Link href="/auth/options?mode=signin">Sign In</Link>
                  </Button>
                </div>

                <p className="mt-8 text-sm font-medium text-slate-500">Built for HR managers and hiring managers</p>

                <ul className="mt-4 flex flex-col gap-3">
                  {[
                    'One place for jobs, applications, and interview decisions',
                    'Consistent candidate scoring with transparent reasoning',
                    'Automated applicant updates for shortlist and rejection outcomes',
                  ].map((text, i) => (
                    <li key={text} className="oh-feat flex items-center gap-3 text-base text-slate-600">
                      <span className="oh-tick-wrap relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#15a36b]">
                        <span className="oh-tick-fill absolute inset-0 rounded-full bg-[#15a36b]" />
                        <svg viewBox="0 0 9 9" className="relative z-10 h-3 w-3">
                          <path
                            d="M1.5 4.5L3.8 7 7.5 2.5"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="headline-platform text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#15a36b]">
                  The career growth hub for modern professionals.
                </h1>

                <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
                  Find the best roles, apply seamlessly, and track your progress with full transparency.
                  OptioHire helps you stand out and land your next big opportunity faster.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="gap-2 rounded-2xl bg-[#15a36b] px-7 py-6 text-base font-semibold text-white hover:bg-[#118255]">
                    <Link href="https://applications.optiohire.com/auth/signup">Apply Now <ArrowRight className="ml-1 inline h-5 w-5" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-300 bg-white/90 px-7 py-6 text-base font-medium text-slate-700 hover:bg-slate-50">
                    <Link href="https://applications.optiohire.com/auth/signin">Sign In</Link>
                  </Button>
                </div>

                <p className="mt-8 text-sm font-medium text-slate-500">Built for ambitious job seekers</p>

                <ul className="mt-4 flex flex-col gap-3">
                  {[
                    'One unified profile to apply for multiple roles',
                    'Transparent tracking of your application status',
                    'Direct communication and interview scheduling',
                  ].map((text, i) => (
                    <li key={text} className="oh-feat flex items-center gap-3 text-base text-slate-600">
                      <span className="oh-tick-wrap relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#2a2a7a]">
                        <span className="oh-tick-fill absolute inset-0 rounded-full bg-[#2a2a7a]" />
                        <svg viewBox="0 0 9 9" className="relative z-10 h-3 w-3">
                          <path
                            d="M1.5 4.5L3.8 7 7.5 2.5"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── RIGHT – animated dashboard card ── */}
          <div className="flex h-full items-stretch">
            <HeroDashboard role={role} />
          </div>
        </div>
      </div>
    </section>
  )
}
