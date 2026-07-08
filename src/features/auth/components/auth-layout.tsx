import { lazy, Suspense, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/reveal'
import { useMediaQuery } from '@/hooks/use-media-query'

const HeroScene = lazy(() =>
  import('@/features/landing/hero/hero-scene').then((m) => ({ default: m.HeroScene })),
)

type AuthLayoutProps = {
  children: ReactNode
  eyebrow: string
  title: string
  visualCopy: string
}

export function AuthLayout({ children, eyebrow, title, visualCopy }: AuthLayoutProps) {
  const isCompact = useMediaQuery('(max-width: 1024px)')
  const morphProgress = useRef(0.3)

  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:min-h-svh">
        {isCompact ? (
          <div className="absolute inset-0">
            <div className="bg-noise absolute inset-0" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-transparent to-transparent" />
          </div>
        ) : (
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-background/10 via-brand/20 to-background/10" />}>
            <HeroScene morphProgress={morphProgress} />
          </Suspense>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground via-foreground/10 to-foreground/60" />

        <Link to="/" className="relative font-display text-lg font-medium transition-opacity duration-200 hover:opacity-80">
          SketchSpace
        </Link>

        <div className="relative max-w-md">
          <p className="font-display text-2xl leading-snug font-medium text-balance sm:text-3xl">
            {visualCopy}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <Reveal className="w-full max-w-sm" direction="none">
          <p className="text-sm font-medium tracking-wide text-brand uppercase">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-medium">{title}</h1>
          <div className="mt-8 page-enter">{children}</div>
        </Reveal>
      </div>
    </div>
  )
}
