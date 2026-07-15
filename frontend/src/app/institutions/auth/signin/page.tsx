'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react'

export default function InstitutionSignInPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const res = await fetch(`/api/institutions/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Sign-in failed')
                return
            }
            localStorage.setItem('institution_token', data.token)
            localStorage.setItem('institution_data', JSON.stringify(data.institution))
            localStorage.setItem('institution_user', JSON.stringify(data.user))
            router.push(`/institutions/${data.institution.id}`)
        } catch {
            setError('Network error — please try again')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0A1929 0%, #0F2744 45%, #1E3A5F 100%)' }}>
            <div className="w-full max-w-md flex flex-col gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="self-start flex items-center gap-2 text-sm text-sky-200 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: '#F1F5F9', border: '1px solid #E2E8F0' }}
                >
                    <div className="p-8 pb-6" style={{ background: '#0F2744' }}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#2563EB', color: '#fff' }}>
                                O
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">OptioHire</div>
                                <div className="text-xs tracking-widest uppercase" style={{ color: '#93C5FD' }}>Institution Console</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE', color: '#1E3A5F' }}>
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Institution Login</h1>
                                <p className="text-sm" style={{ color: '#475569' }}>Career Services Portal</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="careers@university.edu"
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
                                    style={{ border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A' }}
                                    onFocus={e => e.target.style.borderColor = '#2563EB'}
                                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Password</label>
                                    <Link href="/institutions/auth/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#2563EB' }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                        className="w-full px-4 py-3 pr-12 rounded-xl text-sm border outline-none transition-all"
                                        style={{ border: '1px solid #E2E8F0', background: '#fff', color: '#0F172A' }}
                                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                                        onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                                    style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                                    {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                                style={{ background: loading ? '#93C5FD' : '#2563EB' }}
                            >
                                {loading ? 'Signing in…' : 'Sign in to Console'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                <p className="text-center text-sm -mt-2" style={{ color: '#93C5FD' }}>
                    Not an institution admin? <Link href="/hr/auth/signin" className="font-semibold text-white hover:underline">Employer login →</Link>
                </p>
            </div>
        </div>
    )
}
