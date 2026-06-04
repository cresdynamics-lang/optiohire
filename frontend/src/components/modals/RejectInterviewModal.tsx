import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2 } from 'lucide-react'

interface RejectInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: string
  companyName: string
  jobTitle: string
  onSuccess: () => void
}

export function RejectInterviewModal({ isOpen, onClose, interviewId, companyName, jobTitle, onSuccess }: RejectInterviewModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancelling the interview.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/candidate/interviews/${interviewId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reject interview')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Cancel Interview
          </DialogTitle>
          <DialogDescription>
            You are about to cancel your interview for <strong>{jobTitle}</strong> at <strong>{companyName}</strong>. 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for cancellation (Required)</Label>
            <Textarea
              id="reason"
              placeholder="Please let the employer know why you are cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Keep Interview
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Cancel Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
