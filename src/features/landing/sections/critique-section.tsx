import { useState, type MouseEvent } from 'react'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'

type Pin = { x: number; y: number; author: string; note: string }

// Example critique on an example colour study.
const seedPins: Pin[] = [
  { x: 34, y: 38, author: 'Deshawn', note: 'This edge goes muddy where the two passes meet. Let the first dry.' },
  { x: 68, y: 66, author: 'Priya', note: 'Love this transition. Push the violet one more pass.' },
]

export function CritiqueSection() {
  const [pins, setPins] = useState<Pin[]>(seedPins)
  const [active, setActive] = useState(0)

  const addPin = (e: MouseEvent<HTMLDivElement>) => {
    if (pins.length >= 6) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setPins((p) => [...p, { x, y, author: 'You', note: 'In SketchSpace your comment lives exactly here.' }])
    setActive(pins.length)
  }

  return (
    <section aria-labelledby="critique-title" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-center lg:gap-16">
        <div className="sheet p-3 sm:p-4">
          <div
            onClick={addPin}
            className="relative aspect-[16/10] cursor-crosshair overflow-hidden border-[1.5px] border-paper-ink"
            role="presentation"
          >
            <div className="absolute inset-0 grid grid-cols-3">
              <MarkerSwatch ink="pink" passes={3} seed={7} />
              <MarkerSwatch ink="magenta" passes={4} seed={8} />
              <MarkerSwatch ink="violet" passes={5} seed={9} />
            </div>
            {pins.map((pin, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActive(i)
                }}
                aria-label={`Comment ${i + 1} by ${pin.author}`}
                aria-pressed={active === i}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={`absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-paper-ink font-code text-xs font-semibold transition-transform ${
                  active === i ? 'scale-110 bg-paper-ink text-paper' : 'bg-paper text-paper-ink'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-paper-ink/75">Example colour study. Click anywhere on it to pin a comment.</p>
        </div>

        <div>
          <h2 id="critique-title" className="font-display text-5xl leading-[0.9] uppercase sm:text-6xl">
            Critique that points at the stroke.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Every comment is pinned to the exact spot it is about, and threads stay with that version of the piece.
          </p>
          <ol className="mt-8 space-y-3" aria-live="polite">
            {pins.map((pin, i) => (
              <li
                key={i}
                className={`rounded-md border-2 p-4 transition-colors ${active === i ? 'border-ink-magenta-light bg-pass-v4' : 'border-border'}`}
              >
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <span className="font-code text-xs text-ink-pink-light">#{i + 1}</span>
                  {pin.author}
                </p>
                <p className="mt-1 text-muted-foreground">{pin.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
