import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/magnetic'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-media-query'

const HeroScene = lazy(() =>
  import('@/features/landing/hero/hero-scene').then((m) => ({ default: m.HeroScene })),
)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const morphProgress = useRef(0)
  const reduceMotion = usePrefersReducedMotion()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(useTransform(pointerX, [-1, 1], [-12, 12]), {
    stiffness: 100,
    damping: 15,
  })
  const parallaxY = useSpring(useTransform(pointerY, [-1, 1], [-10, 10]), {
    stiffness: 100,
    damping: 15,
  })

  const { scrollY } = useScroll()
  const indicatorOpacity = useTransform(scrollY, [0, 160], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.97])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.6])

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=140%',
        scrub: 0.4,
        onUpdate: (self) => {
          morphProgress.current = self.progress
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    function handlePointerMove(event: PointerEvent) {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      pointerX.set(nx)
      pointerY.set(ny)
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [reduceMotion, pointerX, pointerY])

  return (
    <section ref={sectionRef} className="relative h-svh overflow-hidden bg-background">
      <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-background via-brand-muted to-background" />}>
        <HeroScene morphProgress={morphProgress} />
      </Suspense>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/15 to-background/40" />

      <motion.div
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="eyebrow mb-8 justify-center"
          >
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            A creative operating system
          </motion.span>

          <h1 className="max-w-5xl text-balance font-display text-[clamp(3rem,9vw,8rem)] leading-[0.98] font-medium tracking-tight">
            The home where{' '}
            <span
              className="italic bg-gradient-to-r from-brand via-brand-muted-foreground to-brand bg-clip-text text-transparent animate-gradient-shimmer"
              style={{ fontOpticalSizing: 'auto' }}
            >
              artists
            </span>{' '}
            improve together.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-8 max-w-xl text-lg font-medium text-foreground/85 text-balance [text-shadow:0_2px_24px_var(--background),0_1px_3px_var(--background)]"
          >
            Learning, projects, portfolios and community — in one place built for the way
            artists actually grow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-4"
          >
            <Magnetic>
              <Button asChild variant="brand" size="lg" className="h-12 px-8 text-base btn-glow animate-glow-pulse">
                <Link to="/signup">Start creating</Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                <Link to="/features">See how it works</Link>
              </Button>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="size-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}
