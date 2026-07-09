import { useEffect, useRef } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { TextReveal } from '@/components/motion/text-reveal'
import { gsap } from '@/lib/gsap'
import { usePrefersReducedMotion } from '@/hooks/use-media-query'
import { collaborationShowcase } from '@/features/landing/content'

export function CollaborationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reduceMotion || !sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      const track = trackRef.current!
      const scrollDistance = () => Math.max(track.scrollWidth - window.innerWidth, 0)

      const tween = gsap.to(track, {
        x: () => -scrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${scrollDistance()}`,
          scrub: 0.5,
          pin: true,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-foreground text-background">
      <div className="flex h-svh flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal>
            <p className="eyebrow">Project collaboration</p>
          </Reveal>
          <TextReveal
            as="h2"
            text="From open call to shipped project."
            className="mt-4 max-w-xl font-display text-4xl font-medium text-balance sm:text-6xl"
          />
        </div>

        <div
          ref={trackRef}
          className="mt-20 flex w-max gap-6 px-6 will-change-transform sm:gap-8 sm:px-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {collaborationShowcase.map((step, i) => (
            <div
              key={step.title}
              className="group flex w-[min(80vw,24rem)] shrink-0 flex-col justify-between rounded-2xl border border-background/15 bg-background/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-background/25 hover:bg-background/8"
            >
              <span className="font-display text-4xl italic tabular-nums text-brand transition-transform duration-300 group-hover:scale-110 group-hover:origin-left">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mt-16">
                <h3 className="text-xl font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-background/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
