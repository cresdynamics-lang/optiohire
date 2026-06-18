'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
  UserX,
  UserCheck,
  KeyRound,
  CheckCircle,
  X,
  RefreshCw,
  User,
  Crown,
  Briefcase,
  FileText,
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

function AdminDashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const usersLoadedRef = useRef(false)
  const lastLoadKeyRef = useRef<string | null>(null)
  const requestCtxRef = useRef<{
    adminEmail: string | null
    adminSession: string | null
    userId?: string
    userEmail?: string | null
  }>({ adminEmail: null, adminSession: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [disablingUserId, setDisablingUserId] = useState<string | null>(null)
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const sectionFromUrl = searchParams.get('section') as 'users' | 'admins' | null
  const [activeSection, setActiveSection] = useState<'users' | 'jobs' | 'applicants' | 'admins'>(sectionFromUrl === 'admins' ? 'admins' : 'users')
  // Initialize admin session from localStorage synchronously (if on client) to avoid race condition
  const [adminSession, setAdminSession] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('admin_session') : null
  )
  const [adminEmail, setAdminEmail] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('admin_email') : null
  )
  const [adminName, setAdminName] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('admin_name') : null
  )
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

  // Sync admin session from localStorage (in case it changes)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const session = localStorage.getItem('admin_session')
    const email = localStorage.getItem('admin_email')
    const name = localStorage.getItem('admin_name')

    setAdminSession(session)
    setAdminEmail(email)
    setAdminName(name)
  }, [])

  const isSeniorAdmin = currentUser?.email === 'jobs@optiohire.com'

  requestCtxRef.current = {
    adminEmail,
    adminSession,
    userId: user?.id,
    userEmail: user?.email ?? null,
  }

  useEffect(() => {
    // Check for admin session (state or localStorage directly to avoid race condition)
    const hasAdminSession = adminSession || (typeof window !== 'undefined' && localStorage.getItem('admin_session'))
    if (hasAdminSession) {
      // Admin session exists, allow access
      return
    }
    
    // Fallback to regular auth check (only redirect if auth has finished loading)
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin/login')
    }
  }, [user?.id, user?.role, authLoading, router, adminSession])

  const loadUsers = useCallback(async () => {
    const ctx = requestCtxRef.current
    const displayEmail = ctx.adminSession ? ctx.adminEmail : ctx.userEmail
    const currentAdminId = ctx.adminSession ? ctx.adminEmail : ctx.userId || ctx.userEmail

    try {
      const firstLoad = !usersLoadedRef.current
      if (firstLoad) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Use admin token if available, otherwise use regular token
      const adminToken = localStorage.getItem('admin_token')
      const authToken = adminToken || token
      const response = await fetch('/api/admin/users?limit=20', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'X-Admin-Email': displayEmail || ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()
      // Filter out the current admin user from the list
      const filteredUsers = (data.users || []).filter((u: User) => {
        return u.user_id !== currentAdminId && u.email !== currentAdminId && u.email !== displayEmail
      })
      setUsers(filteredUsers)
      usersLoadedRef.current = true
    } catch (err: any) {
      console.error('Error loading users:', err)
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!(adminSession || (user && user.role === 'admin'))) return
    const loadKey = `${adminSession ? 'session' : 'user'}:${user?.id ?? ''}:${user?.role ?? ''}`
    if (usersLoadedRef.current && lastLoadKeyRef.current === loadKey) return
    lastLoadKeyRef.current = loadKey
    void loadUsers()
    // Intentionally narrow deps: profile sync updates `user` object identity often — do not refetch on every enrichment.
  }, [adminSession, user?.id, user?.role, loadUsers])

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

      const response = await fetch(`/api/admin/users/${userId}`, {
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

  const handleDisableEnableUser = async (userId: string, currentActive: boolean) => {
    try {
      setDisablingUserId(userId)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update user')
      }
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, is_active: !currentActive } : u))
    } catch (err: any) {
      alert(err.message || 'Failed to update user')
    } finally {
      setDisablingUserId(null)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !resetPasswordValue.trim()) return
    if (resetPasswordValue.length < 8) {
      setResetPasswordError('Password must be at least 8 characters')
      return
    }
    try {
      setResetPasswordLoading(true)
      setResetPasswordError(null)
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const response = await fetch(`/api/admin/users/${resetPasswordUserId}/reset-password`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPasswordValue })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Failed to reset password')
      setResetPasswordUserId(null)
      setResetPasswordValue('')
      setResetPasswordError(null)
      alert('Password reset successfully')
    } catch (err: any) {
      setResetPasswordError(err.message || 'Failed to reset password')
    } finally {
      setResetPasswordLoading(false)
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeSection === 'admins' && u.role !== 'admin') {
        return false
      }
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
  }, [users, searchTerm, activeSection])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  // currentUser is already defined above, check access
  // Check both state and localStorage directly to avoid race conditions
  const hasAdminAccess = adminSession || 
    (typeof window !== 'undefined' && localStorage.getItem('admin_session')) ||
    (user && user.role === 'admin')
  if (!hasAdminAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-transparent p-8 text-foreground ">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground ">
              Admin Management
              {isSeniorAdmin && (
                <span className="ml-3 px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                  Senior Admin
                </span>
              )}
            </h1>
            <p className="text-muted-foreground ">
              {isSeniorAdmin ? 'Full system access - All rights enabled' : 'Manage users, jobs, applicants, and admins'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Overview
              </Button>
            </Link>
            <Button
              onClick={() => void loadUsers()}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Admin Profile Section */}
        {currentUser && (
          <div>
            <Card className="border border-border dark:border-gray-800  shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-800 shrink-0">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2 text-foreground ">
                      Admin Profile
                      <span className="rounded-full bg-blue-100 /40 px-2 py-0.5 text-xs font-medium text-blue-800 ">
                        ADMIN
                      </span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground ">Your administrator account information</CardDescription>
                  </div>
                  {isSecure !== null && (
                    <div
                      className={`ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                        isSecure
                          ? 'border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 /30 text-emerald-700 '
                          : 'border border-amber-200 dark:border-amber-700/40 bg-amber-50 /30 text-amber-700 '
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {isSecure ? 'SSL' : 'HTTP'}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                      <User className="h-4 w-4" />
                      Name
                    </div>
                    <p className="text-foreground ">{currentUser.name || 'Not set'}</p>
                  </div>

                  {(currentUser as any).username && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <User className="h-4 w-4" />
                        Username
                      </div>
                      <p className="font-mono text-foreground ">@{(currentUser as any).username}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="text-foreground  truncate">{currentUser.email}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                      <Shield className="h-4 w-4" />
                      Role
                    </div>
                    <p className="capitalize text-foreground ">{currentUser.role}</p>
                  </div>

                  {(currentUser as any).companyRole && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <Key className="h-4 w-4" />
                        Company Role
                      </div>
                      <p className="capitalize text-foreground ">
                        {(currentUser as any).companyRole === 'hr' ? 'HR Manager' : (currentUser as any).companyRole === 'candidate' ? 'Candidate' : 'Hiring Manager'}
                      </p>
                    </div>
                  )}

                  {(currentUser as any).created_at && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </div>
                      <p className="text-foreground ">
                        {new Date((currentUser as any).created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {(currentUser as any).companyName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <Building2 className="h-4 w-4" />
                        Organization
                      </div>
                      <p className="text-foreground  truncate">{(currentUser as any).companyName}</p>
                    </div>
                  )}

                  {(currentUser as any).companyEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <Mail className="h-4 w-4" />
                        Company Email
                      </div>
                      <p className="text-foreground  truncate">{(currentUser as any).companyEmail}</p>
                    </div>
                  )}

                  {(currentUser as any).hrEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground ">
                        <Mail className="h-4 w-4" />
                        HR Email
                      </div>
                      <p className="text-foreground  truncate">{(currentUser as any).hrEmail}</p>
                    </div>
                  )}

                  {(currentUser as any).hiringManagerEmail && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Mail className="h-4 w-4" />
                        Hiring Manager Email
                      </div>
                      <p className="text-primary truncate">{(currentUser as any).hiringManagerEmail}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search - Only show for users section */}
        {activeSection === 'users' && (
          <Card className="border border-border dark:border-gray-800  shadow-sm">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground " />
                <Input
                  placeholder="Search by email, name, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-border dark:border-gray-700 bg-white  pl-10 text-foreground  placeholder:text-muted-foreground dark:placeholder:text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800/60 bg-red-50 /40 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600 " />
            <p className="text-red-800 ">{error}</p>
          </div>
        )}

        {/* Users List */}
        {activeSection === 'users' || activeSection === 'admins' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground ">
                {activeSection === 'admins' ? 'All Admins' : 'All Users'} ({filteredUsers.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => (
                <Dialog key={user.user_id}>
                  <Card className="border border-border dark:border-gray-800  shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group flex flex-col h-full relative">
                    <DialogTrigger asChild>
                      <div className="p-5 flex flex-col h-full w-full text-left outline-none">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-100  p-1.5 rounded-full text-muted-foreground ">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-foreground  truncate" title={user.name || 'No Name'}>
                              {user.name || 'No Name'}
                            </h3>
                            <p className="text-xs text-muted-foreground  truncate" title={user.email}>
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {user.company && (
                          <div className="mt-auto mb-3 text-xs flex items-center gap-1.5 text-slate-600  truncate">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{user.company.company_name}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-auto">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                            user.is_active 
                              ? 'border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 /40 text-emerald-700 ' 
                              : 'border border-red-200 dark:border-red-800/40 bg-red-50 /40 text-red-700 '
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide uppercase ${
                            user.role === 'admin'
                              ? 'border border-primary/30 dark:border-primary/40 bg-primary/10 /20 text-primary dark:text-[#8f97ff]'
                              : 'border border-blue-200 dark:border-blue-800/40 bg-blue-50 /40 text-blue-700 '
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </DialogTrigger>

                    {/* Expandable Details Modal */}
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>Full details and administrative actions</DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 pt-4">
                        {/* User Info from old card */}
                        <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-gray-800">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center shrink-0">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-foreground ">
                                {user.name || 'No Name'}
                              </h3>
                              {(user as any).username && (
                                <span className="font-mono text-sm text-muted-foreground ">
                                  @{(user as any).username}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.is_active 
                                  ? 'bg-emerald-100 text-emerald-800 /50 ' 
                                  : 'bg-red-100 text-red-800 /50 '
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-primary/10 text-primary /20 dark:text-[#8f97ff]'
                                  : 'bg-blue-100 text-blue-800 /50 '
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-3 text-slate-600 ">
                            <div className="w-8 h-8 rounded-md bg-slate-100  flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="truncate">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Email</p>
                              <p className="text-foreground  font-medium truncate">{user.email}</p>
                            </div>
                          </div>

                          {(user as any).username && (
                            <div className="flex items-center gap-3 text-slate-600 ">
                              <div className="w-8 h-8 rounded-md bg-slate-100  flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="truncate">
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Username</p>
                                <p className="font-mono text-foreground  truncate">@{user.username}</p>
                              </div>
                            </div>
                          )}

                          {user.company_role && (
                            <div className="flex items-center gap-3 text-slate-600 ">
                              <div className="w-8 h-8 rounded-md bg-slate-100  flex items-center justify-center shrink-0">
                                <Key className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div className="truncate">
                                <p className="text-[10px] uppercase font-semibold text-muted-foreground">Company Role</p>
                                <p className="text-foreground  font-medium capitalize">{user.company_role === 'hr' ? 'HR Manager' : user.company_role === 'candidate' ? 'Candidate' : 'Hiring Manager'}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-slate-600 ">
                            <div className="w-8 h-8 rounded-md bg-slate-100  flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Joined</p>
                              <p className="text-foreground  font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        {/* Password Display */}
                        <div className="rounded-lg border border-border dark:border-gray-800 bg-background /60 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 ">
                              <Shield className="w-4 h-4" />
                              Password Hash (Admin View)
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePasswordVisibility(user.user_id)}
                              className="h-8 px-2"
                            >
                              {showPasswords[user.user_id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <div className="font-mono text-xs text-muted-foreground  break-all bg-background  p-2 rounded border border-border dark:border-gray-800">
                            {showPasswords[user.user_id] ? user.password_hash : '••••••••••••••••••••••••••••••••'}
                          </div>
                        </div>

                        {/* Company Details */}
                        {user.company && (
                          <div className="rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50 /30 p-4">
                            <div className="flex items-center gap-2 mb-4 text-blue-800 ">
                              <Building2 className="w-5 h-5" />
                              <h4 className="font-semibold">Company Details</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground  text-xs uppercase tracking-wider mb-1">Organization</p>
                                <p className="font-medium text-foreground  truncate">{user.company.company_name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground  text-xs uppercase tracking-wider mb-1">Company Email</p>
                                <p className="font-medium text-foreground  truncate">{user.company.company_email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground  text-xs uppercase tracking-wider mb-1">HR Email</p>
                                <p className="font-medium text-foreground  truncate">{user.company.hr_email}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground  text-xs uppercase tracking-wider mb-1">Hiring Manager Email</p>
                                <p className="font-medium text-foreground  truncate">{user.company.hiring_manager_email}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions Row */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-gray-800">
                          <Button
                            variant="default"
                            onClick={() => router.push(`/admin/users/${user.user_id}`)}
                            className="bg-primary hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Dashboard
                          </Button>
                          
                          {user.email !== currentUser?.email && (
                            <Button
                              variant="outline"
                              onClick={() => handleDisableEnableUser(user.user_id, user.is_active)}
                              disabled={disablingUserId === user.user_id}
                            >
                              {disablingUserId === user.user_id ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : user.is_active ? (
                                <UserX className="w-4 h-4 mr-2" />
                              ) : (
                                <UserCheck className="w-4 h-4 mr-2" />
                              )}
                              {user.is_active ? 'Disable Account' : 'Enable Account'}
                            </Button>
                          )}
                          
                          <Dialog open={resetPasswordUserId === user.user_id} onOpenChange={(open) => {
                            if (!open) {
                              setResetPasswordUserId(null)
                              setResetPasswordValue('')
                              setResetPasswordError(null)
                            } else {
                              setResetPasswordUserId(user.user_id)
                              setResetPasswordValue('')
                              setResetPasswordError(null)
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="gap-2">
                                <KeyRound className="w-4 h-4" />
                                Reset Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Reset password</DialogTitle>
                                <DialogDescription>
                                  Set a new password for {user.email}. Minimum 8 characters.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  type="password"
                                  placeholder="New password"
                                  value={resetPasswordUserId === user.user_id ? resetPasswordValue : ''}
                                  onChange={(e) => setResetPasswordValue(e.target.value)}
                                  minLength={8}
                                  autoComplete="new-password"
                                />
                                {resetPasswordError && (
                                  <p className="text-sm text-destructive">{resetPasswordError}</p>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setResetPasswordUserId(null)}>Cancel</Button>
                                <Button onClick={handleResetPassword} disabled={resetPasswordLoading}>
                                  {resetPasswordLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  Reset password
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {(isSeniorAdmin || user.role !== 'admin') && (
                            <Button
                              variant="destructive"
                              className="ml-auto"
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
                    </DialogContent>
                  </Card>
                </Dialog>
              ))}
            </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-300  mx-auto mb-4" />
              <p className="text-muted-foreground ">
                {activeSection === 'admins' ? 'No admins found' : 'No users found'}
              </p>
            </div>
          )}
        </div>
        ) : (
          <Card className="border border-border dark:border-gray-800  shadow-sm">
            <CardContent className="pt-6">
              <p className="py-8 text-center text-muted-foreground ">
                Navigate to the specific section using the navigation buttons above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background ">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  )
}
