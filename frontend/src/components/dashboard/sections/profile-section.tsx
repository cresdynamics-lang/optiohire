'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Building2, 
  Mail, 
  Shield,
  Lock,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
  Key,
  Settings,
  AlertTriangle,
  LogOut,
  BadgeCheck,
  Globe,
  Verified,
  Award,
  Clock
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { JobSeekerProfileSection } from './job-seeker-profile-section'

interface CompanyData {
  id: string
  company_name: string
  company_email: string
  hr_email: string
  created_at: string
  company_logo_url?: string | null
  company_location?: string
  website_url?: string | null
  linkedin_url?: string | null
  twitter_url?: string | null
}

export function ProfileSection() {
  const { user, signOut } = useAuth()
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    hr_email: '',
    hiring_manager_email: '',
    company_logo_url: '',
    company_location: '',
    website_url: '',
    linkedin_url: '',
    twitter_url: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadCompanyData = useCallback(async () => {
    if (!user || !user.id) {
      setIsLoading(false)
      return
    }

    if (user.companyRole === 'candidate') {
      setCompany(null)
      setIsLoading(false)
      return
    }

    // PRIORITY: Use company data from user object (from signup/API)
    // This ensures signup company details are immediately reflected
    if (user.companyName || user.companyEmail || user.hrEmail) {
      const companyData: CompanyData = {
        id: user.companyId || '',
        company_name: user.companyName || '',
        company_email: user.companyEmail || '',
        hr_email: user.hrEmail || '',
        created_at: new Date().toISOString(),
        company_logo_url: (user as any).companyLogoUrl || null,
        company_location: (user as any).companyLocation || ''
      }
      
      setCompany(companyData)
      setFormData({
        company_name: user.companyName || '',
        company_email: user.companyEmail || '',
        hr_email: user.hrEmail || '',
        hiring_manager_email: user.hiringManagerEmail || '',
        company_logo_url: (user as any).companyLogoUrl || '',
        company_location: (user as any).companyLocation || '',
        website_url: (user as any).websiteUrl || '',
        linkedin_url: (user as any).linkedinUrl || '',
        twitter_url: (user as any).twitterUrl || '',
      })
      setIsLoading(false)
      
      // Optionally refresh from backend to get latest data, but don't wait for it
      // This ensures we show signup data immediately
      refreshCompanyFromBackend(user.id).catch(err => {
        console.log('Background refresh failed, using cached data:', err)
      })
      return
    }

    // Fallback: Try to load from backend API
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.companyName || userData.companyEmail || userData.hrEmail) {
          const companyData: CompanyData = {
            id: userData.companyId || '',
            company_name: userData.companyName || '',
            company_email: userData.companyEmail || '',
            hr_email: userData.hrEmail || '',
            created_at: new Date().toISOString(),
            company_logo_url: userData.companyLogoUrl || null
          }
          
          setCompany(companyData)
          setFormData({
            company_name: userData.companyName || '',
            company_email: userData.companyEmail || '',
            hr_email: userData.hrEmail || '',
            hiring_manager_email: userData.hiring_manager_email || userData.hiringManagerEmail || '',
            company_logo_url: userData.companyLogoUrl || '',
            company_location: userData.companyLocation || '',
            website_url: userData.websiteUrl || '',
            linkedin_url: userData.linkedinUrl || '',
            twitter_url: userData.twitterUrl || '',
          })
        }
      }
    } catch (error) {
      console.error('Error loading company data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Helper function to refresh company data from backend (non-blocking)
  const refreshCompanyFromBackend = async (userId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.companyName || userData.companyEmail || userData.hrEmail) {
          setCompany({
            id: userData.companyId || '',
            company_name: userData.companyName || '',
            company_email: userData.companyEmail || '',
            hr_email: userData.hrEmail || '',
            created_at: new Date().toISOString(),
            company_logo_url: userData.companyLogoUrl || null
          })
          setFormData({
            company_name: userData.companyName || '',
            company_email: userData.companyEmail || '',
            hr_email: userData.hrEmail || '',
            hiring_manager_email: userData.hiring_manager_email || userData.hiringManagerEmail || '',
            company_logo_url: userData.companyLogoUrl || '',
            company_location: userData.companyLocation || '',
            website_url: userData.websiteUrl || '',
            linkedin_url: userData.linkedinUrl || '',
            twitter_url: userData.twitterUrl || '',
          })
        }
      }
    } catch (error) {
      // Silently fail - we already have data from user object
      console.log('Background refresh error:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadCompanyData()
    }
  }, [user, loadCompanyData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Good evening'
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const handleSaveCompany = async () => {
    if (!user || !company) return

    setIsSaving(true)
    setSaveMessage(null)

    // Basic validation – required fields must not be blank
    if (
      !formData.company_name.trim() ||
      !formData.company_email.trim() ||
      !formData.hr_email.trim()
    ) {
      setSaveMessage({
        type: 'error',
        text: 'Company name, company email, and HR email are required and cannot be blank.'
      })
      setIsSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/user/company', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          company_email: formData.company_email,
          hr_email: formData.hr_email,
          company_logo_url: formData.company_logo_url || null,
          website_url: formData.website_url || null,
          linkedin_url: formData.linkedin_url || null,
          twitter_url: formData.twitter_url || null,
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update company settings')
      }

      const data = await response.json()
      
      // Update local state
      setCompany({
        id: data.company.company_id,
        company_name: data.company.company_name,
        company_email: data.company.company_email,
        hr_email: data.company.hr_email,
        created_at: company.created_at
      })

      // Refresh user data to update the user object in auth context
      const userResponse = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        // Reload company data to reflect changes
        await loadCompanyData()
      }

      setSaveMessage({ type: 'success', text: 'Company settings updated successfully! Your signup details have been updated.' })
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error('Error saving company settings:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update company settings' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setSaveMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      setSaveMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      console.error('Error changing password:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update password' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    if (deleteConfirmText !== 'DELETE') {
      setSaveMessage({ type: 'error', text: 'Please type DELETE to confirm' })
      return
    }

    setIsDeleting(true)
    setSaveMessage(null)

    try {
      if (company) {
        const { error: deleteCompanyError } = await supabase
          .from('companies')
          .delete()
          .eq('id', company.id)

        if (deleteCompanyError) {
          console.error('Error deleting company:', deleteCompanyError)
        }
      }

      await signOut({ next: '/' })
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to delete account. Please contact support.' })
      setIsDeleting(false)
    }
  }

  const accountAge = user?.created_at 
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (user?.companyRole === 'candidate') {
    return <JobSeekerProfileSection />
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Professional Header with Trust Indicators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-[0_28px_90px_-54px_rgba(15,23,42,0.2)] backdrop-blur-sm sm:p-8 dark:border-gray-800 dark:bg-gray-900/90">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_62%)] sm:block" aria-hidden />
          <div className="relative z-10">
            <div className="flex flex-col items-stretch justify-between gap-6 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-100 shadow-sm ring-4 ring-slate-500/5 dark:border-gray-700 dark:bg-gray-800/80 sm:h-20 sm:w-20">
                    <User className="h-8 w-8 text-slate-700 dark:text-slate-200 sm:h-10 sm:w-10" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="mb-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl md:text-4xl ">
                      {getGreeting()},{' '}
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="mb-2 text-sm text-slate-600 dark:text-gray-400">
                      Welcome back to your recruitment dashboard.
                    </p>
                    {(user as any)?.username && (
                      <p className="mb-2 font-mono text-sm text-slate-500 dark:text-gray-500">@{(user as any).username}</p>
                    )}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium text-slate-800 dark:text-gray-200">Verified account</span>
                    </div>
                    {user?.companyRole && (
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        Role:{' '}
                        <span className="font-semibold capitalize text-foreground">
                          {user.companyRole === 'hr' ? 'HR Manager' : 'Hiring Manager'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Email</span>
                    </div>
                    <p className="break-all text-sm font-medium text-foreground">{user?.email || 'N/A'}</p>
                  </div>
                  
                  {(user?.companyName || company?.company_name) && (
                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="mb-2 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Company</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{user?.companyName || company?.company_name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">As entered during signup</p>
                    </div>
                  )}
                  
                  {user?.companyRole && (
                    <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="mb-2 flex items-center gap-2">
                        <Key className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Role in company</span>
                      </div>
                      <p className="text-sm font-medium capitalize text-foreground">{user.companyRole === 'hr' ? 'HR Manager' : 'Hiring Manager'}</p>
                    </div>
                  )}
                  
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Member since</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex shrink-0 flex-col gap-3 sm:w-40">
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 text-center dark:border-gray-700 dark:bg-gray-800/60">
                  <Shield className="mx-auto mb-2 h-6 w-6 text-slate-700 dark:text-slate-200" />
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Security</p>
                  <p className="text-sm font-semibold text-foreground">Protected</p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 text-center dark:border-gray-700 dark:bg-gray-800/60">
                  <Award className="mx-auto mb-2 h-6 w-6 text-slate-700 dark:text-slate-200" />
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-foreground">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 p-4 rounded-xl shadow-lg ${
            saveMessage.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-800 dark:text-green-300 border-2 border-green-200 dark:border-green-700' 
              : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-800 dark:text-red-300 border-2 border-red-200 dark:border-red-700'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{saveMessage.text}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card className="bg-background border border-border shadow-[0_22px_55px_-42px_rgba(15,23,42,0.35)]">
          <CardHeader className="bg-slate-50 /70 border-b border-border">
            <CardTitle className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold">Account Details</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-normal mt-0.5">Your personal information</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500">Name from your signup</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">Email cannot be changed</p>
              </div>

              {user?.companyRole && (
                <div className="space-y-2">
                  <Label htmlFor="company_role" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Company Role
                  </Label>
                  <Input
                    id="company_role"
                    type="text"
                    value={user.companyRole === 'hr' ? 'HR Manager' : 'Hiring Manager'}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 capitalize"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500">Your role from signup</p>
                </div>
              )}

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Account Created</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        }) 
                      : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Account Status</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                </div>
                
                {user?.role && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Role</span>
                    </div>
                    <span className="text-sm font-medium text-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information Card */}
        <Card className="bg-background border border-border shadow-[0_22px_55px_-42px_rgba(15,23,42,0.35)]">
          <CardHeader className="bg-slate-50 /70 border-b border-border">
            <CardTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Company Profile</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-normal mt-0.5">
                    {company ? 'Organisation details linked to this workspace' : 'Your organisation details'}
                  </div>
                </div>
              </div>
              {company && (
                <Button
                  type="button"
                  size="sm"
                  variant={isEditingCompany ? 'outline' : 'default'}
                  onClick={() => {
                    if (isEditingCompany) {
                      // Cancel editing: reload latest company data into the form
                      loadCompanyData()
                    }
                    setIsEditingCompany(!isEditingCompany)
                  }}
                  className={isEditingCompany 
                    ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-none hover:shadow-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
                  }
                >
                  {isEditingCompany ? 'Close' : 'Edit company profile'}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-700 dark:text-slate-200" />
              </div>
            ) : company ? (
              <>
                {/* Compact profile summary always visible */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {(user as any)?.companyLogoUrl || company.company_logo_url ? (
                      // Use plain img to avoid extra imports
                      <img
                        src={(user as any).companyLogoUrl || (company.company_logo_url as string)}
                        alt={`${company.company_name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">
                      {company.company_name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {formData.company_email || company.company_email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Primary HR contact: {formData.hr_email || company.hr_email}
                    </p>
                  </div>
                </div>

                {/* When not editing: show read-only profile fields */}
                {!isEditingCompany ? (
                  <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-slate-100  border border-slate-300  rounded-lg mb-2">
                      <Mail className="w-5 h-5 text-slate-700 dark:text-slate-200 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Email for applications & candidate contact
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-all">
                          {formData.hr_email || formData.company_email || '—'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Applications and candidate replies use this address. It is shown in shortlist and rejection emails as the company contact.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">Company name</p>
                        <p className="text-sm font-medium text-foreground">
                          {formData.company_name || company.company_name}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">Company email</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {formData.company_email || company.company_email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">HR email</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {formData.hr_email || company.hr_email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">Hiring manager email</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {user?.hiringManagerEmail || '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">Website</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {formData.website_url ? (
                            <a href={formData.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{formData.website_url}</a>
                          ) : '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">LinkedIn</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {formData.linkedin_url ? (
                            <a href={formData.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{formData.linkedin_url}</a>
                          ) : '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase text-muted-foreground">Twitter</p>
                        <p className="text-sm font-medium text-foreground break-all">
                          {formData.twitter_url ? (
                            <a href={formData.twitter_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{formData.twitter_url}</a>
                          ) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Editable form shown only when editing */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Company Name
                        </Label>
                        <Input
                          id="company_name"
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="Enter company name"
                          className="bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-500">As entered during account creation</p>
                      </div>

                      
                <div className="space-y-2">
                  <Label htmlFor="company_location" className="text-gray-700 dark:text-gray-300">Company Location</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_location"
                      value={formData.company_location}
                      onChange={(e) => setFormData({ ...formData, company_location: e.target.value })}
                      disabled={!isEditingCompany}
                      placeholder="e.g. San Francisco, CA"
                      className="pl-10 border-gray-200 dark:border-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_email" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Company Email
                        </Label>
                        <div className="relative">
                          <Input
                            id="company_email"
                            type="email"
                            value={formData.company_email}
                            onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                            placeholder="company@example.com"
                            className="pl-10 bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Used as sender for candidate emails (shortlist, rejection).</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hr_email" className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          HR Email (applications & candidate contact)
                        </Label>
                        <div className="relative">
                          <Input
                            id="hr_email"
                            type="email"
                            value={formData.hr_email}
                            onChange={(e) => setFormData({ ...formData, hr_email: e.target.value })}
                            placeholder="hr@example.com"
                            className="pl-10 bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          This address receives applications and is shown in candidate emails.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website_url" className="text-gray-700 dark:text-gray-300">Website URL</Label>
                        <Input
                          id="website_url"
                          type="url"
                          value={formData.website_url || ''}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          placeholder="https://example.com"
                          className="bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin_url" className="text-gray-700 dark:text-gray-300">LinkedIn URL</Label>
                        <Input
                          id="linkedin_url"
                          type="url"
                          value={formData.linkedin_url || ''}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/company/your-company"
                          className="bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="twitter_url" className="text-gray-700 dark:text-gray-300">Twitter URL</Label>
                        <Input
                          id="twitter_url"
                          type="url"
                          value={formData.twitter_url || ''}
                          onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                          placeholder="https://twitter.com/your-company"
                          className="bg-white dark:bg-gray-800 text-foreground border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <ImageUpload
                        value={formData.company_logo_url}
                        onChange={(url) => setFormData({ ...formData, company_logo_url: url || '' })}
                        label="Company Logo"
                        accept="image/*"
                        maxSizeMB={5}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={async () => {
                          await handleSaveCompany()
                          setIsEditingCompany(false)
                        }}
                        disabled={isSaving}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-lg dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save company changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingCompany(false)
                          loadCompanyData()
                        }}
                        className="border-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No Company Information</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Please complete company setup to continue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card className="bg-background border border-border shadow-[0_22px_55px_-42px_rgba(15,23,42,0.35)]">
        <CardHeader className="bg-slate-50 /70 border-b border-border">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">Security & Privacy</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-normal mt-0.5">Manage your account security</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!showPasswordForm ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-border">
              <div>
                <h4 className="text-base font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Password
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to change password
                </p>
              </div>
              <Button
                onClick={() => setShowPasswordForm(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-none hover:shadow-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300 font-medium">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="bg-white dark:bg-gray-800 text-foreground pr-10 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300 font-medium">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 6 characters)"
                    className="bg-white dark:bg-gray-800 text-foreground pr-10 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300 font-medium">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="bg-white dark:bg-gray-800 text-foreground pr-10 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="bg-background border border-border shadow-[0_22px_55px_-42px_rgba(15,23,42,0.35)]">
        <CardHeader className="bg-slate-50 /70 border-b border-border">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">Account Actions</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-normal mt-0.5">Manage your account session</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-border">
            <div>
              <h4 className="text-base font-semibold text-foreground mb-1">Sign Out</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign out of your account and return to the login page
              </p>
            </div>
            <Button
              onClick={() => {
                void signOut()
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-none hover:shadow-none dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-background border-2 border-red-300 dark:border-red-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-b border-red-200 dark:border-red-800">
          <CardTitle className="flex items-center gap-3 text-red-700 dark:text-red-400">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold">Danger Zone</div>
              <div className="text-xs text-red-600 dark:text-red-400 font-normal mt-0.5">Irreversible actions</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <h4 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mb-4 leading-relaxed">
              Once you delete your account, there is no going back. This will permanently delete your account, 
              company data, job postings, and all associated information. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-red-900 dark:text-red-300 font-medium">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm:
                  </Label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 focus:border-red-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Permanently Delete Account
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
