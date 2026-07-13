'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ShieldAlert } from 'lucide-react'

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

    setIsLoading(true)
    setError(null)

    try {
      // Use same-origin API route so we avoid "Failed to fetch" from backend URL/CORS
      const res = await fetch('/api/auth/admin-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password, portal: 'admin' }),
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

      // Use window.location for full page reload to ensure state is reset
      window.location.href = '/admin'
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error. Please try again.'
      setError(errorMessage)
      setIsLoading(false)
    }
  }


  return (
    <div className="admin-neu min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="neu-raised rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="neu-raised mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Shield className="h-7 w-7 text-[#2563eb]" />
            </div>
            <h1 className="text-3xl font-bold text-[#3b4252] mb-2">Admin Login</h1>
            <p className="text-[#6b7280]">Secure access for admin users</p>
            {isSecure !== null && (
              <div className={`neu-inset mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isSecure ? 'text-green-600' : 'text-amber-600'}`}>
                {isSecure ? <Shield className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                {isSecure ? 'Secure connection (SSL)' : 'Connection not secure (use HTTPS in production)'}
              </div>
            )}
          </div>

          {error && (
            <div className="neu-inset mb-5 p-3 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#5b6472] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@optiohire.com"
                className="neu-inset w-full px-4 py-3 rounded-xl outline-none transition-all text-[#3b4252] placeholder-[#9aa3b2] focus:text-[#2563eb]"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#5b6472] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="neu-inset w-full px-4 py-3 rounded-xl outline-none transition-all text-[#3b4252] placeholder-[#9aa3b2] pr-12"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa3b2] hover:text-[#2563eb] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-pressable w-full py-3 text-[#2563eb] font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/auth/options?mode=signin"
              className="text-sm text-[#6b7280] hover:text-[#2563eb] transition-colors"
            >
              Regular user login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

