'use client'

import Image from 'next/image'
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
    <footer className="bg-black relative h-fit overflow-hidden pt-8 sm:pt-6">
      {/* Mobile and tablet separator line above footer */}
      <div className="block lg:hidden w-full h-px bg-gray-700 mb-6"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-6 md:py-8 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 lg:gap-8 pb-6">
          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-medium mb-3 font-figtree tracking-wide uppercase">
              {footerSections[0].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[0].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-figtree font-light hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-xs font-medium mb-3 font-figtree tracking-wide uppercase">
              {footerSections[1].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[1].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-figtree font-light hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white text-xs font-medium mb-3 font-figtree tracking-wide uppercase">
              {footerSections[2].title}
            </h4>
            <ul className="space-y-2">
              {footerSections[2].links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-figtree font-light hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-white text-xs font-medium mb-3 font-figtree tracking-wide uppercase">
              Contact & Social
            </h4>
            <ul className="space-y-3 mb-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-start space-x-2 group">
                  <div className="mt-0.5 text-gray-400 group-hover:text-white transition-colors duration-200">
                    {item.icon}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-white hover:text-gray-300 transition-colors font-figtree font-light hover:underline decoration-white decoration-1 underline-offset-4"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400 font-figtree font-light">
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
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-800 mt-6 mb-4" />

        {/* Footer bottom */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-500 font-figtree font-light">
            &copy; 2026 OptioHire. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
