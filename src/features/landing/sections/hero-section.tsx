import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CanvasErrorBoundary } from '@/components/canvas-error-boundary'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-media-query'
import type { InkPalette } from '@/features/landing/hero/ink-shader-material'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import { MarkerScribble } from '@/components/swatch/marker-scribble'
import type { InkName } from '@/components/swatch/marker-ink'
import { growthStats } from '@/features/landing/content'

const HeroScene = lazy(() =>
  import('@/features/landing/hero/hero-scene').then((m) => ({ default: m.HeroScene })),
)

// The original ink-flow hero, re-inked for the violet ground: the paper is the deepest pass.
const VIOLET_GROUND: InkPalette = { paper: '#1a1022', brand: '#8b5cf6', brand2: '#ec4899', ink: '#f4ecfa' }

// An example year: the same eight swatches, refilled each quarter with more passes.
const months = ['Jan', 'Apr', 'Jul', 'Oct'] as const
const columns: { ink: InkName; code: string; growth: number[] }[] = [
  { ink: 'pink', code: 'P', growth: [1, 2, 2, 4] },
  { ink: 'pink', code: 'P', growth: [1, 1, 3, 4] },
  { ink: 'magenta', code: 'M', growth: [1, 2, 3, 5] },
  { ink: 'magenta', code: 'M', growth: [1, 1, 3, 5] },
  { ink: 'violet', code: 'V', growth: [1, 2, 2, 4] },
  { ink: 'violet', code: 'V', growth: [1, 1, 3, 5] },
  { ink: 'pink', code: 'P', growth: [1, 2, 3, 5] },
  { ink: 'violet', code: 'V', growth: [1, 2, 3, 4] },
]

function GrowthChart() {
  return (
    <figure className="sheet relative p-4 sm:p-6" aria-labelledby="growth-chart-title">
      <figcaption id="growth-chart-title" className="flex flex-col gap-1 border-b-2 border-paper-ink pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="font-display text-xl uppercase sm:text-2xl">Growth chart</span>
        <span className="font-code text-[0.7rem] text-paper-ink/70">Example · one artist, one year</span>
      </figcaption>

      <div className="relative mt-4">
        <table className="w-full border-separate border-spacing-x-1.5 border-spacing-y-0 sm:border-spacing-x-2">
          <caption className="sr-only">
            Example of one artist's year: the same eight swatches deepen from January to October as more passes go down.
          </caption>
          <tbody>
            {months.map((month, row) => (
              <tr key={month}>
                <th scope="row" className="w-10 pr-1 text-left align-middle font-code text-[0.7rem] font-semibold uppercase sm:w-12">
                  {month}
                </th>
                {columns.map((col, i) => {
                  const passes = col.growth[row]
                  const code = `${col.code}-${String(i + 1).padStart(2, '0')}`
                  return (
                    <td key={`${month}-${code}`} className="pb-2 align-top sm:pb-6">
                      <div className="h-11 overflow-hidden border-[1.5px] border-paper-ink sm:h-14">
                        <MarkerSwatch ink={col.ink} passes={passes} seed={row * 31 + i + 3} animate />
                      </div>
                      <span className="mt-1 block font-code text-[0.6rem] leading-none text-paper-ink/75">
                        <span className="sr-only sm:not-sr-only">{code}</span>
                        <span className="sr-only">, {passes} {passes === 1 ? 'pass' : 'passes'}</span>
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <MarkerScribble className="z-10" />
      </div>

      <dl className="grid grid-cols-3 gap-3 border-t-2 border-paper-ink pt-3">
        {growthStats.map((s) => (
          <div key={s.label}>
            <dt className="text-[0.75rem] leading-tight text-paper-ink/80">{s.label}</dt>
            <dd className="font-display text-3xl leading-none sm:text-4xl">
              {s.value}
              {s.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const morphProgress = useRef(0)
  const reduceMotion = usePrefersReducedMotion()

  // Scrolling through the hero morphs the particle field, as the original did.
  useEffect(() => {
    if (reduceMotion || !sectionRef.current) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=120%',
        scrub: 0.4,
        onUpdate: (self) => {
          morphProgress.current = self.progress
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden px-4 pt-28 pb-20 sm:px-8 sm:pt-32 lg:pb-28">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <CanvasErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <HeroScene morphProgress={morphProgress} palette={VIOLET_GROUND} />
          </Suspense>
        </CanvasErrorBoundary>
        {/* legibility scrim behind the copy column; the ink stays loud on the chart side */}
        <div className="absolute inset-0 bg-background/50 lg:bg-transparent lg:bg-gradient-to-r lg:from-background/90 lg:via-background/45 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="mx-auto grid max-w-[88rem] items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div>
          <h1 className="font-display text-[clamp(3.2rem,7.4vw,6rem)] leading-[0.86] uppercase">
            The home where artists improve together.
          </h1>
          <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-foreground/85">
            Every piece keeps its full history, so you can watch your own hand improve month over month — with
            critique that points at the exact stroke, and people to make work with.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link to="/signup">Create free account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-background/60">
              <Link to="/features">See how it works</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-foreground/75">Free. No algorithmic feed. Export everything, any time.</p>
        </div>
        <GrowthChart />
      </div>
    </section>
  )
}
