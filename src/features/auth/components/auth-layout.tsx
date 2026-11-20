import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '@/components/motion/reveal'

type AuthLayoutProps = {
  children: ReactNode
  /** Kept for existing callers; no longer rendered. */
  eyebrow?: string
  title: string
  visualCopy: string
}

export function AuthLayout({ children, title, visualCopy }: AuthLayoutProps) {
  return (
    <div className="theme-classic grid min-h-svh grid-rows-[auto_1fr] lg:grid-rows-none lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-foreground px-6 py-5 text-background sm:px-10 sm:py-6 lg:min-h-svh lg:p-10">
        {/* Pure CSS backdrop: the WebGL hero is ~530 kB of JS and made sign-in wait on it. */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="bg-noise absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-transparent to-transparent" />
          <div className="absolute -right-24 bottom-0 h-3/4 w-3/4 rounded-full bg-gradient-to-tr from-pink-500/25 via-fuchsia-600/20 to-transparent blur-3xl" />
        </div>
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
