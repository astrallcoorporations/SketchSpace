import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { duration, easing } from '@/lib/motion-tokens'

type MaskRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
}

/**
 * Reveals media through a wipe rather than a fade — the wrapper clips a
 * panel that slides off, uncovering the image beneath it. Used for
 * portfolio previews and hero imagery per the editorial-luxury motion spec.
 */
export function MaskReveal({ children, className, delay = 0, once = true }: MaskRevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      {children}
      {!reduceMotion && (
        <motion.div
          initial={{ scaleX: 1 }}
          whileInView={{ scaleX: 0 }}
          viewport={{ once, margin: '-10% 0px' }}
          transition={{ duration: duration.glacial, delay, ease: easing.out }}
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'right',
            background: 'var(--foreground)',
          }}
        />
      )}
    </div>
  )
}
