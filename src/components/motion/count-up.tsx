import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'

type CountUpProps = {
  value: number
  suffix?: string
  className?: string
  duration?: number
}

/** Animates a number from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, suffix = '', className, duration = 1.4 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(reduceMotion ? value : 0)

  useEffect(() => {
    if (!isInView || reduceMotion) return
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [isInView, reduceMotion, value, duration])

  return (
    <motion.span ref={ref} className={className}>
      {display.toLocaleString()}
      {suffix}
    </motion.span>
  )
}
