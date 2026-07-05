import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { TiltCard } from '@/components/motion/tilt-card'
import { motion } from 'framer-motion'

const pieces = [
  { title: 'Nocturne series', medium: 'Digital painting', gradient: 'from-violet-500/40 via-fuchsia-500/20 to-transparent' },
  { title: 'Character sheet — Kaia', medium: '3D / ZBrush', gradient: 'from-sky-500/40 via-violet-500/20 to-transparent' },
  { title: 'Study: hands, week 12', medium: 'Traditional ink', gradient: 'from-amber-500/40 via-rose-500/20 to-transparent' },
] as const

export function PortfolioSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">
              Portfolio builder
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-medium text-balance sm:text-5xl">
              A portfolio that builds itself from your best work.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="max-w-xs text-sm text-muted-foreground">
            No drag-and-drop template. SketchSpace assembles your strongest, most recent pieces
            automatically — you just keep making work.
          </p>
        </Reveal>
      </div>

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {pieces.map((piece) => (
          <motion.div key={piece.title} variants={staggerItem}>
            <TiltCard className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted">
              <div className={`absolute inset-0 bg-gradient-to-br ${piece.gradient}`} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
                <h3 className="text-sm font-medium">{piece.title}</h3>
                <p className="text-xs text-muted-foreground">{piece.medium}</p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  )
}
