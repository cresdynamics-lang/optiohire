'use client'

import Link from 'next/link'
import {
  Mail,
  MapPin,
  Instagram,
  X,
  Linkedin,
} from 'lucide-react'

export function Footer() {
  // Footer sections as per requirements
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "How It Works", href: "/how-it-works" },
        { label: "Features", href: "/features" },
        { label: "Why Us", href: "/why-optiohire" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About OptioHire", href: "/about" },
        { label: "Built by Cres Dynamics", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ]

  // Contact info
  const contactInfo = [
    {
      icon: <Mail size={16} className="text-gray-400" />,
      text: "support@optiohire.com",
      href: "mailto:support@optiohire.com",
    },
    {
      icon: <MapPin size={16} className="text-gray-400" />,
      text: "Nairobi, Kenya",
    },
  ]

  // Social media icons (LinkedIn, X, Instagram)
  const socialLinks = [
    { icon: <Linkedin size={20} />, label: "LinkedIn", href: "#" },
    { icon: <X size={20} />, label: "X", href: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", href: "#" },
  ]

  return (
    <footer className="relative h-fit overflow-hidden border-t border-slate-200 bg-slate-950 pt-10 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_45%)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-10 sm:px-8 md:px-12">
        <div className="mb-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-200">OptioHire</p>
            <p className="mt-1 text-sm text-slate-300">Modern recruitment infrastructure for high-performing teams.</p>
          </div>
          <Link
            href="/auth/signup"
            className="inline-flex w-fit items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-blue-50"
          >
            Get Started
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-100">
              {footerSections[0].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[0].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-slate-300 transition-all duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-100">
              {footerSections[1].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[1].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-slate-300 transition-all duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-100">
              {footerSections[2].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[2].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-sm text-slate-300 transition-all duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-100">
              Contact & Social
            </h4>
            <ul className="space-y-3 mb-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-start space-x-2 group">
                  <div className="mt-0.5 text-slate-400 transition-colors duration-200 group-hover:text-blue-300">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-slate-300 transition-colors hover:text-white hover:underline decoration-blue-300 decoration-1 underline-offset-4"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-300">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {/* Social icons */}
            <div className="flex space-x-3">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 transition-all duration-200 hover:border-blue-300 hover:bg-blue-400/20 hover:text-white"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="mb-4 mt-6 border-t border-white/10" />

        {/* Footer bottom */}
        <div className="text-center pb-4">
          <p className="text-xs text-slate-400">
            &copy; 2026 OptioHire. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
