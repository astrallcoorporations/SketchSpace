import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/reveal'
import { CanvasErrorBoundary } from '@/components/canvas-error-boundary'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeroScene = lazy(() =>
  import('@/features/landing/hero/hero-scene').then((m) => ({ default: m.HeroScene })),
)

type AuthLayoutProps = {
  children: ReactNode
  /** Kept for existing callers; no longer rendered. */
  eyebrow?: string
  title: string
  visualCopy: string
}

/** Mount the WebGL scene only after the form has painted, so sign-in is never waiting on three.js. */
function useAfterPaint(enabled: boolean) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!enabled) return
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
      cancelIdleCallback?: (n: number) => void
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 1500 })
      return () => w.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setReady(true), 600)
    return () => window.clearTimeout(id)
  }, [enabled])
  return ready
}

export function AuthLayout({ children, title, visualCopy }: AuthLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const morphProgress = useRef(0.3)
  const sceneReady = useAfterPaint(isDesktop)

  return (
    <div className="theme-classic grid min-h-svh grid-rows-[auto_1fr] lg:grid-rows-none lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-foreground px-6 py-5 text-background sm:px-10 sm:py-6 lg:min-h-svh lg:p-10">
        {/* CSS backdrop paints first; the animated ink scene fades in over it on desktop. */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="bg-noise absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-transparent to-transparent" />
        </div>
        {sceneReady && (
          <div className="absolute inset-0 animate-in fade-in duration-700" aria-hidden="true">
            <CanvasErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <HeroScene morphProgress={morphProgress} />
              </Suspense>
            </CanvasErrorBoundary>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground via-foreground/10 to-foreground/60" />

        <Link to="/" className="relative font-display text-lg font-medium transition-opacity duration-200 hover:opacity-80">
          SketchSpace
        </Link>

        <div className="relative hidden max-w-md lg:block">
          <p className="font-display text-3xl leading-[1.1] font-medium italic text-balance sm:text-4xl">
            {visualCopy}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-16">
        <Reveal className="w-full max-w-sm" direction="none">
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
          <div className="mt-6 page-enter sm:mt-10">{children}</div>
        </Reveal>
      </div>
    </div>
  )
}
