import type { ReactNode } from 'react'

/** CSS-columns masonry — robust, no JS layout measurement, no extra dependency. */
export function MasonryGrid({ children }: { children: ReactNode }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{children}</div>
  )
}

export function MasonryItem({ children }: { children: ReactNode }) {
  return <div className="mb-4 break-inside-avoid">{children}</div>
}
