'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Link2, Mail, MessageCircle, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SHARE_URL = 'https://optiohire.com'
const SHARE_TEXT =
  'Check out OptioHire — skills-first hiring for Kenyan teams. Fair shortlists, clear scorecards.'

export function ReferContent() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'OptioHire', text: SHARE_TEXT, url: SHARE_URL })
      } else {
        await handleCopy()
      }
    } catch {
      // ignore abort
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent('Thought you would like OptioHire')}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`

  return (
    <main className="min-h-[70vh] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,45,221,0.12),transparent),linear-gradient(180deg,#f7f8fc_0%,#eef0f5_100%)]">
      <section className="px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2D2DDD]">
            Grow the circle
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display-italic)] text-4xl italic tracking-tight text-[#0c121c] sm:text-5xl">
            Refer a friend
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#0c121c]/70 sm:text-lg">
            Know a hiring lead, campus partner, or teammate who should see OptioHire? Share the
            product with them in one tap.
          </p>

          <div className="mt-10 space-y-3 text-left">
            <Button
              type="button"
              onClick={handleNativeShare}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2D2DDD] text-base font-semibold text-white hover:bg-[#2525c4]"
            >
              <Share2 className="h-5 w-5" aria-hidden />
              Share with a friend
            </Button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#0c121c]/12 bg-white text-sm font-medium text-[#0c121c] transition hover:border-[#2D2DDD]/40 hover:bg-[#f4f5f9]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden />
                WhatsApp
              </a>
              <a
                href={mailto}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#0c121c]/12 bg-white text-sm font-medium text-[#0c121c] transition hover:border-[#2D2DDD]/40 hover:bg-[#f4f5f9]"
              >
                <Mail className="h-4 w-4 text-[#2D2DDD]" aria-hidden />
                Email
              </a>
              <a
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#0c121c]/12 bg-white text-sm font-medium text-[#0c121c] transition hover:border-[#2D2DDD]/40 hover:bg-[#f4f5f9]"
              >
                <Link2 className="h-4 w-4 text-[#0A66C2]" aria-hidden />
                LinkedIn
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#0c121c]/12 bg-white text-sm font-medium text-[#0c121c] transition hover:border-[#2D2DDD]/40 hover:bg-[#f4f5f9]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                    Link copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-10 text-sm text-[#0c121c]/55">
            Or send them straight to{' '}
            <Link href="/" className="font-medium text-[#2D2DDD] underline-offset-2 hover:underline">
              optiohire.com
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
