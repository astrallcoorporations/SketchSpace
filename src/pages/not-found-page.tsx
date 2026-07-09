import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { duration, easing, spring } from '@/lib/motion-tokens'

/* ---------- floating paint splatters (pure CSS + framer) ---------- */

const SPLATTER_COLORS = [
  'var(--brand)',
  'color-mix(in oklch, var(--brand), white 25%)',
  'color-mix(in oklch, var(--brand), white 50%)',
  'color-mix(in oklch, var(--brand), black 25%)',
  'var(--brand-muted)',
  'color-mix(in oklch, var(--brand-muted), var(--brand) 35%)',
  'color-mix(in oklch, var(--brand), transparent 35%)',
]

type Splatter = {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  driftX: number
  driftY: number
  rotate: number
  blur: number
}

function generateSplatters(count: number): Splatter[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 6 + Math.random() * 60,
    color: SPLATTER_COLORS[Math.floor(Math.random() * SPLATTER_COLORS.length)],
    delay: Math.random() * 0.8,
    driftX: (Math.random() - 0.5) * 80,
    driftY: (Math.random() - 0.5) * 80,
    rotate: Math.random() * 360,
    blur: 10 + Math.random() * 30,
  }))
}

/* ---------- floating ink drops ---------- */

type InkDrop = {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateInkDrops(count: number): InkDrop[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 3 + Math.random() * 8,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 5,
    opacity: 0.15 + Math.random() * 0.3,
  }))
}

/* ---------- component ---------- */

export default function NotFoundPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [splatters] = useState(() => generateSplatters(18))
  const [inkDrops] = useState(() => generateInkDrops(24))

  // Parallax mouse tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-20, 20])
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-20, 20])
  const parallaxXDeep = useTransform(smoothX, [-0.5, 0.5], [-40, 40])
  const parallaxYDeep = useTransform(smoothY, [-0.5, 0.5], [-40, 40])

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    }

    const el = containerRef.current
    el?.addEventListener('mousemove', handleMouseMove)
    return () => el?.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  }

  const itemUp = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: duration.slow, ease: easing.out },
    },
  }

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background"
    >
      {/* ── background grain ── */}
      <div className="bg-noise absolute inset-0 z-0" />

      {/* ── radial gradient glow ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, color-mix(in oklch, var(--brand) 12%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* ── paint splatters ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ x: parallaxXDeep, y: parallaxYDeep }}
      >
        {splatters.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              filter: `blur(${s.blur}px)`,
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 0.5, 0.3],
              scale: [0, 1.2, 1],
              rotate: s.rotate,
              x: [0, s.driftX / 2, s.driftX],
              y: [0, s.driftY / 2, s.driftY],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: s.delay,
              ease: 'easeOut',
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1 + Math.random() * 3,
            }}
          />
        ))}
      </motion.div>

      {/* ── floating ink drops ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {inkDrops.map((drop) => (
          <motion.div
            key={drop.id}
            className="absolute rounded-full"
            style={{
              left: `${drop.x}%`,
              width: drop.size,
              height: drop.size,
              backgroundColor: 'var(--brand)',
              opacity: drop.opacity,
            }}
            initial={{ y: '110vh' }}
            animate={{ y: '-10vh' }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* ── main content ── */}
      <motion.div
        className="relative z-10 flex max-w-lg flex-col items-center px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ x: parallaxX, y: parallaxY }}
      >
        {/* giant 404 */}
        <motion.div variants={itemUp} className="relative mb-2">
          <motion.span
            className="block select-none font-display text-[10rem] leading-none font-black tracking-tighter sm:text-[14rem]"
            style={{
              background:
                'linear-gradient(135deg, var(--brand) 0%, color-mix(in oklch, var(--brand), white 35%) 40%, color-mix(in oklch, var(--brand), white 60%) 70%, var(--brand) 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            404
          </motion.span>

          {/* glitch echo layers */}
          <motion.span
            className="pointer-events-none absolute inset-0 block select-none font-display text-[10rem] leading-none font-black tracking-tighter opacity-20 sm:text-[14rem]"
            style={{ color: 'color-mix(in oklch, var(--brand), black 15%)', mixBlendMode: 'screen' }}
            animate={{ x: [0, -3, 3, -1, 0], y: [0, 2, -2, 1, 0] }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          >
            404
          </motion.span>
          <motion.span
            className="pointer-events-none absolute inset-0 block select-none font-display text-[10rem] leading-none font-black tracking-tighter opacity-10 sm:text-[14rem]"
            style={{ color: 'color-mix(in oklch, var(--brand), white 45%)', mixBlendMode: 'screen' }}
            animate={{ x: [0, 4, -4, 2, 0], y: [0, -3, 3, -1, 0] }}
            transition={{
              duration: 0.4,
              delay: 0.05,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          >
            404
          </motion.span>
        </motion.div>

        {/* pencil divider */}
        <motion.div
          variants={itemUp}
          className="mb-6 flex items-center gap-3"
        >
          <motion.div
            className="h-px w-12 bg-gradient-to-r from-transparent to-brand/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration.slow, delay: 0.6, ease: easing.out }}
            style={{ transformOrigin: 'left' }}
          />
          <motion.div
            animate={{ rotate: [0, 10, -10, 5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="size-5 text-brand" />
          </motion.div>
          <motion.div
            className="h-px w-12 bg-gradient-to-l from-transparent to-brand/50"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration.slow, delay: 0.6, ease: easing.out }}
            style={{ transformOrigin: 'right' }}
          />
        </motion.div>

        {/* headline */}
        <motion.h1
          variants={itemUp}
          className="mb-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          This page wandered off-canvas.
        </motion.h1>

        {/* subtitle */}
        <motion.p
          variants={itemUp}
          className="mb-8 max-w-sm text-base leading-relaxed text-muted-foreground"
        >
          Looks like the sketch you're looking for got lost between the layers.
          Let's get you back to the studio.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={itemUp}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}>
            <Button asChild variant="brand" size="lg" className="gap-2 px-6">
              <Link to="/">
                <ArrowLeft className="size-4" />
                Back to SketchSpace
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}>
            <Button asChild variant="outline" size="lg" className="px-6">
              <Link to="/app">Open Studio</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* bottom decorative dots */}
        <motion.div
          className="mt-12 flex items-center gap-2"
          variants={itemUp}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="rounded-full bg-brand"
              style={{
                width: i === 2 ? 8 : 4,
                height: i === 2 ? 8 : 4,
                opacity: i === 2 ? 0.6 : 0.2,
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: i === 2 ? [0.6, 1, 0.6] : [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* ── corner decorations ── */}
      <motion.div
        className="absolute bottom-6 left-6 z-10 hidden text-xs tracking-widest text-muted-foreground/40 uppercase sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: duration.slow }}
      >
        Error 404
      </motion.div>
      <motion.div
        className="absolute right-6 bottom-6 z-10 hidden text-xs tracking-widest text-muted-foreground/40 uppercase sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: duration.slow }}
      >
        SketchSpace
      </motion.div>
    </main>
  )
}
