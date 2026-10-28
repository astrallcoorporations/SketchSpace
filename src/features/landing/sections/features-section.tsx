import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import type { InkName } from '@/components/swatch/marker-ink'
import { features } from '@/features/landing/content'

const inks: InkName[] = ['pink', 'pink', 'magenta', 'magenta', 'violet', 'violet']

/**
 * The feature list as a swatch legend: each row is one more pass than the
 * row above, so the list itself deepens as you read down it.
 */
export function FeaturesSection() {
  return (
    <section aria-labelledby="features-title" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="features-title" className="font-display text-5xl leading-[0.9] uppercase sm:text-6xl">
            Six tools, one place.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            The portfolio site, the critique Discord, the project spreadsheet and the challenge server, finally
            connected to the same pieces of work.
          </p>
        </div>

        <ol className="border-t-2 border-border">
          {features.map(({ title, description, icon: Icon }, i) => (
            <li
              key={title}
              className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-5 border-b-2 border-border py-7 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-8"
            >
              <div className="overflow-hidden rounded-[3px] border-[1.5px] border-paper-rule">
                <div className="h-12 sm:h-16">
                  <MarkerSwatch ink={inks[i]} passes={i + 1} seed={i * 13 + 5} animate />
                </div>
              </div>
              <div>
                <h3 className="flex items-center gap-2.5 text-xl font-semibold sm:text-2xl">
                  <Icon className="size-5 text-ink-violet-light" strokeWidth={1.75} aria-hidden="true" />
                  {title}
                </h3>
                <p className="mt-2 max-w-[60ch] leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
