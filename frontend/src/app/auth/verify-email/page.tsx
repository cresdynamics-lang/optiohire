'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle, KeyRound } from 'lucide-react'

const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only numbers')
})

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema)
  })

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  const handleResendCode = async () => {
    if (!email) return
    setResendLoading(true)
    setResendMessage(null)
    setError(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/send-signup-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: email.split('@')[0] })
      })
      const result = await response.json()
      if (response.ok && !result?.codeSaved) {
        setResendMessage('New code sent. Check your email.')
      } else if (response.ok && result?.codeSaved) {
        setResendMessage('Code could not be sent. Check backend email config (Resend/SMTP).')
      } else {
        setResendMessage(result?.error || 'Failed to resend.')
      }
    } catch {
      setResendMessage('Could not resend. Try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!email) {
      setError('Email is missing. Please go back and sign up again.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: data.code })
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result?.error || 'Verification failed. Please check the code and try again.')
        setIsLoading(false)
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    } catch (err) {
      setError('Could not verify. Please ensure the backend is running and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <p className="text-gray-600 mb-4">No email provided. Please complete sign up first.</p>
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Go to Sign up
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Email confirmed</h2>
          <p className="text-gray-600 mb-4">
            You will receive a welcome email from OptioHire shortly. Redirecting to your dashboard…
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/auth/signup')}
          className="mb-4 px-4 py-2 bg-white rounded-full flex items-center gap-2 hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign up
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 font-figtree">
                Confirm your email
              </h1>
              <p className="text-gray-600 font-figtree text-sm">
                We sent a 6-digit code to <span className="font-semibold">{email}</span>. Enter it below.
              </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2 font-figtree">
                  Verification code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="code"
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-figtree text-center text-2xl tracking-widest"
                    {...form.register('code')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                      form.setValue('code', value)
                    }}
                  />
                </div>
                {form.formState.errors.code && (
                  <p className="text-sm text-red-500 mt-1 font-figtree">{form.formState.errors.code.message}</p>
                )}
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-figtree">{error}</p>
                </div>
              )}
              {resendMessage && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-figtree">{resendMessage}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || isLoading}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-figtree"
                >
                  {resendLoading ? 'Sending…' : 'Resend code'}
                </button>
                <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-figtree"
              >
                {isLoading ? 'Verifying…' : 'Confirm email'}
              </button>
              </div>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500 font-figtree">
              After confirming, you’ll receive a welcome email from OptioHire.
            </p>
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 font-figtree mb-2">Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || isLoading}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-figtree underline underline-offset-2"
              >
                {resendLoading ? 'Sending…' : 'Send another code'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading…</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
