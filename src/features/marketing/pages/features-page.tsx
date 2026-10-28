import { Clock } from 'lucide-react'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import type { InkName } from '@/components/swatch/marker-ink'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'
import { featureDetails } from '@/features/marketing/content'

const inks: InkName[] = ['pink', 'magenta', 'violet']

/** One piece, six saved versions, on the unbroken version line. Example data. */
function VersionStrip() {
  return (
    <figure className="sheet p-4 sm:p-5" aria-label="Example: one piece across six saved versions">
      <div className="grid grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="aspect-[3/4] overflow-hidden border-[1.5px] border-paper-ink">
            <MarkerSwatch ink="magenta" passes={n} seed={n + 90} animate />
          </div>
        ))}
      </div>
      <div className="relative mt-4 h-4" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-paper-ink" />
        <div className="absolute inset-0 grid grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className="flex items-center justify-center">
              <span className={n === 6 ? 'size-4 rounded-full border-2 border-paper bg-ink-pink' : 'size-2.5 rounded-full bg-paper-ink'} />
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 flex justify-between font-code text-[0.65rem] text-paper-ink/75">
        <span>v1 · first upload</span>
        <span>Example · one piece</span>
        <span>v6 · now</span>
      </figcaption>
    </figure>
  )
}

export function FeaturesPage() {
  return (
    <MarketingLayout>
      <Seo
        title="Features"
        description="Growth tracking, portfolio, learning paths, and collaboration — everything artists need to improve, in one place."
        canonical="/features"
      />
      <section className="px-4 pt-16 pb-20 sm:px-8 sm:pt-24">
        <div className="mx-auto grid max-w-[88rem] items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <h1 className="font-display text-[clamp(3rem,6.4vw,5.6rem)] leading-[0.86] uppercase">
              One system for actually getting better, not five tabs pretending to be one.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Every feature below is either live in the product today or in active development, marked clearly. No
              vaporware.
            </p>
          </div>
          <VersionStrip />
        </div>
      </section>

      <section className="px-4 pb-28 sm:px-8">
        <ol className="mx-auto max-w-[88rem] border-t-2 border-border">
          {featureDetails.map((feature, i) => {
            const ink = inks[i % inks.length]
            return (
              <li
                key={feature.title}
                className="grid gap-10 border-b-2 border-border py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <feature.icon className="size-6 text-ink-violet-light" strokeWidth={1.75} aria-hidden="true" />
                    {feature.status === 'in-progress' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-input px-3 py-0.5 text-xs font-medium text-muted-foreground">
                        <Clock className="size-3.5" aria-hidden="true" /> In development
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-4xl leading-[0.9] uppercase sm:text-5xl">{feature.title}</h2>
                  <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* the feature's parts as a swatch legend: one more pass per line */}
                <ul className="sheet self-start p-4 sm:p-6">
                  {feature.points.map((point, k) => (
                    <li
                      key={point}
                      className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-4 border-b-[1.5px] border-paper-rule py-3 last:border-b-0"
                    >
                      <div className="h-8 overflow-hidden border-[1.5px] border-paper-ink">
                        <MarkerSwatch ink={ink} passes={k + 1} seed={i * 17 + k} animate />
                      </div>
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </section>

    </MarketingLayout>
  )
}
