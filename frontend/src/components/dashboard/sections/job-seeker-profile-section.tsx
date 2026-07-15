import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  LogOut, 
  Mail, 
  User, 
  ShieldCheck, 
  Briefcase, 
  CalendarClock, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Search,
  X
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'

interface TargetRole {
  id: string
  title: string
  group?: string | null
}

interface RoleSearchResult {
  id: string
  title: string
  group?: string | null
}

interface University {
  university_id: string
  name: string
  short_name: string | null
  type: string
}

const UNIVERSITY_TYPE_LABEL: Record<string, string> = {
  public: 'Public',
  private: 'Private',
  specialized: 'Specialized',
  constituent: 'Constituent',
}

export function JobSeekerProfileSection() {
  const { user, signOut, refreshUser } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [universities, setUniversities] = useState<University[]>([])
  const [uniSearch, setUniSearch] = useState('')
  const [selectedUniversityName, setSelectedUniversityName] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    universityId: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    avatarUrl: user?.avatarUrl || '',
    targetRoleCount: 3,
  })
  const [targetRoles, setTargetRoles] = useState<TargetRole[]>([])
  const [skills, setSkills] = useState<{ name: string; score: number }[]>([])
  const [roleQuery, setRoleQuery] = useState('')
  const [roleResults, setRoleResults] = useState<RoleSearchResult[]>([])
  const [searchingRoles, setSearchingRoles] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [aiNote, setAiNote] = useState<string | null>(null)
  const [savingRoles, setSavingRoles] = useState(false)

  const loadProfileSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('token')
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      const [settingsRes, universitiesRes] = await Promise.all([
        fetch('/api/candidate/profile/settings', { headers }),
        fetch('/api/universities?country=KE'),
      ])

      if (universitiesRes.ok) {
        const uniData = await universitiesRes.json()
        setUniversities(uniData.universities || [])
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        const s = data.settings || {}
        setFormData({
          name: s.name || user?.name || '',
          universityId: s.universityId || '',
          linkedinUrl: s.linkedinUrl || '',
          githubUrl: s.githubUrl || '',
          portfolioUrl: s.portfolioUrl || '',
          avatarUrl: s.avatarUrl || user?.avatarUrl || '',
          targetRoleCount: Number(s.targetRoleCount) || 3,
        })
        setTargetRoles(Array.isArray(s.targetRoles) ? s.targetRoles : [])
        setSkills(Array.isArray(s.skills) ? s.skills : [])
        setSelectedUniversityName(s.university?.name || null)
      }
    } catch (error) {
      console.error('Failed to load profile settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.name])

  useEffect(() => {
    void loadProfileSettings()
  }, [loadProfileSettings])

  useEffect(() => {
    const q = roleQuery.trim()
    if (q.length < 1) {
      setRoleResults([])
      return
    }
    const t = setTimeout(async () => {
      setSearchingRoles(true)
      try {
        const res = await fetch(`/api/roles?q=${encodeURIComponent(q)}&limit=15`)
        if (res.ok) {
          const data = await res.json()
          setRoleResults(data.roles || [])
        }
      } finally {
        setSearchingRoles(false)
      }
    }, 250)
    return () => clearTimeout(t)
  }, [roleQuery])

  const filteredUniversities = useMemo(() => {
    const q = uniSearch.trim().toLowerCase()
    if (!q) return universities
    return universities.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      (u.short_name && u.short_name.toLowerCase().includes(q))
    )
  }, [universities, uniSearch])

  const handleUpdateProfile = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const resp = await fetch('/api/candidate/profile/settings', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          universityId: formData.universityId || null,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
          avatarUrl: formData.avatarUrl || null,
        }),
      })

      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to save profile')

      const s = data.settings || {}
      setFormData((prev) => ({
        ...prev,
        name: s.name || '',
        universityId: s.universityId || '',
        linkedinUrl: s.linkedinUrl || '',
        githubUrl: s.githubUrl || '',
        portfolioUrl: s.portfolioUrl || '',
        avatarUrl: s.avatarUrl || '',
      }))
      setSelectedUniversityName(s.university?.name || null)
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      setUniSearch('')
      await refreshUser()
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setIsSaving(false)
    }
  }

  const addRole = (role: RoleSearchResult | TargetRole) => {
    if (targetRoles.some((r) => r.id === role.id)) return
    if (targetRoles.length >= formData.targetRoleCount) {
      setSaveMessage({
        type: 'error',
        text: `You set ${formData.targetRoleCount} target roles. Increase the number first, or remove one.`,
      })
      return
    }
    setTargetRoles((prev) => [...prev, { id: role.id, title: role.title, group: role.group }])
    setRoleQuery('')
    setRoleResults([])
  }

  const removeRole = (id: string) => setTargetRoles((prev) => prev.filter((r) => r.id !== id))

  const handleSuggestRoles = async () => {
    setSuggesting(true)
    setAiNote(null)
    setSaveMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const res = await fetch('/api/candidate/profile/suggest-roles', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: formData.targetRoleCount || 3 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to suggest roles')
      const suggested = (data.suggestions || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        group: s.group,
      }))
      setTargetRoles(suggested.slice(0, formData.targetRoleCount || 3))
      setAiNote(data.aiNote || null)
      if (!suggested.length) {
        setSaveMessage({ type: 'error', text: 'No role matches yet — add skills or search roles below.' })
      }
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'AI suggestion failed' })
    } finally {
      setSuggesting(false)
    }
  }

  const handleSaveRoles = async () => {
    setSavingRoles(true)
    setSaveMessage(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')
      const resp = await fetch('/api/candidate/profile/settings', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRoleCount: formData.targetRoleCount,
          targetRoles,
          jobCategory: targetRoles[0]?.title || undefined,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Failed to save roles')
      setTargetRoles(Array.isArray(data.settings?.targetRoles) ? data.settings.targetRoles : targetRoles)
      setFormData((prev) => ({
        ...prev,
        targetRoleCount: Number(data.settings?.targetRoleCount) || prev.targetRoleCount,
      }))
      setSaveMessage({ type: 'success', text: 'Target roles saved to your profile.' })
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Failed to save roles' })
    } finally {
      setSavingRoles(false)
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
      const token = localStorage.getItem('token')
      const resp = await fetch('/api/user/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await resp.json()
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      await signOut({ next: '/' })
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setSaveMessage({ type: 'error', text: error.message || 'Failed to delete account. Please contact support.' })
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8 px-1 pb-10 sm:px-0">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent dark:from-slate-800/50" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300">
            Candidate account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl ">My profile</h1>
          <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Manage how employers reach you. Set how many roles your skills support — search the catalog or let AI suggest fits.
          </p>
        </div>
      </div>

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

      <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/85">
        <CardHeader className="border-b border-slate-100 pb-6 dark:border-gray-800">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-inner">
              <Briefcase className="h-5 w-5" />
            </span>
            Target roles
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            Enter how many roles you want to pursue, search the full catalog, or get AI suggestions from your skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Number of target roles</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.targetRoleCount}
                onChange={(e) => setFormData({ ...formData, targetRoleCount: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={() => void handleSuggestRoles()} disabled={suggesting} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {suggesting ? 'Asking AI…' : 'Suggest with AI from my skills'}
              </Button>
            </div>
          </div>
          {aiNote && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
              <span className="font-semibold">AI coach: </span>{aiNote}
            </div>
          )}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 8).map((s) => (
                <span key={s.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{s.name}</span>
              ))}
            </div>
          )}
          <div className="space-y-2 relative">
            <Label className="flex items-center gap-2"><Search className="h-4 w-4" /> Search roles</Label>
            <Input placeholder="e.g. Frontend, Data Analyst, Hospitality…" value={roleQuery} onChange={(e) => setRoleQuery(e.target.value)} />
            {searchingRoles && <p className="text-xs text-muted-foreground">Searching…</p>}
            {roleResults.length > 0 && (
              <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {roleResults.map((r) => (
                  <button key={r.id} type="button" className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => addRole(r)}>
                    <span className="font-medium text-slate-900">{r.title}</span>
                    {r.group && <span className="text-xs text-slate-500">{r.group}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {targetRoles.length === 0 && <p className="text-sm text-muted-foreground">No target roles selected yet.</p>}
            {targetRoles.map((r) => (
              <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-900">
                {r.title}
                <button type="button" aria-label={`Remove ${r.title}`} onClick={() => removeRole(r.id)} className="text-blue-700 hover:text-blue-950">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <Button onClick={() => void handleSaveRoles()} disabled={savingRoles} className="rounded-2xl">
            {savingRoles ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save target roles'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_22px_70px_-48px_rgba(15,23,42,0.38)] dark:border-gray-800 dark:bg-gray-900/85">
        <CardHeader className="border-b border-slate-100 pb-6 dark:border-gray-800 flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-inner  dark:text-slate-200">
                <User className="h-5 w-5" />
              </span>
              Account details
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              Information tied to your sign-in for candidate-facing workflows.
            </CardDescription>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-9">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
                <ImageUpload
                  label="Profile photo"
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url || '' }))}
                  endpoint="/api/upload/profile-image?folder=avatars"
                />
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    University / College (Kenya)
                  </Label>
                  <Input
                    placeholder="Search universities..."
                    value={uniSearch}
                    onChange={(e) => setUniSearch(e.target.value)}
                  />
                  <Select
                    value={formData.universityId || undefined}
                    onValueChange={(value) => {
                      const uni = universities.find((u) => u.university_id === value)
                      setFormData({ ...formData, universityId: value })
                      setSelectedUniversityName(uni?.name || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredUniversities.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">No universities found</div>
                      ) : (
                        filteredUniversities.map((u) => (
                          <SelectItem key={u.university_id} value={u.university_id}>
                            {u.name}
                            {u.short_name ? ` (${u.short_name})` : ''}
                            {' · '}
                            {UNIVERSITY_TYPE_LABEL[u.type] || u.type}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {universities.length} accredited Kenyan universities available
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input placeholder="https://linkedin.com/in/..." value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub / Portfolio</Label>
                  <Input placeholder="https://github.com/..." value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => void handleUpdateProfile()} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading profile...
            </div>
          ) : (
          <>
          <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Account Type</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Candidate
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Jobs + Interviews
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Availability</p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                <CalendarClock className="h-4 w-4 text-violet-600" />
                Ready for interviews
              </p>
            </div>
          </div>
          {(formData.name || user?.name || formData.avatarUrl || user?.avatarUrl) && (
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              {(formData.avatarUrl || user?.avatarUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.avatarUrl || user?.avatarUrl || ''}
                  alt=""
                  className="h-14 w-14 rounded-full border border-slate-200 object-cover"
                />
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 text-foreground">{formData.name || user?.name || 'Not set'}</p>
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              University
            </p>
            <p className="mt-1 text-foreground">
              {selectedUniversityName || (
                <span className="text-muted-foreground">Not set — tap Edit Profile to choose your university</span>
              )}
            </p>
          </div>
          {targetRoles.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Target roles ({targetRoles.length}/{formData.targetRoleCount})
              </p>
              <p className="mt-1 text-foreground">{targetRoles.map((r) => r.title).join(' · ')}</p>
            </div>
          )}
          {(formData.linkedinUrl || formData.githubUrl) && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Links
              </p>
              <div className="mt-1 flex gap-3 text-sm text-foreground">
                {formData.linkedinUrl && <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">LinkedIn</a>}
                {formData.githubUrl && <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Portfolio</a>}
              </div>
            </div>
          )}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Email
            </p>
            <p className="mt-1 flex items-center gap-2 text-foreground">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="break-all">{user?.email || '—'}</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center dark:border-gray-800">
            <Button variant="outline" className="min-h-[44px] rounded-2xl border-slate-300 bg-white touch-manipulation dark:bg-gray-950 dark:border-gray-700 sm:min-h-10" asChild>
              <Link href="/">Back to site</Link>
            </Button>
            <Button
              className="min-h-[44px] gap-2 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-sm touch-manipulation sm:min-h-10 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() => {
                void signOut()
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-3xl border-2 border-red-300 bg-white shadow-xl dark:border-red-800 dark:bg-gray-900/85">
        <CardHeader className="rounded-t-3xl border-b border-red-100 bg-red-50/50 pb-6 dark:border-red-900/30 dark:bg-red-950/10">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight text-red-700 dark:text-red-400">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/20">
              <AlertTriangle className="h-5 w-5" />
            </span>
            Danger Zone
          </CardTitle>
          <CardDescription className="text-base text-red-600/80 dark:text-red-400/80">
            Irreversible actions for your candidate account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-5 bg-red-50/30 dark:bg-red-950/5 border border-red-100 dark:border-red-900/30 rounded-2xl">
            <h4 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </h4>
            <p className="text-sm text-red-700/80 dark:text-red-400/80 mb-4 leading-relaxed">
              Once you delete your account, all your interview sessions, scores, and profile data will be permanently removed. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete my account
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-red-900 dark:text-red-300 font-medium text-sm">
                    Type <span className="font-mono font-bold bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
                  </Label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="h-11 rounded-xl bg-white dark:bg-gray-800 border-red-200 dark:border-red-800 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    variant="destructive"
                    className="h-11 flex-1 rounded-2xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Permanently Delete
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                    variant="outline"
                    className="h-11 rounded-2xl border-slate-200 dark:border-gray-800 dark:bg-gray-900"
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
