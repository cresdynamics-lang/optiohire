'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Mail, MapPin, Shield } from 'lucide-react'

const PRODUCT = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Use cases', href: '/use-cases' },
  { label: 'Refer a friend', href: '/refer' },
]

const COMPANY = [
  { label: 'About OptioHire', href: '/about' },
  { label: 'Case studies', href: '/customers' },
  { label: 'Resources', href: '/blog' },
]

const LEGAL = [
  { label: 'Privacy policy', href: '/privacy' },
  { label: 'Security & compliance', href: '/security' },
]

const PORTALS = [
  { label: 'Employers', hint: 'HR workspace', href: '/hr/auth/signin' },
  { label: 'Candidates', hint: 'Browse & apply', href: '/jobs' },
  { label: 'Institutions', hint: 'Campus console', href: '/institutions' },
]

const SIGNALS = ['Skills-first', 'Fair scoring', 'Audit-ready', 'Built in Nairobi', 'Kenya · East Africa']

const XIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.251 5.69L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
)

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-1 text-[15px] text-[#c8cdd8] transition-colors duration-200 hover:text-white"
    >
      <span>{children}</span>
      <span
        className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#7dd3c0] transition-all duration-300 group-hover:w-full"
        aria-hidden
      />
    </Link>
  )
}

export function Footer() {
  const reduce = useReducedMotion()
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#0e1118] text-[#e8eaef]">
      {/* Atmosphere — ink + cool teal, not purple bloom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(45,45,221,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(20,184,166,0.1), transparent 50%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
        aria-hidden
      />

      {/* Signal ticker */}
      <div className="relative border-b border-white/[0.07] bg-black/20">
        <div className="overflow-hidden py-3">
          <div
            className={`flex w-max gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8b93a7] ${
              reduce ? '' : 'oh-footer-marquee'
            }`}
          >
            {[...SIGNALS, ...SIGNALS, ...SIGNALS].map((s, i) => (
              <span key={`${s}-${i}`} className="inline-flex items-center gap-10">
                {s}
                <span className="text-[#2D2DDD]/80" aria-hidden>
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Statement band */}
        <div className="grid gap-10 border-b border-white/[0.07] py-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16 lg:py-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7dd3c0]/90">
              OptioHire · Cres Dynamics
            </p>
            <p className="mt-4 max-w-xl font-[family-name:var(--font-display-italic)] text-[clamp(2.1rem,5vw,3.75rem)] italic leading-[1.05] tracking-tight text-white">
              Hire on capability —
              <span className="text-[#7dd3c0]"> not CV volume.</span>
            </p>
          </div>
          <div className="flex flex-col gap-5 lg:items-end lg:text-right">
            <p className="max-w-sm text-sm leading-relaxed text-[#9aa3b5] lg:ml-auto">
              Skills-first screening for Kenyan teams that need fair shortlists, clear scorecards,
              and decisions they can stand behind.
            </p>
            <Link
              href="/refer"
              className="group inline-flex items-center gap-2 self-start font-[family-name:var(--font-display-italic)] text-xl italic text-white transition-colors hover:text-[#7dd3c0] lg:self-end"
            >
              Share with a friend
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Portal rails + link columns */}
        <div className="grid gap-12 py-12 lg:grid-cols-[1.1fr_1.5fr] lg:gap-16 lg:py-14">
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7386]">
              Enter a workspace
            </p>
            <ul className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {PORTALS.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <div>
                      <p className="text-base font-medium text-white group-hover:text-[#7dd3c0]">
                        {p.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b7386]">{p.hint}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#4a5163] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#7dd3c0]" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#8b93a7]">
              <a
                href="mailto:developer@optiohire.com"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden />
                developer@optiohire.com
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Nairobi, Kenya
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10">
            <nav aria-label="Product">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7386]">
                Product
              </p>
              <ul className="space-y-3">
                {PRODUCT.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Company">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7386]">
                Company
              </p>
              <ul className="space-y-3">
                {COMPANY.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Legal" className="col-span-2 sm:col-span-1">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7386]">
                Legal
              </p>
              <ul className="space-y-3">
                {LEGAL.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Giant brand floor */}
        <div className="relative border-t border-white/[0.07] pt-10 pb-4">
          <Link href="/" className="group relative block overflow-hidden" aria-label="OptioHire home">
            <div className="flex items-end gap-4">
              <Image
                src="/assets/logo/optiohire_mark_light.png"
                alt=""
                width={48}
                height={48}
                className="mb-2 h-10 w-10 object-contain opacity-90 transition group-hover:opacity-100 sm:mb-3 sm:h-12 sm:w-12"
              />
              <span className="block translate-y-1 font-[family-name:var(--font-display-italic)] text-[clamp(3.5rem,14vw,9.5rem)] italic leading-[0.82] tracking-[-0.04em] text-white/[0.07] transition-colors duration-500 group-hover:text-white/[0.12]">
                OptioHire
              </span>
            </div>
          </Link>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#6b7386]">
              <span>© {year} OptioHire</span>
              <span className="hidden text-white/15 sm:inline" aria-hidden>
                /
              </span>
              <span>
                Built by{' '}
                <a
                  href="https://cresdynamics.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9aa3b5] underline-offset-2 transition-colors hover:text-white hover:underline"
                >
                  Cres Dynamics
                </a>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[
                {
                  label: 'LinkedIn',
                  href: 'https://www.linkedin.com/company/optiohire',
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                { label: 'X', href: 'https://x.com/optiohire', icon: <XIcon /> },
                {
                  label: 'Instagram',
                  href: 'https://www.instagram.com/optiohire',
                  icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#8b93a7] transition-all duration-200 hover:border-[#7dd3c0]/40 hover:bg-white/[0.04] hover:text-[#7dd3c0]"
                >
                  {s.icon}
                </a>
              ))}
              <Link
                href="/admin/login"
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] text-[#4a5163] transition hover:border-white/15 hover:text-[#8b93a7]"
                aria-label="Admin login"
                title="Admin login"
              >
                <Shield className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
