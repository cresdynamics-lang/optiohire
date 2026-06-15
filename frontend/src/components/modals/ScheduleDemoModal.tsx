'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ScheduleDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!date || !time) {
      setError('Please select both date and time')
      return
    }

    // Combine date and time
    const dateTimeStr = `${date}T${time}:00`
    const demoDate = new Date(dateTimeStr)
    
    if (demoDate < new Date()) {
      setError('Please select a future date and time')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.optiohire.com'
      
      const response = await fetch(`${backendUrl}/api/demos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          demo_time: demoDate.toISOString()
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to schedule demo')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setDate('')
    setTime('')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Demo</DialogTitle>
          <DialogDescription>
            Pick a time that works for you, and we'll send a calendar invite.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Demo Scheduled!</h3>
              <p className="text-sm text-slate-500 mt-1">
                We've sent an alert to our team. You'll receive a confirmation email shortly.
              </p>
            </div>
            <Button onClick={handleClose} className="bg-[#2D2DDD] hover:bg-[#2D2DDD] text-white">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="relative">
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !date || !time}
                className="bg-[#2D2DDD] hover:bg-[#2D2DDD]/90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Demo'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
