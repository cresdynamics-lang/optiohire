'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UploadCloud, FileText, CheckCircle2, FileImage, ShieldCheck, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export function ReturningCandidateWelcomeModal({
  user,
  onClose,
  onSuccess
}: {
  user: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bio, setBio] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [timeSinceLastLogin, setTimeSinceLastLogin] = useState('')

  useEffect(() => {
    // Only show if user has logged in before, and hasn't seen the modal this session
    if (user?.previous_login_at && typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem('hasSeenWelcomeModal')
      if (!hasSeen) {
        const timeStr = formatDistanceToNow(new Date(user.previous_login_at), { addSuffix: true })
        setTimeSinceLastLogin(timeStr)
        setIsOpen(true)
        sessionStorage.setItem('hasSeenWelcomeModal', 'true')
      }
    }
  }, [user])

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bio && !uploadFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      if (bio) formData.append('bio', bio)
      // Since it's a unified uploader, we'll append to 'cv' to leverage existing backend parsing
      if (uploadFile) formData.append('cv', uploadFile)

      setUploadStatus('uploading')
      setUploadProgress(0)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/candidate/profile/onboarding')
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        setLoading(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            if (data.success) {
              setUploadStatus('success')
              const mapped = data.mapping
              const detail =
                mapped?.skills?.length
                  ? ` Mapped ${mapped.skills.length} skills${mapped.roles?.length ? ` and ${mapped.roles.length} roles` : ''}.`
                  : ''
              toast.success((data.message || 'Profile updated.') + detail)
              setTimeout(() => {
                if (onSuccess) onSuccess()
                handleClose()
                setUploadStatus('idle')
                setUploadProgress(0)
              }, 2000)
            } else {
              setUploadStatus('idle')
              toast.error(data.message || data.details || data.error || 'Failed to update profile')
            }
          } catch (e) {
            setUploadStatus('idle')
            toast.error('Invalid server response')
          }
        } else {
          setUploadStatus('idle')
          try {
            const data = JSON.parse(xhr.responseText)
            toast.error(data.message || data.error || 'Failed to update profile')
          } catch {
            toast.error('Failed to update profile')
          }
        }
      }

      xhr.onerror = () => {
        setLoading(false)
        setUploadStatus('idle')
        toast.error('Network error during upload')
      }

      xhr.send(formData)
    } catch (err) {
      setLoading(false)
      setUploadStatus('idle')
      toast.error('Network error during upload')
    }
  }

  const getFileIcon = () => {
    if (!uploadFile) return <UploadCloud className="mb-2 h-8 w-8" />
    if (uploadFile.type.startsWith('image/')) return <FileImage className="mb-2 h-8 w-8 text-indigo-600" />
    return <FileText className="mb-2 h-8 w-8 text-indigo-600" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        <DialogDescription className="sr-only">
          Welcome back modal for returning candidates to update their profile and skills.
        </DialogDescription>
        <div className="flex flex-col md:flex-row">
          
          {/* LEFT COLUMN: Main Interaction */}
          <div className="flex-1 p-6 md:p-8 border-r border-slate-100">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-bold text-slate-900 tracking-tight">
                Nice! {user?.name?.split(' ')[0] || 'There'} returns 🎉
              </DialogTitle>
              <p className="text-lg text-slate-600 mt-2">
                Learnt anything new since {timeSinceLastLogin}?
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">
                  What&apos;s new with you? (or paste profile text if CV won&apos;t read)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your experience, skills, and summary. If your PDF is a scan and AI cannot read it, paste the details here so we can map your profile."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="resize-none min-h-[100px] text-base"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Upload CV / resume (Word .docx preferred)</Label>
                <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 hover:bg-slate-100 hover:border-indigo-300 transition-all">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    {getFileIcon()}
                    <p className="text-sm text-center">
                      {uploadFile ? (
                        <span className="font-medium text-indigo-700 text-base">{uploadFile.name}</span>
                      ) : (
                        <span>Click to upload or drag & drop</span>
                      )}
                    </p>
                    {!uploadFile && (
                      <p className="text-xs text-slate-400 mt-2 text-center max-w-[280px]">
                        PDF or Word (.docx). If the PDF is image-only / unreadable, upload Word or paste your details above.
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File exceeds 10MB limit')
                          return
                        }
                        if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                          toast.error('Audio and video files are not supported')
                          return
                        }
                        setUploadFile(file)
                      }
                    }}
                  />
                </label>
              </div>

              {uploadStatus === 'uploading' && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                    <span>Updating profile...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center justify-center p-4 rounded-xl bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Upload Complete!
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={loading} className="text-slate-500 hover:text-slate-700">
                  Maybe later
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || (!bio && !uploadFile)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? `Uploading (${uploadProgress}%)` : 'Update Profile & Score'}
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Value Props & Info Cards */}
          <div className="w-full md:w-[320px] bg-slate-50 p-6 md:p-8 flex flex-col gap-6">
            
            {/* Current Score Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">Your Talent Score</h3>
              </div>
              <p className="text-sm text-slate-600">
                Regularly updating your profile with newly acquired skills helps our AI engine calculate a higher talent score for you behind the scenes.
              </p>
            </div>

            {/* Perfect Match Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 shadow-md text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-indigo-100" />
                  <h3 className="font-semibold text-white">Perfect Match Waiting?</h3>
                </div>
                <p className="text-sm text-indigo-100 mb-4">
                  We might have a perfect job match waiting for you right now. 
                </p>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                  <p className="text-xs font-medium text-white/90 text-center uppercase tracking-wider">
                    Update profile to unlock matches
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
