import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { TextReveal } from '@/components/motion/text-reveal'
import { motion } from 'framer-motion'
import { features } from '@/features/landing/content'

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-40 sm:py-52">
      <Reveal>
        <p className="eyebrow">What you get</p>
      </Reveal>
      <TextReveal
        as="h2"
        text="Everything scattered across five other tools, actually connected."
        className="mt-4 max-w-2xl font-display text-4xl font-medium text-balance sm:text-6xl"
      />

      <StaggerGroup className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            className="group relative bg-background p-8 transition-shadow duration-300 hover:shadow-[var(--shadow-md)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-[0_0_20px_-4px_var(--brand)]">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  )
}
