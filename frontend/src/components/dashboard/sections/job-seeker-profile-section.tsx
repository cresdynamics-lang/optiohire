import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  AlertCircle
} from 'lucide-react'

export function JobSeekerProfileSection() {
  const { user, signOut } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
            Manage how employers reach you. Employer-only tools such as company setup and job postings stay out of
            this workspace by design.
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
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 shadow-inner  dark:text-slate-200">
              <User className="h-5 w-5" />
            </span>
            Account details
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-400">
            Information tied to your sign-in for candidate-facing workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
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
          {user?.name && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Name
              </p>
              <p className="mt-1 text-foreground">{user.name}</p>
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
