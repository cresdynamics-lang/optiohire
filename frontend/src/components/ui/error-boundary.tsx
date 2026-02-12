'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReload?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
              <h1 className="text-2xl font-semibold text-white mb-4">Something went wrong</h1>
              <p className="text-gray-400 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <ErrorBoundaryButton 
                onReset={() => {
                  this.setState({ hasError: false, error: null })
                }}
                onReload={this.props.onReload}
              />
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// Functional component wrapper for reload button - no automatic refresh
function ErrorBoundaryButton({ onReset, onReload }: { onReset: () => void; onReload?: () => void }) {
  const handleReload = () => {
    onReset()
    if (onReload) {
      onReload()
    }
    // Removed router.refresh() to prevent automatic page refreshes
  }
  
  return (
    <button
      onClick={handleReload}
      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
    >
      Try Again
    </button>
  )
}

