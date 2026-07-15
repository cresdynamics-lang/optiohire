'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UploadCloud, FileText } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function ProfileOnboardingModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const [bio, setBio] = useState('')
  const [jobCategory, setJobCategory] = useState('')
  const [roleId, setRoleId] = useState('')
  const [roleQuery, setRoleQuery] = useState('')
  const [roleResults, setRoleResults] = useState<{ id: string; title: string; group?: string }[]>([])
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [recLetterFile, setRecLetterFile] = useState<File | null>(null)

  useEffect(() => {
    const q = roleQuery.trim()
    if (q.length < 1) {
      setRoleResults([])
      return
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/roles?q=${encodeURIComponent(q)}&limit=12`)
      if (res.ok) {
        const data = await res.json()
        setRoleResults(data.roles || [])
      }
    }, 250)
    return () => clearTimeout(t)
  }, [roleQuery])

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      if (bio) formData.append('bio', bio)
      if (jobCategory) formData.append('jobCategory', jobCategory)
      if (cvFile) formData.append('cv', cvFile)
      if (coverLetterFile) formData.append('coverLetter', coverLetterFile)
      if (recLetterFile) formData.append('recommendationLetter', recLetterFile)

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

      xhr.onload = async () => {
        setLoading(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            if (data.success) {
              if (roleId && jobCategory) {
                try {
                  await fetch('/api/candidate/profile/settings', {
                    method: 'PATCH',
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      targetRoleCount: 1,
                      targetRoles: [{ id: roleId, title: jobCategory }],
                      jobCategory,
                    }),
                  })
                } catch { /* non-blocking */ }
              }
              setUploadStatus('success')
              toast.success('Profile updated successfully!')
              setTimeout(() => {
                onSuccess()
                onClose()
                setUploadStatus('idle')
                setUploadProgress(0)
              }, 1000)
            } else {
              setUploadStatus('idle')
              toast.error(data.message || data.error || 'Failed to update profile')
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

  const FileUploader = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
        <div className="flex flex-col items-center justify-center text-slate-500">
          {file ? <FileText className="mb-2 h-6 w-6 text-indigo-600" /> : <UploadCloud className="mb-2 h-6 w-6" />}
          <p className="text-sm text-center">
            {file ? <span className="font-medium text-slate-900">{file.name}</span> : <span>Click to upload or drag & drop</span>}
          </p>
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
              setFile(file)
            }
          }}
        />
      </label>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-indigo-600">Complete Your Profile</DialogTitle>
          <DialogDescription>
            Boost your profile score and get personalized job recommendations instantly by completing these details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Professional bio / profile text</Label>
            <Textarea
              id="bio"
              placeholder="Paste your experience, skills, and summary here - especially if your PDF cannot be read."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none"
              rows={4}
            />
            <p className="text-xs text-slate-500">
              AI maps this into your talent profile. Prefer Word (.docx) if your PDF is a scan.
            </p>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-sm font-semibold text-slate-700">Target role</Label>
            <Input
              placeholder="Search roles (Frontend Engineering, Data Analyst…)"
              value={roleQuery || jobCategory}
              onChange={(e) => {
                setRoleQuery(e.target.value)
                setJobCategory(e.target.value)
                setRoleId('')
              }}
            />
            {jobCategory && roleId && (
              <p className="text-xs text-indigo-600 font-medium">Selected: {jobCategory}</p>
            )}
            {roleResults.length > 0 && (
              <div className="absolute z-30 mt-1 max-h-44 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {roleResults.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50"
                    onClick={() => {
                      setJobCategory(r.title)
                      setRoleId(r.id)
                      setRoleQuery('')
                      setRoleResults([])
                    }}
                  >
                    <span className="font-medium">{r.title}</span>
                    {r.group && <span className="text-xs text-slate-500">{r.group}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploader label="Upload CV / Resume" file={cvFile} setFile={setCvFile} />
            <FileUploader label="Upload Cover Letter" file={coverLetterFile} setFile={setCoverLetterFile} />
          </div>
          <FileUploader label="Upload Recommendation Letter" file={recLetterFile} setFile={setRecLetterFile} />

          {uploadStatus === 'uploading' && (
            <div className="pt-2 pb-4">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                <span>Uploading files...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center justify-center p-3 mb-4 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              <UploadCloud className="w-4 h-4 mr-2" /> Upload Complete!
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Skip for now
            </Button>
            <Button type="submit" disabled={loading || (!bio && !jobCategory && !cvFile)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? `Uploading (${uploadProgress}%)` : 'Save Profile & Get Scored'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
