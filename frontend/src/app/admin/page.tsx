'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Users, 
  Trash2, 
  Search, 
  Eye, 
  EyeOff,
  Mail,
  Building2,
  Shield,
  Calendar,
  Key,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  User,
  Crown,
  Briefcase,
  FileText,
  UserCheck,
  LayoutDashboard,
  BarChart3,
  Settings
} from 'lucide-react'

interface User {
  user_id: string
  username?: string | null
  name?: string | null
  email: string
  password_hash: string
  role: string
  company_role?: string | null
  is_active: boolean
  created_at: string
  company?: {
    company_id: string
    company_name: string
    company_email: string
    hr_email: string
    hiring_manager_email: string
  } | null
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const sectionFromUrl = searchParams.get('section') as 'users' | 'admins' | null
  const [activeSection, setActiveSection] = useState<'users' | 'jobs' | 'applicants' | 'admins'>(sectionFromUrl === 'admins' ? 'admins' : 'users')
  const [adminSession, setAdminSession] = useState<string | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [adminName, setAdminName] = useState<string | null>(null)
  const [isSecure, setIsSecure] = useState<boolean | null>(null)

  useEffect(() => {
    setIsSecure(typeof window !== 'undefined' && window.location.protocol === 'https:')
  }, [])

  useEffect(() => {
    if (sectionFromUrl === 'admins') setActiveSection('admins')
    else if (!sectionFromUrl) setActiveSection('users')
  }, [sectionFromUrl])

  // Use admin session if available, otherwise use regular user
  const currentUser = adminSession ? {
    email: adminEmail || '',
    name: adminName || null,
    role: 'admin',
    id: adminEmail || ''
  } : user

  // Load admin session from localStorage on client side
  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    const email = localStorage.getItem('admin_email')
    const name = localStorage.getItem('admin_name')

    setAdminSession(session)
    setAdminEmail(email)
    setAdminName(name)
  }, [])

  const isSeniorAdmin = currentUser?.email === 'nelsonochieng516@gmail.com'

  useEffect(() => {
    // Check for admin session directly
    if (adminSession) {
      // Admin session exists, allow access
      return
    }
    
    // Fallback to regular auth check
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router, adminSession])

  useEffect(() => {
    // Check for admin session or regular admin user
    if (adminSession || (user && user.role === 'admin')) {
      loadUsers()
    }
  }, [user, adminSession])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      // Use admin token if available, otherwise use regular token
      const adminToken = localStorage.getItem('admin_token')
      const authToken = adminToken || token
      const response = await fetch(`${backendUrl}/api/admin/users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'X-Admin-Email': currentUser?.email || ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()
      // Filter out the current admin user from the list
      const currentAdminId = currentUser?.id || currentUser?.email
      const filteredUsers = (data.users || []).filter((u: User) => {
        return u.user_id !== currentAdminId && u.email !== currentAdminId && u.email !== currentUser?.email
      })
      setUsers(filteredUsers)
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingUserId(userId)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      // Remove user from list
      setUsers(prev => prev.filter(u => u.user_id !== userId))
    } catch (err: any) {
      console.error('Error deleting user:', err)
      alert(err.message || 'Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const filteredUsers = users.filter(u => {
    // If activeSection is 'admins', only show admin users
    if (activeSection === 'admins' && u.role !== 'admin') {
      return false
    }
    
    // Apply search filter
    if (searchTerm && activeSection !== 'admins') {
      return (
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.company?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return true
  })

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  // currentUser is already defined above, check access
  if (!adminSession && (!user || user.role !== 'admin')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Management
              {isSeniorAdmin && (
                <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-[#2D2DDD] text-white">
                  Senior Admin
                </span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isSeniorAdmin ? 'Full system access - All rights enabled' : 'Manage users, jobs, applicants, and admins'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </Button>
            </Link>
            <Button
              onClick={loadUsers}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Admin Profile Section */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-[#2D2DDD]/20 dark:border-[#2D2DDD]/30 bg-gradient-to-br from-[#2D2DDD]/5 to-[#2D2DDD]/10 dark:from-[#2D2DDD]/10 dark:to-[#2D2DDD]/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D2DDD] to-[#2D2DDD]/80 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[#2D2DDD] dark:text-[#2D2DDD]">
                      Admin Profile
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#2D2DDD]/20 dark:bg-[#2D2DDD]/30 text-[#2D2DDD] dark:text-[#2D2DDD]">
                        ADMIN
                      </span>
                    </CardTitle>
                    <CardDescription className="text-[#2D2DDD]/80 dark:text-[#2D2DDD]">
                      Your administrator account information
                    </CardDescription>
                  </div>
                  {isSecure !== null && (
                    <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isSecure ? 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/40' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'}`}>
                      <Shield className="w-3.5 h-3.5" />
                      {isSecure ? 'SSL' : 'HTTP'}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-200">
                      <User className="w-4 h-4" />
                      Name
                    </div>
                    <p className="text-purple-800 dark:text-purple-300">
                      {currentUser.name || 'Not set'}
                    </p>
                  </div>
                  
                  {(currentUser as any).username && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <User className="w-4 h-4" />
                        Username
                      </div>
                      <p className="text-purple-800 dark:text-purple-300 font-mono">
                        @{(currentUser as any).username}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-200">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                    <p className="text-purple-800 dark:text-purple-300">
                      {currentUser.email}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-purple-900 dark:text-purple-200">
                      <Shield className="w-4 h-4" />
                      Role
                    </div>
                    <p className="text-purple-800 dark:text-purple-300 capitalize">
                      {currentUser.role}
                    </p>
                  </div>
                  
                  {(currentUser as any).companyRole && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Key className="w-4 h-4" />
                        Company Role
                      </div>
                      <p className="text-purple-800 dark:text-purple-300 capitalize">
                        {(currentUser as any).companyRole === 'hr' ? 'HR Manager' : 'Hiring Manager'}
                      </p>
                    </div>
                  )}
                  
                  {(currentUser as any).created_at && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Calendar className="w-4 h-4" />
                        Member Since
                      </div>
                      <p className="text-[#2D2DDD]/90 dark:text-[#2D2DDD]">
                        {new Date((currentUser as any).created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {(currentUser as any).companyName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Building2 className="w-4 h-4" />
                        Organization
                      </div>
                      <p className="text-[#2D2DDD]/90 dark:text-[#2D2DDD]">
                        {(currentUser as any).companyName}
                      </p>
                    </div>
                  )}
                  
                  {(currentUser as any).companyEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Mail className="w-4 h-4" />
                        Company Email
                      </div>
                      <p className="text-[#2D2DDD]/90 dark:text-[#2D2DDD]">
                        {(currentUser as any).companyEmail}
                      </p>
                    </div>
                  )}
                  
                  {(currentUser as any).hrEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Mail className="w-4 h-4" />
                        HR Email
                      </div>
                      <p className="text-[#2D2DDD]/90 dark:text-[#2D2DDD]">
                        {(currentUser as any).hrEmail}
                      </p>
                    </div>
                  )}
                  
                  {(currentUser as any).hiringManagerEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#2D2DDD] dark:text-[#2D2DDD]">
                        <Mail className="w-4 h-4" />
                        Hiring Manager Email
                      </div>
                      <p className="text-[#2D2DDD]/90 dark:text-[#2D2DDD]">
                        {(currentUser as any).hiringManagerEmail}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search - Only show for users section */}
        {activeSection === 'users' && (
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Users List */}
        {activeSection === 'users' || activeSection === 'admins' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeSection === 'admins' ? 'All Admins' : 'All Users'} ({filteredUsers.length})
              </h2>
            </div>
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
            <Card key={user.user_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    {/* User Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2D2DDD] to-[#2D2DDD]/80 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user.name || 'No Name'}
                          </h3>
                          {(user as any).username && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              @{(user as any).username}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-[#2D2DDD]/10 text-[#2D2DDD] dark:bg-[#2D2DDD]/20 dark:text-[#2D2DDD]'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span>{user.email}</span>
                          </div>
                          
                          {(user as any).username && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <User className="w-4 h-4" />
                              <span className="font-mono">@{user.username}</span>
                            </div>
                          )}
                          
                          {user.company_role && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Key className="w-4 h-4" />
                              <span className="capitalize">{user.company_role === 'hr' ? 'HR Manager' : 'Hiring Manager'}</span>
                            </div>
                          )}
                          
                          {user.company && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4" />
                              <span>{user.company.company_name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Password Display */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Password Hash (Admin View)
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(user.user_id)}
                              className="h-6 px-2"
                            >
                              {showPasswords[user.user_id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                            {showPasswords[user.user_id] ? user.password_hash : '••••••••••••••••'}
                          </div>
                        </div>

                        {/* Company Details */}
                        {user.company && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Company Details</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p><span className="font-medium">Organization:</span> {user.company.company_name}</p>
                              <p><span className="font-medium">Company Email:</span> {user.company.company_email}</p>
                              <p><span className="font-medium">HR Email:</span> {user.company.hr_email}</p>
                              <p><span className="font-medium">Hiring Manager Email:</span> {user.company.hiring_manager_email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${user.user_id}`)}
                      className="bg-[#2D2DDD] hover:bg-[#2D2DDD]/90"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {(isSeniorAdmin || user.role !== 'admin') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.user_id)}
                        disabled={deletingUserId === user.user_id}
                      >
                        {deletingUserId === user.user_id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {activeSection === 'admins' ? 'No admins found' : 'No users found'}
              </p>
            </div>
          )}
        </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Navigate to the specific section using the navigation buttons above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
