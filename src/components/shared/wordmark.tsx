import { cn } from '@/lib/utils'

/** Three overlapping marker passes, pink over magenta over violet. */
export function SwatchMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-6 shrink-0', className)}>
      <g style={{ mixBlendMode: 'screen' }}>
        <rect x="2" y="3" width="15" height="7" rx="2" fill="#ec4899" transform="rotate(-6 9 6)" />
        <rect x="5" y="9" width="15" height="7" rx="2" fill="#c026d3" transform="rotate(-6 12 12)" />
        <rect x="7" y="15" width="15" height="7" rx="2" fill="#8b5cf6" transform="rotate(-6 14 18)" />
      </g>
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <SwatchMark />
      <span className="font-display text-[1.35rem] leading-none uppercase">SketchSpace</span>
    </span>
  )
}
