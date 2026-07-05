import { motion } from 'framer-motion'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { Flame, Palette, Users2 } from 'lucide-react'

const quests = [
  {
    icon: Flame,
    title: '30-day sketch streak',
    reward: '450 XP',
    progress: 0.72,
  },
  {
    icon: Palette,
    title: 'Master one new medium',
    reward: '800 XP',
    progress: 0.4,
  },
  {
    icon: Users2,
    title: 'Ship a collaborative project',
    reward: '1200 XP',
    progress: 0.15,
  },
] as const

const radius = 26
const circumference = 2 * Math.PI * radius

export function CommunitySection() {
  return (
    <section id="community" className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <Reveal>
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          Community quests
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-medium text-balance sm:text-5xl">
          Progress you can see, with people cheering you on.
        </h2>
      </Reveal>

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {quests.map(({ icon: Icon, title, reward, progress }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border bg-background p-7 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex size-16 shrink-0 items-center justify-center">
                <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    whileInView={{ strokeDashoffset: circumference * (1 - progress) }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </svg>
                <Icon className="size-5 text-brand" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="text-xs text-muted-foreground">{reward} on completion</p>
              </div>
            </div>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  )
}
