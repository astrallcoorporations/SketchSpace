import { MarkerSwatch } from './marker-swatch'
import { MarkerScribble } from './marker-scribble'
import type { InkName } from './marker-ink'

const rows: { ink: InkName; code: string }[] = [
  { ink: 'pink', code: 'P' },
  { ink: 'magenta', code: 'M' },
  { ink: 'violet', code: 'V' },
]
const PASSES = [1, 2, 3, 4, 5, 6]

/**
 * The brand's own swatch ladder: each ink from one pass to six, on a test
 * sheet you can scribble on. Used as the header graphic on marketing pages.
 */
export function SwatchLadder({ caption = 'Test sheet · draw on it', className }: { caption?: string; className?: string }) {
  return (
    <figure className={`sheet relative p-4 sm:p-5 ${className ?? ''}`} aria-hidden="true">
      <div className="relative space-y-3">
        {rows.map((row, r) => (
          <div key={row.code} className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {PASSES.map((n) => (
              <div key={n}>
                <div className="h-10 overflow-hidden border-[1.5px] border-paper-ink sm:h-12">
                  <MarkerSwatch ink={row.ink} passes={n} seed={r * 11 + n} animate />
                </div>
                <span className="mt-1 hidden font-code text-[0.6rem] leading-none text-paper-ink/75 sm:block">
                  {row.code}
                  {n}
                </span>
              </div>
            ))}
          </div>
        ))}
        <MarkerScribble />
      </div>
      <figcaption className="mt-3 border-t-[1.5px] border-paper-ink pt-2 font-code text-[0.65rem] text-paper-ink/75">
        {caption}
      </figcaption>
    </figure>
  )
}
