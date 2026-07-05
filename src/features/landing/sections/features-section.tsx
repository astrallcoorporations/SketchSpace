import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { motion } from 'framer-motion'
import { features } from '@/features/landing/content'

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-brand uppercase">What you get</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-medium text-balance sm:text-5xl">
          Everything scattered across five other tools, actually connected.
        </h2>
      </Reveal>

      <StaggerGroup className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-background p-8"
          >
            <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
              <Icon className="size-5" strokeWidth={1.75} />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  )
}
