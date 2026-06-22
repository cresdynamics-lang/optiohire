import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Eye, Building2, Clock, Calendar, CheckCircle2, Sparkles, Briefcase } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { JobPostingFormData } from '@/types'

interface JobPreviewSheetProps {
  formData: JobPostingFormData
  workType: string
  customWorkType: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  if (days < 7) return `Posted ${days} days ago`
  return `Posted ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return null
  const d = new Date(deadline)
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  return { formatted, daysLeft: diff }
}

export function JobPreviewSheet({ formData, workType, customWorkType }: JobPreviewSheetProps) {
  const finalWorkType = workType === 'Custom' ? customWorkType : workType;
  const deadline = formatDeadline(formData.application_deadline || null)
  const initials = (formData.company_name || 'CO').slice(0, 2).toUpperCase()
  const skills = formData.required_skills || []

  // Create preview description with work type appended (just like backend submission)
  const previewDescription = formData.job_description 
    ? `${formData.job_description}\n\n[Work Type: ${finalWorkType}]` 
    : '';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview Job
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50 p-0 sm:p-0">
        <SheetHeader className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <SheetTitle>Job Preview</SheetTitle>
        </SheetHeader>
        
        <div className="p-6 space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-md">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-900">{formData.job_title || 'Untitled Job'}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {formData.company_name || 'Your Company'}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    Posted today
                  </span>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Actively Hiring
                  </span>
                  {deadline && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${
                      deadline.daysLeft <= 3
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      <Calendar className="h-3.5 w-3.5" />
                      Closes {deadline.formatted}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              About the Role
            </h2>
            <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed prose-li:marker:text-blue-500">
              {previewDescription ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {previewDescription}
                </ReactMarkdown>
              ) : (
                <p className="text-slate-400 italic">No description provided yet.</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Skills & Requirements
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  )
}
