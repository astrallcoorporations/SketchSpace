import { useRef, type ReactNode, type PointerEvent } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { spring } from '@/lib/motion-tokens'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** How far the element travels toward the pointer, in pixels. */
  strength?: number
}

/**
 * Wrap any interactive element (button, link, card) to pull it toward the
 * cursor within its bounds. Disabled entirely for touch and reduced-motion.
 */
export function Magnetic({ children, className, strength = 16 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, spring.soft)
  const springY = useSpring(y, spring.soft)

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return
    const bounds = ref.current.getBoundingClientRect()
    const relativeX = event.clientX - (bounds.left + bounds.width / 2)
    const relativeY = event.clientY - (bounds.top + bounds.height / 2)
    x.set((relativeX / bounds.width) * strength)
    y.set((relativeY / bounds.height) * strength)
  }

  function handlePointerLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  )
}
