import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4">
            <p className="text-sm font-medium text-destructive">Something went wrong</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Reload page
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
