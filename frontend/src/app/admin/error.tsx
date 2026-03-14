'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <CardTitle className="text-2xl">Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An error occurred in the admin section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-1">
              Error Details:
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 font-mono">
              {error.message || 'Unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/admin" className="flex-1">
              <Button
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Admin Home
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              If this error persists, please contact support or check the browser console for more details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
