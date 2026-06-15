'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, Target, BookOpen, Upload, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface GapAnalysis {
  topMissingSkill: string | null
  insight: string
  allMissingSkills: { skill: string; count: number }[]
}

export function SkillGapRoadmap({ gapAnalysis, profileId }: { gapAnalysis: GapAnalysis, profileId: string }) {
  const [roadmapSteps, setRoadmapSteps] = useState<any[] | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState(false)
  const [certificateUrl, setCertificateUrl] = useState('')
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  if (!gapAnalysis.topMissingSkill) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-bold">You are a perfect match!</p>
          <p>No missing skills detected based on active job postings.</p>
        </CardContent>
      </Card>
    )
  }

  const generateRoadmap = async () => {
    setLoadingRoadmap(true)
    try {
      const res = await fetch(`/api/candidate/roadmap?skillName=${encodeURIComponent(gapAnalysis.topMissingSkill!)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setRoadmapSteps(data.steps)
      } else {
        toast.error('Failed to generate roadmap')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoadingRoadmap(false)
    }
  }

  const [isDragging, setIsDragging] = useState(false)

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certificateUrl && !certificateFile) return

    setUploading(true)
    try {
      // We pass a dummy skillId here for the prototype, in real app we'd fetch the skill_id 
      // from candidate_skills table or create it as unverified first.
      const dummySkillId = '00000000-0000-0000-0000-000000000000'
      const formData = new FormData()
      formData.append('skillId', dummySkillId)
      if (certificateUrl) formData.append('certificateUrl', certificateUrl)
      if (certificateFile) formData.append('certificate', certificateFile)

      const res = await fetch('/api/candidate/certificate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })
      const data = await res.json()
      if (data.success || res.ok) {
        toast.success('Certificate uploaded and sent for Admin review!')
        setCertificateUrl('')
        setCertificateFile(null)
      } else {
        toast.error(data.error || 'Failed to upload certificate')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setCertificateFile(e.dataTransfer.files[0])
      setCertificateUrl('')
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
              <Target className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                Strategic Gap: <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">{gapAnalysis.topMissingSkill}</span>
              </h3>
              <p className="text-base text-slate-600 italic leading-relaxed max-w-2xl">
                &ldquo;{gapAnalysis.insight}&rdquo;
              </p>
            </div>
          </div>
          
          {!roadmapSteps && (
            <Button 
              onClick={generateRoadmap} 
              disabled={loadingRoadmap}
              className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-6 rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 shrink-0"
            >
              {loadingRoadmap ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <BookOpen className="h-5 w-5 mr-2" />}
              Build Roadmap
            </Button>
          )}
        </div>
      </div>

      {roadmapSteps && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              Personalized Mastery Path
            </h4>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapSteps.map((step: any, idx: number) => (
              <div key={idx} className="group flex flex-col p-6 bg-white rounded-3xl shadow-sm border border-slate-200 transition-all hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-4 inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{step.description}</p>
                <a 
                  href={step.resource_url} 
                  className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 gap-1.5 transition-all group-hover:gap-2.5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {step.resource_label} <Zap className="h-3 w-3 fill-current" />
                </a>
              </div>
            ))}
          </div>
          
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Already mastered this?</h3>
              <p className="text-slate-500 text-sm">Upload your certificate to verify this skill and instantly boost your growth score.</p>
            </div>

            <form onSubmit={handleUploadCertificate} className="max-w-3xl mx-auto space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="certUrl" className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Option 1: Public Link</Label>
                  <Input 
                    id="certUrl" 
                    placeholder="https://coursera.org/verify/..." 
                    className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500"
                    value={certificateUrl}
                    onChange={(e) => {
                      setCertificateUrl(e.target.value)
                      if (e.target.value) setCertificateFile(null)
                    }}
                  />
                </div>
                
                <div className="relative flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase">OR</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Option 2: Direct Upload</Label>
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-2 flex justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-200 ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-50 shadow-inner' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 mb-4 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300 group-hover:text-indigo-400 transition-colors">
                        <Upload className="h-8 w-8" />
                      </div>
                      <div className="flex text-sm leading-6 text-slate-600 justify-center">
                        <label
                          htmlFor="certFile"
                          className="relative cursor-pointer rounded-md bg-transparent font-bold text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Click to upload</span>
                          <Input 
                            id="certFile" 
                            type="file" 
                            className="sr-only"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setCertificateFile(e.target.files[0])
                                setCertificateUrl('')
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-wide">
                        {certificateFile ? certificateFile.name : 'PDF, PNG, JPG (MAX 10MB)'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button type="submit" disabled={uploading || (!certificateUrl && !certificateFile)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 rounded-2xl font-bold transition-all active:scale-95">
                  {uploading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />}
                  Submit Verification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
