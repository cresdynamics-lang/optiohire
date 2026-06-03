'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { useAuth } from '@/hooks/use-auth'
import type { Candidate } from '@/components/CandidateRow'
import { cleanCandidateName } from '@/lib/utils'

interface ExistingInterview {
  applicationId: string
  interviewTime: string
  interviewLink: string
  interviewType: 'online' | 'in-person'
  reminders?: string[]
}

interface ScheduleInterviewModalProps {
  isOpen: boolean
  candidate: Candidate | null
  meetingLink: string
  onClose: () => void
  onSuccess: () => void
  existingInterview?: ExistingInterview | null
}

export function ScheduleInterviewModal({
  isOpen,
  candidate,
  meetingLink,
  onClose,
  onSuccess,
  existingInterview,
}: ScheduleInterviewModalProps) {
  const isEditMode = !!existingInterview
  const [interviewTime, setInterviewTime] = useState<string>('')
  const [interviewType, setInterviewType] = useState<'online' | 'in-person'>('online')
  const [location, setLocation] = useState('')
  const [customLink, setCustomLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [reminders, setReminders] = useState<string[]>(['24h', '1h'])
  const { user } = useAuth()

  // Pre-fill form when editing an existing interview
  useEffect(() => {
    if (isOpen && existingInterview) {
      const dt = new Date(existingInterview.interviewTime)
      setInterviewTime(dt.toISOString().slice(0, 16))
      setInterviewType(existingInterview.interviewType || 'online')
      setCustomLink(existingInterview.interviewLink || '')
      setReminders(existingInterview.reminders || ['24h', '1h'])
    } else if (isOpen && !existingInterview) {
      setInterviewTime('')
      setInterviewType('online')
      setCustomLink('')
      setLocation('')
      setReminders(['24h', '1h'])
    }
  }, [isOpen, existingInterview])

  useEffect(() => {
    if (interviewType === 'in-person' && user?.companyLocation && !location) {
      setLocation(user.companyLocation)
    }
  }, [interviewType, user?.companyLocation, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidate || !interviewTime) return

    if (interviewType === 'in-person' && !location.trim()) {
      setError('Please enter a location for the in-person interview.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Convert to ISO string with timezone
      const date = new Date(interviewTime)
      const isoString = date.toISOString()

      // Use PUT for editing, POST for new scheduling
      const endpoint = isEditMode ? '/api/update-interview' : '/api/schedule-interview'
      const method = isEditMode ? 'PUT' : 'POST'
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicantId: candidate.id,
          interviewTime: isoString,
          interviewType,
          location: interviewType === 'in-person' ? location : undefined,
          customLink: interviewType === 'online' && customLink ? customLink : undefined,
          reminders,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to schedule interview'
        let errorDetails = ''
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          errorDetails = data.details || data.message || ''
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error (${response.status})`
        }
        // Combine error message and details for better UX
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
        throw new Error(fullError)
      }

      const data = await response.json()

      // Show success message
      setShowSuccess(true)
      
      // Wait a moment before closing and calling onSuccess
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
        onClose()
        setInterviewTime('')
        setInterviewType('online')
        setLocation('')
        setCustomLink('')
      }, 2000)
    } catch (err: any) {
      console.error('Schedule interview error:', err)
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to server. Please check your connection and ensure the backend is running.')
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to schedule interview. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const minDateTime = new Date().toISOString().slice(0, 16)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '✏️ Edit Interview' : 'Schedule Interview'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the interview details for ${candidate ? cleanCandidateName(candidate.candidate_name) : 'candidate'}`
              : `Schedule an interview for ${candidate ? cleanCandidateName(candidate.candidate_name) : 'candidate'}`}
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="space-y-4 py-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Interview Scheduled Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interviewType === 'in-person'
                  ? `An in-person interview has been scheduled. The candidate will receive the location via email.`
                  : `The interview has been scheduled for ${candidate ? cleanCandidateName(candidate.candidate_name) : 'candidate'}`}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interview-time">Interview Date & Time</Label>
                <DateTimePicker
                  value={interviewTime}
                  onChange={setInterviewTime}
                  minDateTime={minDateTime}
                  placeholder="Select date and time"
                />
              </div>

              {/* Interview Type Toggle */}
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={interviewType === 'online' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInterviewType('online')}
                    className={interviewType === 'online'
                      ? 'bg-[#2D2DDD] hover:bg-[#2525BB] text-white flex-1'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 flex-1'}
                  >
                    🎥 Online
                  </Button>
                  <Button
                    type="button"
                    variant={interviewType === 'in-person' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInterviewType('in-person')}
                    className={interviewType === 'in-person'
                      ? 'bg-[#2D2DDD] hover:bg-[#2525BB] text-white flex-1'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 flex-1'}
                  >
                    📍 In-Person
                  </Button>
                </div>
              </div>

              {/* Online: Meeting Link */}
              {interviewType === 'online' && (
                <div className="space-y-2">
                  <Label htmlFor="meeting-link">Meeting Link</Label>
                  <Input
                    id="meeting-link"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder={meetingLink || 'Enter custom Zoom/Teams/Meet link'}
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">
                    {meetingLink
                      ? 'Leave blank to use the default job posting meeting link, or enter a custom one.'
                      : 'Enter a meeting link (Zoom, Teams, Google Meet, etc.)'}
                  </p>
                </div>
              )}

              {/* In-Person: Location */}
              {interviewType === 'in-person' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location / Address</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Westlands, Nairobi, Building X, Floor 3"
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-gray-500">
                    The candidate will receive a Google Maps link to this address in their email.
                  </p>
                </div>
              )}

              {/* Reminders */}
              <div className="space-y-2">
                <Label>Interview Reminders</Label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: '24h', label: '24 hours before' },
                    { value: '1h', label: '1 hour before' },
                    { value: '15m', label: '15 minutes before' },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminders.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReminders([...reminders, option.value])
                          } else {
                            setReminders(reminders.filter(r => r !== option.value))
                          }
                        }}
                        className="rounded border-gray-300 text-[#2D2DDD] focus:ring-[#2D2DDD]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  We will send email reminders to both you and the candidate.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="bg-white text-[#2D2DDD] border-[#2D2DDD] hover:bg-[#2D2DDD] hover:text-white shadow-none hover:shadow-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !interviewTime}
                className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white shadow-none hover:shadow-none"
              >
                {isLoading
                  ? (isEditMode ? 'Updating...' : 'Scheduling...')
                  : (isEditMode ? 'Update Interview' : 'Schedule Interview')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
