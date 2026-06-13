'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, UploadCloud, FileText, PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Project {
  title: string
  description: string
  outcome: string
}

export function ReturneeUpdateModal({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [newSkills, setNewSkills] = useState<string>('')
  const [projects, setProjects] = useState<Project[]>([])

  const addProject = () => {
    setProjects([...projects, { title: '', description: '', outcome: '' }])
  }

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects]
    updated[index][field] = value
    setProjects(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      if (cvFile) formData.append('cv', cvFile)
      
      const skillsArray = newSkills.split(',').map(s => s.trim()).filter(Boolean)
      if (skillsArray.length > 0) {
        formData.append('newSkills', JSON.stringify(skillsArray))
      }
      
      const validProjects = projects.filter(p => p.title && p.description)
      if (validProjects.length > 0) {
        formData.append('projects', JSON.stringify(validProjects))
      }

      const res = await fetch('/api/candidate/profile/alumni-update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Welcome back! Your alumni bonus score has been applied.')
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
            {file ? <span className="font-medium text-slate-900">{file.name}</span> : <span>Click to upload new CV</span>}
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-indigo-600">Welcome Back!</DialogTitle>
          <DialogDescription>
            You are a proven Optiohire alumni. Update your profile with your latest achievements to get a massive score boost and unlock premium opportunities!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <FileUploader label="Upload Updated CV" file={cvFile} setFile={setCvFile} />

          <div className="space-y-2">
            <Label htmlFor="skills" className="text-sm font-semibold text-slate-700">New Skills Acquired</Label>
            <Input
              id="skills"
              placeholder="e.g., React, Node.js, Project Management (comma separated)"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-700">Recent Projects</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProject} className="gap-2">
                <PlusCircle className="w-4 h-4" /> Add Project
              </Button>
            </div>
            
            {projects.map((project, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3 relative bg-slate-50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="space-y-1">
                  <Label className="text-xs">Project Title</Label>
                  <Input 
                    placeholder="e.g. Migration to microservices" 
                    value={project.title} 
                    onChange={(e) => updateProject(index, 'title', e.target.value)} 
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea 
                    placeholder="What did you do?" 
                    value={project.description} 
                    onChange={(e) => updateProject(index, 'description', e.target.value)} 
                    className="bg-white resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Measurable Outcome</Label>
                  <Input 
                    placeholder="e.g. Increased system performance by 40%" 
                    value={project.outcome} 
                    onChange={(e) => updateProject(index, 'outcome', e.target.value)} 
                    className="bg-white"
                  />
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-slate-500 italic">No projects added yet.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Not right now
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Updating...' : 'Claim Alumni Bonus'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
