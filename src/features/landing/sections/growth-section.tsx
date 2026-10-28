import { useId, useState } from 'react'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'

// Example piece: fourteen saved versions across fourteen months.
const versions = [
  { month: 'Jan', note: 'First block-in' },
  { month: 'Feb', note: 'Value pass' },
  { month: 'Mar', note: 'Redrew the hands' },
  { month: 'Apr', note: 'Second colour pass' },
  { month: 'May', note: 'Critique: edges too soft' },
  { month: 'Jun', note: 'Sharpened edges' },
  { month: 'Jul', note: 'New background' },
  { month: 'Aug', note: 'Lighting rework' },
  { month: 'Sep', note: 'Critique: muddy shadows' },
  { month: 'Oct', note: 'Cleaner shadows' },
  { month: 'Nov', note: 'Detail pass' },
  { month: 'Dec', note: 'Colour grade' },
  { month: 'Jan', note: 'Final tweaks' },
  { month: 'Feb', note: 'Now' },
] as const

const MAX_PASSES = 6

export function GrowthSection() {
  const [index, setIndex] = useState(versions.length - 1)
  const id = useId()
  const passes = 1 + Math.round((index / (versions.length - 1)) * (MAX_PASSES - 1))
  const v = versions[index]

  return (
    <section aria-labelledby={`${id}-title`} className="bg-pass-v6 px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id={`${id}-title`} className="max-w-3xl font-display text-5xl leading-[0.9] uppercase sm:text-7xl">
            See yourself getting better. Literally.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Every upload is a new version of the same piece, never a new post. Drag back through a year and watch the
            same work deepen.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
          <div className="sheet p-4">
            <div className="aspect-[4/3] overflow-hidden border-[1.5px] border-paper-ink">
              <MarkerSwatch key={passes} ink="magenta" passes={passes} seed={42} />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <span className="font-display text-2xl uppercase">v{index + 1}</span>
              <span className="text-right text-sm text-paper-ink/80">
                {v.note} · <span className="font-code text-xs">{v.month}</span>
              </span>
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-range`} className="text-sm font-medium">
              Version history <span className="text-muted-foreground">(example piece, 14 versions)</span>
            </label>
            {/* One unbroken line that scales with the page and never wraps; the dot at the end is now. */}
            <div className="relative mt-5 h-16">
              <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-pass-v1" />
              <div
                className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-ink-magenta-light"
                style={{ width: `${(index / (versions.length - 1)) * 100}%` }}
              />
              <ol className="absolute inset-0 flex items-center justify-between" aria-hidden="true">
                {versions.map((_, i) => (
                  <li
                    key={i}
                    className={
                      i === versions.length - 1
                        ? 'size-4 rounded-full border-2 border-background bg-ink-pink'
                        : i <= index
                          ? 'size-2.5 rounded-full bg-ink-magenta-light'
                          : 'size-2.5 rounded-full bg-pass-v1'
                    }
                  />
                ))}
              </ol>
              <input
                id={`${id}-range`}
                type="range"
                min={0}
                max={versions.length - 1}
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                aria-valuetext={`Version ${index + 1}, ${v.month}: ${v.note}`}
                className="absolute inset-0 size-full cursor-ew-resize opacity-0"
              />
            </div>
            <div className="mt-2 flex justify-between font-code text-xs text-muted-foreground">
              <span>v1 · Jan</span>
              <span>v14 · now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
