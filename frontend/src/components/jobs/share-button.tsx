'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ShareButtonProps {
  jobTitle: string
}

export function ShareButton({ jobTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    const url = window.location.href
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: jobTitle,
          url: url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "Job link copied to clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      // Ignore abort errors
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share Job
        </>
      )}
    </Button>
  )
}
