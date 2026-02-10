'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, FileText, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface Report {
  id: string
  reportUrl: string
  createdAt: string
  metadata?: {
    totalApplicants?: number
    shortlisted?: number
    flagged?: number
    rejected?: number
    averageScore?: number
  }
}

interface ReportViewerProps {
  jobId: string
  jobTitle?: string
}

export function ReportViewer({ jobId, jobTitle }: ReportViewerProps) {
  const { user } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (user && jobId) {
      fetchReport()
    }
  }, [user, jobId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/hr/reports/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        setReport(null)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch report')
      }

      const data = await response.json()
      setReport(data.report)
    } catch (err: any) {
      if (err.message !== 'Failed to fetch report' || err.message !== 'Not authenticated') {
        setError(err.message || 'Failed to load report')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      setGenerating(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/hr/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobPostingId: jobId }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to generate report' }))
        throw new Error(error.error || 'Failed to generate report')
      }

      const data = await response.json()
      if (data.report) {
        setReport(data.report)
      } else {
        // Refetch after a short delay
        setTimeout(() => {
          fetchReport()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !report) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchReport}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hiring Report</CardTitle>
          <CardDescription>
            {jobTitle ? `Report for ${jobTitle}` : 'Generate a comprehensive hiring report for this job'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              No report has been generated yet for this job posting.
            </p>
            <Button onClick={generateReport} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const createdDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Hiring Report</CardTitle>
            <CardDescription>
              {jobTitle ? `Report for ${jobTitle}` : 'Final hiring report'}
            </CardDescription>
          </div>
          <Badge variant="success">Generated</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Generated on {createdDate}</span>
        </div>

        {report.metadata && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            {report.metadata.totalApplicants !== undefined && (
              <div>
                <div className="text-2xl font-bold text-primary">
                  {report.metadata.totalApplicants}
                </div>
                <div className="text-xs text-gray-500">Total Applicants</div>
              </div>
            )}
            {report.metadata.shortlisted !== undefined && (
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {report.metadata.shortlisted}
                </div>
                <div className="text-xs text-gray-500">Shortlisted</div>
              </div>
            )}
            {report.metadata.flagged !== undefined && (
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {report.metadata.flagged}
                </div>
                <div className="text-xs text-gray-500">Flagged</div>
              </div>
            )}
            {report.metadata.averageScore !== undefined && (
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {report.metadata.averageScore.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Avg Score</div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => window.open(report.reportUrl, '_blank')}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Regenerate'
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}

