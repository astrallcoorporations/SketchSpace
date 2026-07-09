/**
 * Shared motion vocabulary for Framer Motion + GSAP so every animation in the
 * app pulls from the same rhythm instead of ad-hoc numbers per component.
 */

export const duration = {
  micro: 0.15, // hover/press feedback — stays snappy, not luxury-slow
  fast: 0.25, // small UI transitions
  base: 0.5, // default enter animation
  slow: 0.75, // hero / scroll-story beats
  glacial: 1.5, // large scene transitions
} as const

export const easing = {
  // Framer Motion cubic-bezier arrays — luxury decelerate, used everywhere an
  // element enters (was split across out/in/inOut; editorial motion favors
  // one considered curve over snappy asymmetric ones).
  out: [0.16, 1, 0.3, 1] as const, // decelerate — entering elements
  in: [0.7, 0, 0.84, 0] as const, // accelerate — exiting elements
  inOut: [0.16, 1, 0.3, 1] as const, // symmetric — layout/shared-element
  // GSAP string equivalents
  gsapOut: 'power4.out',
  gsapIn: 'power4.in',
  gsapInOut: 'power2.inOut',
} as const

export const spring = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as const,
  soft: { type: 'spring', stiffness: 220, damping: 26 } as const,
  bouncy: { type: 'spring', stiffness: 300, damping: 18 } as const,
}

export const stagger = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
