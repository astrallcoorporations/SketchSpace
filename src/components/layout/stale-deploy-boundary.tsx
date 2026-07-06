import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/** SessionStorage key tracking whether we already auto-reloaded once. */
const RETRIED_KEY = 'sketchspace:stale-deploy-retried'

function isDynamicImportError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message ?? ''
    return (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module')
    )
  }
  return false
}

interface State {
  phase: 'idle' | 'reloading' | 'fatal'
}

interface Props {
  children: ReactNode
}

/**
 * Catches the TypeError thrown when Vite's route-level code-splitting
 * references a chunk that no longer exists on the CDN (i.e. a new deploy
 * shipped while the user had the app open).
 *
 * Behaviour:
 *  1. First occurrence — shows "Loading latest version…" and reloads once.
 *  2. If the reload also fails (e.g. the new bundle itself is broken) —
 *     shows a manual "Refresh" button so we never loop-reload infinitely.
 */
export class StaleDeployBoundary extends Component<Props, State> {
  state: State = { phase: 'idle' }

  static getDerivedStateFromError(error: unknown): State | null {
    if (isDynamicImportError(error)) {
      // Only auto-retry once per session.
      if (sessionStorage.getItem(RETRIED_KEY)) {
        return { phase: 'fatal' }
      }
      sessionStorage.setItem(RETRIED_KEY, '1')
      return { phase: 'reloading' }
    }
    // Not a dynamic-import error — let it propagate.
    return null
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    // Only log dynamic import failures at warn level — they're expected
    // across deploys and not actionable as application bugs.
    if (isDynamicImportError(error)) {
      console.warn('[stale-deploy] Dynamic import failed, reloading:', error.message)
    } else {
      console.error('[stale-deploy] Unexpected error:', error, info)
    }
  }

  override componentDidMount() {
    // If we entered the 'reloading' phase from getDerivedStateFromError,
    // perform the actual reload here (can't do side-effects in derived state).
    if (this.state.phase === 'reloading') {
      window.location.reload()
    }
  }

  override componentDidUpdate() {
    if (this.state.phase === 'reloading') {
      window.location.reload()
    }
  }

  handleRefresh = () => {
    sessionStorage.removeItem(RETRIED_KEY)
    window.location.reload()
  }

  render() {
    if (this.state.phase === 'fatal') {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-brand" />
          <h1 className="text-lg font-medium text-foreground">
            Something went wrong
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            A new version of SketchSpace was deployed but failed to load.
            Click below to refresh the page.
          </p>
          <Button variant="brand" size="sm" onClick={this.handleRefresh}>
            Refresh page
          </Button>
        </div>
      )
    }

    if (this.state.phase === 'reloading') {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-brand" />
          <p className="text-sm text-muted-foreground">
            Loading the latest version…
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
