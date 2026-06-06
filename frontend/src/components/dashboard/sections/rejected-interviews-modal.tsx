import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { XCircle, User, AlertCircle } from 'lucide-react'

interface RejectedCandidate {
  application_id: string
  candidate_name: string
  job_title: string
  reasoning: string
}

interface RejectedInterviewsModalProps {
  isOpen: boolean
  onClose: () => void
  rejectedCandidates: RejectedCandidate[]
}

export function RejectedInterviewsModal({
  isOpen,
  onClose,
  rejectedCandidates,
}: RejectedInterviewsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Rejected Applications
          </DialogTitle>
          <DialogDescription>
            Candidates who were rejected and the reasoning provided.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {rejectedCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
              <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
              <p>No rejected candidates found.</p>
            </div>
          ) : (
            rejectedCandidates.map((candidate) => (
              <div
                key={candidate.application_id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4  "
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      {candidate.candidate_name || 'Unknown Candidate'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Applied for: <span className="font-medium text-slate-700 dark:text-slate-300">{candidate.job_title}</span>
                    </p>
                  </div>
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-0">
                    Rejected by AI
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-3 rounded border border-slate-100 ">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reasoning:</span>
                  {candidate.reasoning || 'No specific reason provided.'}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
