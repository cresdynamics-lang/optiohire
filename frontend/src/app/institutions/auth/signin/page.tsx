'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com'

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
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f2318 0%, #1F4D3D 50%, #2d6e56 100%)' }}>
            <div className="w-full max-w-md flex flex-col gap-4">
                <button
                    onClick={() => router.push('/')}
                    className="self-start flex items-center gap-2 text-sm text-green-200 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: '#F3F5EF', border: '1px solid #DCE1D5' }}
                >
                    {/* Header */}
                    <div className="p-8 pb-6" style={{ background: '#1F4D3D' }}>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: '#B98A2E', color: '#1F4D3D', fontFamily: 'Fraunces, serif' }}>
                                O
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Fraunces, serif' }}>OptioHire</div>
                                <div className="text-xs tracking-widest uppercase" style={{ color: '#B9D3C6' }}>Institution Console</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E4EEE7', color: '#1F4D3D' }}>
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: '#152A22' }}>Institution Login</h1>
                                <p className="text-sm" style={{ color: '#3E5449' }}>Career Services Portal</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="careers@university.edu"
                                    required
                                    className="w-full px-4 py-3 rounded-xl text-sm border outline-none transition-all"
                                    style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                    onFocus={e => e.target.style.borderColor = '#1F4D3D'}
                                    onBlur={e => e.target.style.borderColor = '#DCE1D5'}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#3E5449' }}>Password</label>
                                    <Link href="/institutions/auth/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#1F4D3D' }}>
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
                                        style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        onFocus={e => e.target.style.borderColor = '#1F4D3D'}
                                        onBlur={e => e.target.style.borderColor = '#DCE1D5'}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                    className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                                    style={{ background: '#F5E3DE', color: '#9C3B2C', border: '1px solid #e8c8c0' }}>
                                    ⚠ {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all"
                                style={{ background: loading ? '#7FA292' : '#1F4D3D' }}
                            >
                                {loading ? 'Signing in…' : 'Sign in to Console'}
                            </button>
                        </form>
                    </div>
                </motion.div>


                <p className="text-center text-sm -mt-2" style={{ color: '#B9D3C6' }}>
                    Not an institution admin? <Link href="/hr/auth/signin" className="font-semibold text-white hover:underline">Employer login →</Link>
                </p>
            </div>
        </div>
    )
}
