import { useRef, type PointerEvent, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

type TiltCardProps = {
  children: ReactNode
  className?: string
  maxTilt?: number
}

/** 3D pointer-tilt card. Falls back to a static card for touch / reduced-motion. */
export function TiltCard({ children, className, maxTilt = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const rotateXRaw = useMotionValue(0)
  const rotateYRaw = useMotionValue(0)
  const rotateX = useSpring(rotateXRaw, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(rotateYRaw, { stiffness: 300, damping: 30 })
  const glowX = useTransform(rotateY, [-maxTilt, maxTilt], [0, 100])
  const glowY = useTransform(rotateX, [-maxTilt, maxTilt], [100, 0])

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return
    const bounds = ref.current.getBoundingClientRect()
    const px = (event.clientX - bounds.left) / bounds.width
    const py = (event.clientY - bounds.top) / bounds.height
    rotateYRaw.set((px - 0.5) * maxTilt * 2)
    rotateXRaw.set((0.5 - py) * maxTilt * 2)
  }

  function handlePointerLeave() {
    rotateXRaw.set(0)
    rotateYRaw.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, var(--brand-muted), transparent 60%)`,
          ),
        }}
      />
      {children}
    </motion.div>
  )
}
