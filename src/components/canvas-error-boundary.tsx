import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
}

/**
 * Catches errors thrown inside a Three.js / R3F Canvas so that a failed
 * texture load or WebGL context loss does not crash the entire page.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Log but don't re-throw — the boundary already recovered
    console.warn('[CanvasErrorBoundary] canvas error caught:', error, info)
  }

  override render() {
    if (this.state.hasError) {
      // Render fallback (default: silent empty div matching canvas positioning)
      return this.props.fallback ?? <div className="absolute inset-0" aria-hidden />
    }
    return this.props.children
  }
}
