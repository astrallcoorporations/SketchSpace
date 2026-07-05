import { useEffect, useRef } from 'react'

/** Calls `onIntersect` whenever the returned ref's element scrolls into view. */
export function useIntersectionObserver(onIntersect: () => void, enabled = true) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect()
      },
      { rootMargin: '400px' },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onIntersect, enabled])

  return ref
}
