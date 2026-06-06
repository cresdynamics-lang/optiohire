'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusIndicator } from './status-indicator'
import { Calendar, Users, MapPin, ExternalLink, Link as LinkIcon, Check } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { JobPosting } from '@/types'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface JobPostingCardProps {
  jobPosting: JobPosting & {
    analytics?: {
      total_applicants: number
      total_shortlisted: number
      total_rejected: number
      processing_status: 'processing' | 'in_progress' | 'finished'
    }
  }
  onViewDetails: (jobId: string) => void
  delay?: number
}

export function JobPostingCard({ jobPosting, onViewDetails, delay = 0 }: JobPostingCardProps) {
  const analytics = jobPosting.analytics
  const { toast } = useToast()
  const [isCopying, setIsCopying] = useState(false)

  const copyApplicationLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsCopying(true)
    
    const baseUrl = window.location.origin
    const applicationUrl = `${baseUrl}/jobs/${jobPosting.id}`
    
    navigator.clipboard.writeText(applicationUrl).then(() => {
      toast({
        title: "Link Copied!",
        description: "Application link copied to clipboard.",
      })
      setTimeout(() => setIsCopying(false), 2000)
    }).catch(() => {
      setIsCopying(false)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="group transition-all duration-300 cursor-pointer"
            onClick={() => onViewDetails(jobPosting.id)}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl font-figtree font-semibold mb-2 group-hover:text-primary transition-colors">
                {jobPosting.job_title}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-figtree font-light line-clamp-2">
                {jobPosting.job_description}
              </p>
            </div>
            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <Badge 
                variant={
                  jobPosting.status?.toUpperCase() === 'ACTIVE' ? 'active' :
                  jobPosting.status?.toUpperCase() === 'DRAFT' ? 'draft' :
                  jobPosting.status?.toUpperCase() === 'CLOSED' ? 'closed' :
                  'default'
                }
                className="text-xs"
              >
                {jobPosting.status?.toUpperCase() || 'ACTIVE'}
              </Badge>
              {analytics && (
                <StatusIndicator status={analytics.processing_status} />
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Interview Date */}
            {jobPosting.interview_start_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Interview: {formatDateTime(jobPosting.interview_start_time)}</span>
              </div>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {jobPosting.required_skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {jobPosting.required_skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{jobPosting.required_skills.length - 3} more
                </Badge>
              )}
            </div>

            {/* Analytics */}
            {analytics && (
              <div className="grid grid-cols-3 gap-2 border-t pt-4 sm:gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#2D2DDD]  font-figtree">
                    {analytics.total_applicants}
                  </p>
                  <p className="text-[11px] text-gray-600 sm:text-xs dark:text-gray-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400 font-figtree">
                    {analytics.total_shortlisted}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Shortlisted</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600 dark:text-red-400 font-figtree">
                    {analytics.total_rejected}
                  </p>
                  <p className="text-[11px] text-gray-600 sm:text-xs dark:text-gray-400">Rejected</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>Created {formatDate(new Date(jobPosting.created_at))}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] touch-manipulation sm:min-h-9 text-xs"
                  onClick={copyApplicationLink}
                >
                  {isCopying ? <Check className="w-3 h-3 mr-1" /> : <LinkIcon className="w-3 h-3 mr-1" />}
                  {isCopying ? 'Copied' : 'Link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] touch-manipulation text-primary hover:text-primary/80 sm:min-h-9"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails(jobPosting.id)
                  }}
                >
                  View Details
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
