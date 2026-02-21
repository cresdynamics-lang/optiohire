'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ShieldAlert } from 'lucide-react'

const ADMIN_EMAIL = 'admin@optiohire.com'
const ADMIN_NAME = 'Admin Manager'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSecure, setIsSecure] = useState<boolean | null>(null)

  useEffect(() => {
    setIsSecure(typeof window !== 'undefined' && window.location.protocol === 'https:')
  }, [])

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError('Invalid admin email')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const res = await fetch(`${backendUrl}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data?.error || 'Invalid credentials')
        setIsLoading(false)
        return
      }

      if (data?.user?.role !== 'admin') {
        setError('This account does not have admin access')
        setIsLoading(false)
        return
      }

      const token = data.token
      const user = data.user
      if (!token) {
        setError('Login failed: no token received')
        setIsLoading(false)
        return
      }

      const adminSession = {
        id: user.user_id || user.id,
        email: user.email,
        name: user.name || ADMIN_NAME,
        role: 'admin',
        isAdmin: true,
      }

      localStorage.setItem('token', token)
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_session', JSON.stringify(adminSession))
      localStorage.setItem('admin_email', user.email)
      localStorage.setItem('admin_name', user.name || ADMIN_NAME)

      router.push('/admin')
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Check backend URL.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Instant access for admin users</p>
            {isSecure !== null && (
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isSecure ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                {isSecure ? <Shield className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                {isSecure ? 'Secure connection (SSL)' : 'Connection not secure (use HTTPS in production)'}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@optiohire.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-400 pr-12"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth/signin"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Regular user login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

