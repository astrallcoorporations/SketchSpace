import { Skeleton } from '@/components/ui/skeleton'
import { TASK_STATUSES } from '@/features/projects/types'

const CARDS = [3, 2, 1, 2]

/** Same grid, column chrome and card height as the real board, so nothing moves when data lands. */
export function BoardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading board"
      className="grid auto-cols-[17rem] grid-flow-col gap-4 sm:auto-cols-[minmax(17rem,1fr)]"
    >
      {TASK_STATUSES.map((s, i) => (
        <div key={s} className="flex min-h-[18rem] flex-col gap-2 rounded-md border-2 border-border bg-pass-v4 p-3">
          <Skeleton className="mb-1 h-5 w-24" />
          {Array.from({ length: CARDS[i] }).map((_, n) => (
            <Skeleton key={n} className="h-[4.5rem] rounded-md" />
          ))}
        </div>
      ))}
    </div>
  )
}
