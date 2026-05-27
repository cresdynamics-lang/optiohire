'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Sparkles, Video, MapPin, ExternalLink, Loader2 } from 'lucide-react'

interface Interview {
  id: string
  jobTitle: string
  companyName: string
  interviewTime: string
  interviewLink: string | null
  interviewType: 'online' | 'in-person'
  location: string | null
  status: string
}

export function JobSeekerInterviewsSection() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const res = await fetch('/api/candidate/interviews', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch interviews')
        }

        const data = await res.json()
        setInterviews(data.interviews || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load interviews')
      } finally {
        setLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isUpcoming = (isoString: string) => new Date(isoString) > new Date()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/70 to-transparent" aria-hidden />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            Candidate Interviews
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your interviews</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Track your scheduled interviews and prepare for each discussion with hiring teams.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading your interviews...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-red-500">{error}</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-16">
          <CalendarClock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No interviews scheduled yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            When a company shortlists you and schedules an interview, it will appear here with all the details you need.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card
              key={interview.id}
              className={`border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                !isUpcoming(interview.interviewTime) ? 'opacity-60' : ''
              }`}
            >
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                      {interview.interviewType === 'in-person' ? (
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Video className="h-4 w-4 text-blue-600" />
                      )}
                      {interview.jobTitle}
                    </CardTitle>
                    <CardDescription className="text-slate-600">{interview.companyName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        interview.interviewType === 'in-person'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }
                    >
                      {interview.interviewType === 'in-person' ? '📍 In-Person' : '🎥 Online'}
                    </Badge>
                    {!isUpcoming(interview.interviewTime) && (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                        Past
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="inline-flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {formatDate(interview.interviewTime)} at {formatTime(interview.interviewTime)}
                </p>

                {/* Online: Join Meeting button */}
                {interview.interviewType === 'online' && interview.interviewLink && (
                  <a
                    href={interview.interviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2D2DDD] px-4 py-2 text-sm font-medium text-white hover:bg-[#2525BB] transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* In-Person: Location + Google Maps */}
                {interview.interviewType === 'in-person' && interview.location && (
                  <div className="space-y-2">
                    <p className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      {interview.location}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
