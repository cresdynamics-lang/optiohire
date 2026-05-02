 'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormValues } from '@/lib/schemas/contact'

export default function DemoPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      topic: 'Demo Request',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setStatus('idle')
      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '')
      const response = await fetch(`${backend}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, topic: values.topic || 'Demo Request' }),
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.message || 'Failed to submit demo request')
      }
      setStatus('success')
      reset({ topic: 'Demo Request' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Book a Free Demo</h1>
        <p className="mt-3 text-lg text-slate-600">
          Send us your details and we will receive the request on email and get back to you for a live walkthrough.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-4">
          <input {...register('fullName')} placeholder="Full name" className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}

          <input type="email" {...register('email')} placeholder="Work email" className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

          <input {...register('company')} placeholder="Company name" className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.company && <p className="text-sm text-red-600">{errors.company.message}</p>}

          <input {...register('role')} placeholder="Your role (HR Manager, Hiring Manager...)" className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}

          <input {...register('topic')} placeholder="Topic" className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.topic && <p className="text-sm text-red-600">{errors.topic.message}</p>}

          <textarea {...register('message')} rows={5} placeholder="Tell us what roles you are hiring for and what you want to see in the demo." className="rounded-xl border border-slate-300 px-4 py-3" />
          {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}

          {status === 'success' && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              Demo request sent. We have received it on email and will contact you shortly.
            </p>
          )}
          {status === 'error' && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              Failed to send request. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-fit rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send Demo Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
