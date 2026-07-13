'use client'

import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowRight, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  institutionApplicationSchema,
  type InstitutionApplicationValues,
} from '@/lib/schemas/institution-application'

const FIELD =
  'mt-1.5 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-[#8ea6cf] focus:ring-2 focus:ring-[#8ea6cf]/30'
const LABEL = 'text-xs font-semibold uppercase tracking-[0.12em] text-slate-300'
const ERROR = 'mt-1 text-xs text-[#e0a3a3]'

export function InstitutionApplyDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InstitutionApplicationValues>({
    resolver: zodResolver(institutionApplicationSchema),
    defaultValues: { organizationType: 'enterprise' },
  })

  const onSubmit = async (values: InstitutionApplicationValues) => {
    try {
      const res = await fetch('/api/institution-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to submit application')
      }
      toast.success("Application received — we'll reach out to onboard you shortly.")
      reset({ organizationType: 'enterprise' })
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0f1729] text-slate-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Apply for enterprise onboarding</DialogTitle>
          <DialogDescription className="text-slate-400">
            Tell us about your organization. Our team will reach out to onboard you and coordinate every step.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div>
            <label htmlFor="organizationName" className={LABEL}>Organization name</label>
            <input id="organizationName" className={FIELD} placeholder="Acme University" {...register('organizationName')} />
            {errors.organizationName && <p className={ERROR}>{errors.organizationName.message}</p>}
          </div>

          <div>
            <label htmlFor="organizationType" className={LABEL}>Organization type</label>
            <select id="organizationType" className={`${FIELD} appearance-none`} {...register('organizationType')}>
              <option value="enterprise" className="bg-[#0f1729]">Enterprise / Employer</option>
              <option value="institution" className="bg-[#0f1729]">Institution</option>
              <option value="university" className="bg-[#0f1729]">University / College</option>
              <option value="other" className="bg-[#0f1729]">Other</option>
            </select>
            {errors.organizationType && <p className={ERROR}>{errors.organizationType.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contactName" className={LABEL}>Your name</label>
              <input id="contactName" className={FIELD} placeholder="Jane Doe" {...register('contactName')} />
              {errors.contactName && <p className={ERROR}>{errors.contactName.message}</p>}
            </div>
            <div>
              <label htmlFor="contactEmail" className={LABEL}>Work email</label>
              <input id="contactEmail" type="email" className={FIELD} placeholder="jane@acme.com" {...register('contactEmail')} />
              {errors.contactEmail && <p className={ERROR}>{errors.contactEmail.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contactPhone" className={LABEL}>Phone <span className="text-slate-500">(optional)</span></label>
              <input id="contactPhone" className={FIELD} placeholder="+254 700 000000" {...register('contactPhone')} />
              {errors.contactPhone && <p className={ERROR}>{errors.contactPhone.message}</p>}
            </div>
            <div>
              <label htmlFor="country" className={LABEL}>Country <span className="text-slate-500">(optional)</span></label>
              <input id="country" className={FIELD} placeholder="Kenya" {...register('country')} />
              {errors.country && <p className={ERROR}>{errors.country.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="teamSize" className={LABEL}>Team / cohort size <span className="text-slate-500">(optional)</span></label>
            <input id="teamSize" className={FIELD} placeholder="e.g. 50 hires / 500 students" {...register('teamSize')} />
            {errors.teamSize && <p className={ERROR}>{errors.teamSize.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className={LABEL}>What are you looking to achieve? <span className="text-slate-500">(optional)</span></label>
            <textarea id="message" rows={4} className={`${FIELD} resize-none`} placeholder="Tell us about your hiring goals, timelines, and any requirements." {...register('message')} />
            {errors.message && <p className={ERROR}>{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Apply now <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500">We&apos;ll only use your details to onboard and coordinate with your team.</p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
