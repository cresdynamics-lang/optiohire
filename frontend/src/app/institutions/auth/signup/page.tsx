'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, GraduationCap, Building2 } from 'lucide-react'

export default function InstitutionSignUpPage() {
    const router = useRouter()
    
    // Institution Details
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [country, setCountry] = useState('KE')

    // Admin Details
    const [adminName, setAdminName] = useState('')
    const [adminEmail, setAdminEmail] = useState('')
    const [adminPassword, setAdminPassword] = useState('')
    
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleNameChange = (val: string) => {
        setName(val)
        // Derive slug from name: lower case, alphanumeric, replaced spaces/special characters with hyphens
        const derivedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        setSlug(derivedSlug)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await fetch(`/api/institutions/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    slug,
                    contact_email: contactEmail,
                    country,
                    admin_email: adminEmail,
                    admin_name: adminName,
                    admin_password: adminPassword
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Sign-up failed')
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
            <div className="w-full max-w-xl flex flex-col gap-4">
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
                                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: '#152A22' }}>Institution Sign Up</h1>
                                <p className="text-sm" style={{ color: '#3E5449' }}>Register your careers office &amp; create owner account</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Section: Institution Details */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: '#B98A2E', borderColor: '#DCE1D5' }}>
                                    1. Institution Profile
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Institution Name
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => handleNameChange(e.target.value)}
                                            placeholder="Strathmore University"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Custom URL Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={e => setSlug(e.target.value)}
                                            placeholder="strathmore-university"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Careers Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={e => setContactEmail(e.target.value)}
                                            placeholder="careers@university.edu"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Country
                                        </label>
                                        <select
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        >
                                            <option value="KE">Kenya (KE)</option>
                                            <option value="UG">Uganda (UG)</option>
                                            <option value="TZ">Tanzania (TZ)</option>
                                            <option value="RW">Rwanda (RW)</option>
                                            <option value="NG">Nigeria (NG)</option>
                                            <option value="US">United States (US)</option>
                                            <option value="GB">United Kingdom (GB)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Admin Account Details */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b" style={{ color: '#B98A2E', borderColor: '#DCE1D5' }}>
                                    2. Primary Administrator (Owner)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={adminName}
                                            onChange={e => setAdminName(e.target.value)}
                                            placeholder="Joyce Nduta"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Work Email
                                        </label>
                                        <input
                                            type="email"
                                            value={adminEmail}
                                            onChange={e => setAdminEmail(e.target.value)}
                                            placeholder="joyce.nduta@university.edu"
                                            required
                                            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-all"
                                            style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#3E5449' }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={adminPassword}
                                                onChange={e => setAdminPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                                className="w-full px-4 py-2.5 pr-12 rounded-xl text-sm border outline-none transition-all"
                                                style={{ border: '1px solid #DCE1D5', background: '#fff', color: '#152A22' }}
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
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
                                {loading ? 'Registering Institution…' : 'Create Institution Account'}
                            </button>
                        </form>
                    </div>
                </motion.div>

                <p className="text-center text-sm" style={{ color: '#B9D3C6' }}>
                    Already registered? <Link href="/institutions/auth/signin" className="font-semibold text-white hover:underline">Log in to Console →</Link>
                </p>
            </div>
        </div>
    )
}
