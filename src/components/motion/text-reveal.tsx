import { Fragment } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { duration, easing, stagger } from '@/lib/motion-tokens'

type TextRevealProps = {
  text: string
  className?: string
  /** Split by word (default) or by line (pass pre-split lines as `text` joined with \n). */
  by?: 'word' | 'line'
  delay?: number
  once?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'p'
}

const containerVariants = (staggerDelay: number, delay: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerDelay, delayChildren: delay },
  },
})

const pieceVariants: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { duration: duration.slow, ease: easing.out },
  },
}

/**
 * Marketing-headline reveal: splits text into words or lines and animates
 * each piece in on scroll, masked by its own overflow-hidden wrapper so the
 * motion reads as type rising into place rather than a block-level fade.
 */
export function TextReveal({
  text,
  className,
  by = 'word',
  delay = 0,
  once = true,
  as = 'h2',
}: TextRevealProps) {
  const reduceMotion = useReducedMotion()
  const pieces = by === 'word' ? text.split(' ') : text.split('\n')
  const MotionTag = motion[as]

  if (reduceMotion) {
    return <MotionTag className={className}>{text}</MotionTag>
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-10% 0px' }}
      variants={containerVariants(by === 'word' ? stagger.tight : stagger.loose, delay)}
    >
      {pieces.map((piece, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-top">
            <motion.span className="inline-block" variants={pieceVariants}>
              {piece}
            </motion.span>
          </span>
          {by === 'word' && i < pieces.length - 1 ? ' ' : null}
          {by === 'line' && i < pieces.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </MotionTag>
  )
}
