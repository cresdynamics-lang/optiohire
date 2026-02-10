'use client'

import { Mail, Phone, MapPin, Shield, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ACCENT = '#2D2DDD'

const cardVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } })
}

interface ContactSectionProps {
  overlay?: boolean
}

export default function ContactSection({ overlay = false }: ContactSectionProps) {
  const schema = z.object({
    name: z.string().min(2, 'Name is too short'),
    email: z.string().email('Enter a valid email'),
    subject: z.string().min(3, 'Subject is required'),
    message: z.string().min(10, 'Message must be at least 10 characters')
  })

  type FormValues = z.infer<typeof schema>

  const { register, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur'
  })

  const onSubmit = async (values: FormValues) => {
    // Simulate async submit; integrate API when available
    await new Promise((r) => setTimeout(r, 800))
    console.log('Contact form submitted', values)
    reset()
  }

  return (
    <div className={`${overlay ? 'absolute inset-0 z-20' : 'relative z-20'} w-full pointer-events-none py-8 sm:py-12 md:py-16 overflow-visible`}>
      <div className={`${overlay ? 'min-h-full' : ''} flex items-start justify-center px-4 sm:px-6 pt-8 sm:pt-12`}>
        <div className="w-full max-w-6xl py-4 sm:py-6 pb-32 sm:pb-20 md:pb-64 lg:pb-24">
          <motion.div 
            initial={{ opacity: 1, y: 0 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="text-center mb-6 sm:mb-8 md:mb-10"
          >
            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white/90 text-xs sm:text-sm mb-4" style={{ boxShadow: `0 0 32px ${ACCENT}30` }}>
              We're here to help
            </span>
            <h2 className="text-white text-[27px] sm:text-[57px] md:text-[69px] font-extralight font-figtree leading-[1.05] tracking-tight mb-3 sm:mb-4">
              Contact Us
            </h2>
            <p className="text-white/70 text-base sm:text-xl font-figtree font-light max-w-2xl mx-auto mt-2 sm:mt-3 px-2">
              Reach out any time. Our team responds quickly and securely.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:mb-12">
            {/* Left: vertical info cards */}
            <div className="space-y-3 sm:space-y-4">
              {leftCards.map((card, i) => (
                <motion.div 
                  key={card.title}
                  variants={cardVariants}
                  initial="visible"
                  animate="visible"
                  custom={i}
                  className="pointer-events-auto group relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-5 md:p-6 transition-all duration-300 hover:border-[var(--accent)]/50 hover:bg-white/15"
                  style={{ ['--accent' as any]: ACCENT, boxShadow: `0 10px 40px -10px ${ACCENT}33` }}
                >
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ background: ACCENT }} />
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border border-white/20" style={{ background: `${ACCENT}22` }}>
                      <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-[11px] sm:text-[15px] font-semibold tracking-tight mb-1">{card.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm leading-relaxed break-words">{card.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Contact form */}
            <motion.form 
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-auto relative rounded-[20px] sm:rounded-[24px] border border-white/20 bg-white/10 backdrop-blur-xl p-4 sm:p-5 md:p-6 lg:p-8"
              aria-label="Contact form"
            >
              <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full opacity-10 blur-2xl" style={{ background: ACCENT }} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1">
                  <label htmlFor="name" className="block text-white/90 text-xs sm:text-sm mb-1.5 sm:mb-2">Full name</label>
                  <input id="name" {...register('name')} className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 sm:py-3 text-xs sm:text-base text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[--accent] transition-all" placeholder="Jane Doe" aria-invalid={!!formState.errors.name} />
                  {formState.errors.name && <p className="mt-1 text-xs text-red-300">{formState.errors.name.message}</p>}
                </div>
                <div className="col-span-1">
                  <label htmlFor="email" className="block text-white/90 text-xs sm:text-sm mb-1.5 sm:mb-2">Email</label>
                  <input id="email" type="email" {...register('email')} className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 sm:py-3 text-xs sm:text-base text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[--accent] transition-all" placeholder="you@example.com" aria-invalid={!!formState.errors.email} />
                  {formState.errors.email && <p className="mt-1 text-xs text-red-300">{formState.errors.email.message}</p>}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="subject" className="block text-white/90 text-xs sm:text-sm mb-1.5 sm:mb-2">Subject</label>
                  <input id="subject" {...register('subject')} className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 sm:py-3 text-xs sm:text-base text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[--accent] transition-all" placeholder="How can we help?" aria-invalid={!!formState.errors.subject} />
                  {formState.errors.subject && <p className="mt-1 text-xs text-red-300">{formState.errors.subject.message}</p>}
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="message" className="block text-white/90 text-xs sm:text-sm mb-1.5 sm:mb-2">Message</label>
                  <textarea id="message" rows={5} {...register('message')} className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 sm:py-3 text-xs sm:text-base text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-[--accent] resize-y min-h-[120px] transition-all" placeholder="Write your message..." aria-invalid={!!formState.errors.message} />
                  {formState.errors.message && <p className="mt-1 text-xs text-red-300">{formState.errors.message.message}</p>}
                </div>
              </div>
              <div className="mt-4 sm:mt-5 flex items-center justify-end">
                <button type="submit" disabled={formState.isSubmitting} className="inline-flex items-center gap-2 rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-base text-white transition-colors disabled:opacity-60 font-medium" style={{ background: ACCENT }}>
                  <Send className="w-4 h-4" />
                  {formState.isSubmitting ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </motion.form>
          </div>
          
          {/* Mobile-only white separator line below contact form */}
          <div className="block sm:hidden w-full h-px bg-white/20 mt-8 mb-4"></div>
        </div>
      </div>
    </div>
  )
}

// Left-side vertical cards (only the four requested)
const leftCards = [
  {
    title: 'Email',
    desc: 'support@hraigagent.com',
    icon: Mail
  },
  {
    title: 'Phone',
    desc: '+1 (555) 123-4567',
    icon: Phone
  },
  {
    title: 'Headquarters',
    desc: 'New York, USA',
    icon: MapPin
  },
  {
    title: 'Security & Compliance',
    desc: 'Enterprise-grade encryption and data protection.',
    icon: Shield
  }
]


