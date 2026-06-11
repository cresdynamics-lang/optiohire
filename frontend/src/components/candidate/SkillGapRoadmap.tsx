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
    <div className="space-y-6">
      <Card className="border-indigo-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-50 dark:bg-indigo-950 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Skill Gap: <span className="text-indigo-600 dark:text-indigo-400">{gapAnalysis.topMissingSkill}</span>
            </h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 italic">
            "{gapAnalysis.insight}"
          </p>
          
          {!roadmapSteps && (
            <Button 
              onClick={generateRoadmap} 
              disabled={loadingRoadmap}
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
            >
              {loadingRoadmap ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookOpen className="h-4 w-4 mr-2" />}
              Generate AI Learning Roadmap
            </Button>
          )}
        </div>
      </Card>

      {roadmapSteps && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-xl font-bold mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-indigo-600" /> 
            Your Personalized Path to Mastery
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmapSteps.map((step: any, idx: number) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">{step.step}</div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{step.description}</p>
                <a href={step.resource_url} className="text-sm text-blue-600 hover:underline inline-flex items-center" target="_blank" rel="noopener noreferrer">
                  {step.resource_label} →
                </a>
              </div>
            ))}
          </div>
          
          <Card className="mt-8 border-dashed bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg">Already know this? Mastered it?</CardTitle>
              <CardDescription>Upload a link or a file to your certificate to verify this skill and boost your score.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadCertificate} className="flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certUrl">Option 1: Certificate Link (URL)</Label>
                    <Input 
                      id="certUrl" 
                      placeholder="https://coursera.org/verify/..." 
                      value={certificateUrl}
                      onChange={(e) => {
                        setCertificateUrl(e.target.value)
                        if (e.target.value) setCertificateFile(null)
                      }}
                    />
                  </div>
                  
                  <div className="relative my-4 flex items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink-0 mx-4 text-sm text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                  </div>

                  <div className="space-y-2">
                    <Label>Option 2: Upload Certificate (PDF/Image)</Label>
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors duration-200 ${
                        isDragging 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-300 justify-center">
                          <label
                            htmlFor="certFile"
                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <span>Upload a file</span>
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
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 mt-2">
                          {certificateFile ? certificateFile.name : 'PDF, PNG, JPG up to 10MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={uploading || (!certificateUrl && !certificateFile)} className="w-full md:w-auto self-end mt-2">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Submit to Admin
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
