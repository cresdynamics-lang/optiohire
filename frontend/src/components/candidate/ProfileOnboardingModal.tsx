'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [bio, setBio] = useState('')
  const [jobCategory, setJobCategory] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)
  const [recLetterFile, setRecLetterFile] = useState<File | null>(null)

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

      const res = await fetch('/api/candidate/profile/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Profile updated successfully!')
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || 'Failed to update profile')
      }
    } catch (err) {
      toast.error('Network error during upload')
    } finally {
      setLoading(false)
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
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            if (e.target.files?.[0]) setFile(e.target.files[0])
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
            <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell recruiters a bit about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-semibold text-slate-700">Job Category</Label>
            <Select value={jobCategory} onValueChange={setJobCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select your primary field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Software Engineering</SelectItem>
                <SelectItem value="Finance">Finance & Accounting</SelectItem>
                <SelectItem value="Marketing">Marketing & Sales</SelectItem>
                <SelectItem value="Design">Design & UX</SelectItem>
                <SelectItem value="Product">Product Management</SelectItem>
                <SelectItem value="HR">Human Resources</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploader label="Upload CV / Resume" file={cvFile} setFile={setCvFile} />
            <FileUploader label="Upload Cover Letter" file={coverLetterFile} setFile={setCoverLetterFile} />
          </div>
          <FileUploader label="Upload Recommendation Letter" file={recLetterFile} setFile={setRecLetterFile} />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Skip for now
            </Button>
            <Button type="submit" disabled={loading || (!bio && !jobCategory && !cvFile)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Saving...' : 'Save Profile & Get Scored'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
