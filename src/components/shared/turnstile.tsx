import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
    onTurnstileReady?: () => void
  }
}

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile script'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

type TurnstileProps = {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  theme?: 'light' | 'dark' | 'auto'
  className?: string
}

export function Turnstile({ siteKey, onVerify, onExpire, onError, theme = 'auto', className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const handleVerify = useCallback(
    (token: string) => {
      setError(false)
      onVerify(token)
    },
    [onVerify],
  )

  const handleExpire = useCallback(() => {
    onExpire?.()
  }, [onExpire])

  const handleError = useCallback(() => {
    setError(true)
    onError?.()
  }, [onError])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        await loadTurnstileScript()

        if (cancelled || !containerRef.current || !window.turnstile) return

        // Clear any existing widget
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current)
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: handleVerify,
          'expired-callback': handleExpire,
          'error-callback': handleError,
        })

        setLoading(false)
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [siteKey, theme, handleVerify, handleExpire, handleError])

  return (
    <div className={className}>
      <div ref={containerRef} className={error ? 'rounded-lg border border-destructive/50' : ''} />
      {loading && (
        <div className="flex h-[65px] items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
          Loading verification…
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-destructive">
          Verification failed — please refresh and try again.
        </p>
      )}
    </div>
  )
}
