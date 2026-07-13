import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean; error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AppErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
              </div>
              <p className="mb-4 text-muted-foreground">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"
              >
                <RefreshCw className="h-4 w-4" /> Reload
              </button>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
