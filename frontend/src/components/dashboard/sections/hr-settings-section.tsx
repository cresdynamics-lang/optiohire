'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  User,
  Building2,
  Bell,
  Shield,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { useAuth } from '@/hooks/use-auth'
import { TemplatesSection } from './templates-section'

type Tab = 'profile' | 'company' | 'notifications' | 'templates' | 'security'

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'templates', label: 'Templates', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
]

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

function isTab(value: string | null): value is Tab {
  return !!value && TABS.some((t) => t.id === value)
}

export function HrSettingsSection() {
  const { user, signOut, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialTab = isTab(searchParams.get('tab')) ? (searchParams.get('tab') as Tab) : 'profile'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [profile, setProfile] = useState({ name: '', email: '' })
  const [company, setCompany] = useState({
    company_name: '',
    company_email: '',
    hr_email: '',
    hiring_manager_email: '',
    company_location: '',
    website_url: '',
    linkedin_url: '',
    twitter_url: '',
    company_logo_url: '',
  })
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    report_notifications: true,
    application_notifications: true,
    interview_reminders: true,
    weekly_summary: true,
    auto_generate_reports: true,
    notification_frequency: 'realtime',
  })
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const flash = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 4000)
  }

  useEffect(() => {
    const fromUrl = searchParams.get('tab')
    if (isTab(fromUrl)) setTab(fromUrl)
    else setTab('profile')
  }, [searchParams])

  const selectTab = (next: Tab) => {
    setTab(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'profile') params.delete('tab')
    else params.set('tab', next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [meRes, prefsRes] = await Promise.all([
        fetch('/api/user/me', { headers: authHeaders() }),
        fetch('/api/user/preferences', { headers: authHeaders() }),
      ])
      const me = await meRes.json().catch(() => ({}))
      const preferences = await prefsRes.json().catch(() => ({}))

      setProfile({
        name: me.name || user?.name || '',
        email: me.email || user?.email || '',
      })
      setCompany({
        company_name: me.companyName || user?.companyName || '',
        company_email: me.companyEmail || user?.companyEmail || '',
        hr_email: me.hrEmail || user?.hrEmail || me.email || user?.email || '',
        hiring_manager_email: me.hiringManagerEmail || user?.hiringManagerEmail || '',
        company_location: me.companyLocation || user?.companyLocation || '',
        website_url: me.websiteUrl || '',
        linkedin_url: me.linkedinUrl || '',
        twitter_url: me.twitterUrl || '',
        company_logo_url: me.companyLogoUrl || user?.companyLogoUrl || '',
      })
      if (prefsRes.ok) {
        setPrefs({
          email_notifications: preferences.email_notifications ?? true,
          report_notifications: preferences.report_notifications ?? true,
          application_notifications: preferences.application_notifications ?? true,
          interview_reminders: preferences.interview_reminders ?? true,
          weekly_summary: preferences.weekly_summary ?? true,
          auto_generate_reports: preferences.auto_generate_reports ?? true,
          notification_frequency: preferences.notification_frequency || 'realtime',
        })
      }
    } catch {
      flash('error', 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name: profile.name.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save profile')
      flash('success', 'Profile saved')
      await refreshUser()
      await load()
    } catch (e: any) {
      flash('error', e.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const saveCompany = async () => {
    if (!company.company_name.trim() || !company.company_email.trim() || !company.hr_email.trim()) {
      flash('error', 'Company name, company email, and HR email are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/company', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          company_name: company.company_name.trim(),
          company_email: company.company_email.trim(),
          hr_email: company.hr_email.trim(),
          hiring_manager_email: company.hiring_manager_email.trim() || null,
          company_location: company.company_location.trim() || null,
          website_url: company.website_url.trim() || null,
          linkedin_url: company.linkedin_url.trim() || null,
          twitter_url: company.twitter_url.trim() || null,
          company_logo_url: company.company_logo_url || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save company')
      flash('success', 'Company settings saved')
      await refreshUser()
      await load()
    } catch (e: any) {
      flash('error', e.message || 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  const savePrefs = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(prefs),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to save preferences')
      flash('success', 'Notification preferences saved')
    } catch (e: any) {
      flash('error', e.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      flash('error', 'New passwords do not match')
      return
    }
    if (password.newPassword.length < 8) {
      flash('error', 'New password must be at least 8 characters')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' })
      flash('success', 'Password updated')
    } catch (e: any) {
      flash('error', e.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      flash('error', 'Type DELETE to confirm account deletion')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to delete account')
      await signOut({ next: '/' })
    } catch (e: any) {
      flash('error', e.message || 'Failed to delete account')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D2DDD]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage your profile, company details, notification preferences, and security.
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit border-slate-200/90 shadow-sm dark:border-slate-800">
          <CardContent className="space-y-1 p-3">
            {TABS.map((t) => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTab(t.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    active
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              )
            })}
          </CardContent>
        </Card>

        <div className="min-w-0">
          {tab === 'profile' && (
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle>Profile settings</CardTitle>
                <CardDescription>Your personal account details shown across the HR workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="hr-name">Full name</Label>
                  <Input
                    id="hr-name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hr-email">Email</Label>
                  <Input id="hr-email" value={profile.email} disabled className="bg-slate-50 dark:bg-slate-900" />
                  <p className="text-xs text-muted-foreground">Email is used for sign-in and alerts. Contact support to change it.</p>
                </div>
                <Button onClick={() => void saveProfile()} disabled={saving} className="bg-[#2D2DDD] hover:bg-[#2525c4]">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save profile
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === 'company' && (
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle>Company settings</CardTitle>
                <CardDescription>Employer branding and contact details used on job posts and emails.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  <Label>Company logo</Label>
                  <ImageUpload
                    value={company.company_logo_url}
                    onChange={(url) => setCompany((c) => ({ ...c, company_logo_url: url || '' }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Company name</Label>
                    <Input
                      value={company.company_name}
                      onChange={(e) => setCompany((c) => ({ ...c, company_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company email</Label>
                    <Input
                      type="email"
                      value={company.company_email}
                      onChange={(e) => setCompany((c) => ({ ...c, company_email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>HR email</Label>
                    <Input
                      type="email"
                      value={company.hr_email}
                      onChange={(e) => setCompany((c) => ({ ...c, hr_email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hiring manager email</Label>
                    <Input
                      type="email"
                      value={company.hiring_manager_email}
                      onChange={(e) => setCompany((c) => ({ ...c, hiring_manager_email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={company.company_location}
                      onChange={(e) => setCompany((c) => ({ ...c, company_location: e.target.value }))}
                      placeholder="Nairobi, Kenya"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={company.website_url}
                      onChange={(e) => setCompany((c) => ({ ...c, website_url: e.target.value }))}
                      placeholder="https://"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input
                      value={company.linkedin_url}
                      onChange={(e) => setCompany((c) => ({ ...c, linkedin_url: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Twitter / X</Label>
                    <Input
                      value={company.twitter_url}
                      onChange={(e) => setCompany((c) => ({ ...c, twitter_url: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={() => void saveCompany()} disabled={saving} className="bg-[#2D2DDD] hover:bg-[#2525c4]">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save company
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose which hiring alerts you receive and how often.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 max-w-xl">
                {([
                  ['email_notifications', 'Email notifications'],
                  ['application_notifications', 'New applications'],
                  ['interview_reminders', 'Interview reminders'],
                  ['report_notifications', 'Report ready alerts'],
                  ['weekly_summary', 'Weekly summary'],
                  ['auto_generate_reports', 'Auto-generate reports'],
                ] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                    <Switch
                      id={key}
                      checked={Boolean(prefs[key])}
                      onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [key]: checked }))}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={prefs.notification_frequency}
                    onChange={(e) => setPrefs((p) => ({ ...p, notification_frequency: e.target.value }))}
                  >
                    <option value="realtime">Realtime</option>
                    <option value="daily">Daily digest</option>
                    <option value="weekly">Weekly digest</option>
                  </select>
                </div>
                <Button onClick={() => void savePrefs()} disabled={saving} className="bg-[#2D2DDD] hover:bg-[#2525c4]">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === 'templates' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Email templates</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Customize shortlist, rejection, and interview emails sent from your hiring workspace.
                </p>
              </div>
              <TemplatesSection />
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-6">
              <Card className="border-slate-200/90 shadow-sm dark:border-slate-800">
                <CardHeader>
                  <CardTitle>Password & security</CardTitle>
                  <CardDescription>Update your sign-in password for this HR account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                  {([
                    ['currentPassword', 'Current password', 'current'],
                    ['newPassword', 'New password', 'next'],
                    ['confirmPassword', 'Confirm new password', 'confirm'],
                  ] as const).map(([field, label, showKey]) => (
                    <div key={field} className="space-y-2">
                      <Label>{label}</Label>
                      <div className="relative">
                        <Input
                          type={showPw[showKey] ? 'text' : 'password'}
                          value={password[field]}
                          onChange={(e) => setPassword((p) => ({ ...p, [field]: e.target.value }))}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          onClick={() => setShowPw((s) => ({ ...s, [showKey]: !s[showKey] }))}
                        >
                          {showPw[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={() => void changePassword()} disabled={saving} className="bg-[#2D2DDD] hover:bg-[#2525c4]">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                    Update password
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Forgot your password?{' '}
                    <Link href="/hr/auth/forgot-password" className="text-[#2D2DDD] hover:underline">
                      Reset via email
                    </Link>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200/80 shadow-sm dark:border-red-900/50">
                <CardHeader>
                  <CardTitle className="text-red-700 dark:text-red-400">Danger zone</CardTitle>
                  <CardDescription>Permanently delete your HR account and associated company access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-w-xl">
                  <Input
                    placeholder='Type DELETE to confirm'
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                  />
                  <Button variant="destructive" onClick={() => void deleteAccount()} disabled={saving || deleteConfirm !== 'DELETE'}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HrSettingsSection
