import { Flame, Palette, Users2 } from 'lucide-react'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import type { InkName } from '@/components/swatch/marker-ink'

const quests: { icon: typeof Flame; title: string; reward: string; progress: number; ink: InkName }[] = [
  { icon: Flame, title: '30-day sketch streak', reward: '450 XP', progress: 0.72, ink: 'pink' },
  { icon: Palette, title: 'Master one new medium', reward: '800 XP', progress: 0.4, ink: 'magenta' },
  { icon: Users2, title: 'Ship a collaborative project', reward: '1200 XP', progress: 0.15, ink: 'violet' },
]

/** Quest progress is a swatch bar: the marker has filled as far as you have got. */
export function CommunitySection() {
  return (
    <section id="community" aria-labelledby="quests-title" className="bg-pass-v6 px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <h2 id="quests-title" className="font-display text-5xl leading-[0.9] uppercase sm:text-6xl">
            A reason to show up tomorrow.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Quests reward practice, not going viral: streaks, new mediums, shipped projects. Example progress shown.
          </p>
        </div>
        <ul className="space-y-4">
          {quests.map(({ icon: Icon, title, reward, progress, ink }) => (
            <li key={title} className="rounded-md border-2 border-border bg-pass-v4 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold">
                  <Icon className="size-5 text-ink-violet-light" strokeWidth={1.75} aria-hidden="true" />
                  {title}
                </h3>
                <span className="font-code text-sm text-muted-foreground">
                  {Math.round(progress * 100)}% · {reward}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${title} progress`}
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-4 h-9 overflow-hidden rounded-[3px] bg-paper"
              >
                <div className="h-full" style={{ width: `${progress * 100}%` }}>
                  <MarkerSwatch ink={ink} passes={3} seed={title.length} animate />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
