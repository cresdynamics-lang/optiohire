'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, ShieldAlert } from 'lucide-react'

const ADMIN_USERS = [
  { email: 'admin@optiohire.com', name: 'Admin Manager' }
]

const ADMIN_PASSWORD = 'OptioHire@Admin'

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

    // Check if it's one of the admin users
    const adminUser = ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!adminUser) {
      setError('Invalid admin email')
      return
    }

    if (password !== ADMIN_PASSWORD) {
      setError('Invalid password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create admin session directly without backend authentication
      const adminSession = {
        id: adminUser.email,
        email: adminUser.email,
        name: adminUser.name,
        role: 'admin',
        isAdmin: true
      }

      // Store in localStorage
      localStorage.setItem('admin_session', JSON.stringify(adminSession))
      localStorage.setItem('admin_email', adminUser.email)
      localStorage.setItem('admin_name', adminUser.name)
      
      // Also set a token for API calls (we'll handle this on backend)
      // For now, set a simple admin token
      localStorage.setItem('admin_token', `admin_${adminUser.email}_${Date.now()}`)

      // Navigate to admin dashboard using Next.js router
      router.push('/admin')
      router.refresh() // Refresh to update auth context
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
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

