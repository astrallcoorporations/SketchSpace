import { lazy, Suspense, useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/magnetic'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-media-query'

// three/@react-three/fiber/drei are heavy — keep them out of the main landing
// chunk and let the scene stream in without blocking hero typography.
const HeroScene = lazy(() =>
  import('@/features/landing/hero/hero-scene').then((m) => ({ default: m.HeroScene })),
)

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const morphProgress = useRef(0)
  const reduceMotion = usePrefersReducedMotion()

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const parallaxX = useSpring(useTransform(pointerX, [-1, 1], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  })
  const parallaxY = useSpring(useTransform(pointerY, [-1, 1], [-8, 8]), {
    stiffness: 120,
    damping: 20,
  })

  const { scrollY } = useScroll()
  const indicatorOpacity = useTransform(scrollY, [0, 160], [1, 0])

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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          style={{ x: parallaxX, y: parallaxY }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur-sm">
            A creative operating system
          </span>

          <h1 className="max-w-4xl text-balance font-display text-5xl leading-[1.05] font-medium sm:text-7xl">
            The home where{' '}
            <span className="bg-gradient-to-r from-brand to-foreground bg-clip-text text-transparent">
              artists
            </span>{' '}
            improve together.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
            Learning, projects, portfolios and community — in one place built for the way
            artists actually grow.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Magnetic>
              <Button variant="brand" size="lg" className="h-11 px-6 text-base">
                Start creating
              </Button>
            </Magnetic>
            <Magnetic>
              <Button variant="outline" size="lg" className="h-11 px-6 text-base">
                See how it works
              </Button>
            </Magnetic>
          </div>
        </motion.div>
      </div>

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
