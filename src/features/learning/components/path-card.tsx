import { Link } from 'react-router-dom'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import { PathIcon } from './path-icon'
import type { PathProgress } from '@/features/learning/types'

/** A learning path; progress is a swatch bar, filled as far as the lessons go. */
export function PathCard({ path }: { path: PathProgress }) {
  const pct = path.totalLessons > 0 ? Math.round((path.completedLessons / path.totalLessons) * 100) : 0
  const isComplete = path.totalLessons > 0 && path.completedLessons === path.totalLessons

  return (
    <Link
      to={`/learning/${path.slug}`}
      className="group flex h-full flex-col rounded-md border-2 border-border bg-pass-v4 p-5 transition-colors duration-200 hover:border-ink-violet-light"
    >
      <PathIcon name={path.icon} className="size-6 text-ink-violet-light" strokeWidth={1.75} />
      <h3 className="mt-4 font-display text-2xl leading-[0.95] uppercase">{path.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">{path.description}</p>

      <div className="mt-5">
        <div
          role="progressbar"
          aria-label={`${path.title} progress`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-3 overflow-hidden rounded-[2px] bg-paper"
        >
          {pct > 0 && (
            <div className="h-full" style={{ width: `${pct}%` }}>
              <MarkerSwatch ink={isComplete ? 'violet' : 'magenta'} passes={isComplete ? 4 : 2} seed={path.title.length} />
            </div>
          )}
        </div>
        <p className="mt-2 flex justify-between font-code text-xs text-muted-foreground">
          <span>
            {path.completedLessons}/{path.totalLessons} lessons
          </span>
          {isComplete && <span className="text-ink-violet-light">Complete</span>}
        </p>
      </div>
    </Link>
  )
}
