import { motion } from 'framer-motion'
import { Reveal } from '@/components/motion/reveal'
import { CountUp } from '@/components/motion/count-up'
import { growthStats } from '@/features/landing/content'

const points = [
  [0, 150],
  [60, 140],
  [120, 120],
  [180, 128],
  [240, 88],
  [300, 96],
  [360, 52],
  [420, 40],
] as const

const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
const areaPath = `${linePath} L420,190 L0,190 Z`

export function GrowthSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-28 sm:py-36 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">
              Artist growth
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 font-display text-3xl font-medium text-balance sm:text-5xl">
              See yourself getting better. Literally.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-md text-muted-foreground">
              Every upload plots against your own history. No comparison to strangers — just
              the line that matters: the one going up.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {growthStats.map((stat) => (
              <Reveal key={stat.label} delay={0.15}>
                <div>
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    className="font-display text-2xl font-medium sm:text-3xl"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal direction="left" delay={0.1}>
          <svg
            viewBox="0 0 420 190"
            className="w-full overflow-visible"
            role="img"
            aria-label="Chart showing an artist's skill trending upward over time"
          >
            <defs>
              <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3].map((row) => (
              <line
                key={row}
                x1="0"
                x2="420"
                y1={40 + row * 40}
                y2={40 + row * 40}
                stroke="var(--border)"
                strokeDasharray="4 6"
              />
            ))}

            <motion.path
              d={areaPath}
              fill="url(#growth-fill)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--brand)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />

            {points.map(([x, y], i) => (
              <motion.circle
                key={x}
                cx={x}
                cy={y}
                r={4}
                fill="var(--background)"
                stroke="var(--brand)"
                strokeWidth={2}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
              />
            ))}
          </svg>
        </Reveal>
      </div>
    </section>
  )
}
