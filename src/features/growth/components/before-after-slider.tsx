import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import type { BeforeAfterCandidate } from '@/features/growth/computations'
import { sanitizeImageUrl } from '@/lib/image-url'

export function BeforeAfterSlider({ candidate }: { candidate: BeforeAfterCandidate }) {
  const [position, setPosition] = useState(50)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted">
      <div className="relative aspect-[4/3] w-full select-none overflow-hidden sm:aspect-video">
        <img
          src={sanitizeImageUrl(candidate.after.image_url) ?? ''}
          alt={`${candidate.artwork.title} — latest version`}
          crossOrigin="anonymous"
          className="absolute inset-0 size-full object-cover"
          draggable={false}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={sanitizeImageUrl(candidate.before.image_url) ?? ''}
            alt={`${candidate.artwork.title} — earlier version`}
            crossOrigin="anonymous"
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 flex w-0.5 -translate-x-1/2 items-center bg-background"
          style={{ left: `${position}%` }}
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-background text-foreground shadow-[var(--shadow-md)]">
            <GripVertical className="size-3.5" />
          </div>
        </div>

        <span className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          Before · v{candidate.before.version_number}
        </span>
        <span className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          After · v{candidate.after.version_number}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          aria-label={`Compare ${candidate.artwork.title} before and after`}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <p className="truncate text-sm font-medium">{candidate.artwork.title}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {candidate.daySpan === 0 ? 'Same day' : `${candidate.daySpan} day${candidate.daySpan === 1 ? '' : 's'} apart`}
        </p>
      </div>
    </div>
  )
}
