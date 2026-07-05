import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { duration, easing, stagger } from '@/lib/motion-tokens'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Delay before this element's animation starts, in seconds. */
  delay?: number
  /** Direction the element travels in from. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Re-trigger every time it scrolls into view vs. only once. */
  once?: boolean
  as?: 'div' | 'section' | 'span' | 'li'
}

const offset = { up: 24, down: -24, left: 24, right: -24, none: 0 }

/** Fade + rise into view. The atomic building block for scroll storytelling. */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  once = true,
  as = 'div',
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const distance = reduceMotion ? 0 : offset[direction]
  const isHorizontal = direction === 'left' || direction === 'right'

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: isHorizontal ? distance : 0,
      y: !isHorizontal ? distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : duration.slow,
        delay,
        ease: easing.out,
      },
    },
  }

  const MotionTag = motion[as]

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
      variants={variants}
    >
      {children}
    </MotionTag>
  )
}

type StaggerGroupProps = {
  children: ReactNode
  className?: string
  gap?: keyof typeof stagger
  once?: boolean
}

/** Wrap a list of children to reveal them in sequence rather than all at once. */
export function StaggerGroup({
  children,
  className,
  gap = 'base',
  once = true,
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
      variants={{
        visible: {
          transition: { staggerChildren: reduceMotion ? 0 : stagger[gap] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.out },
  },
}
