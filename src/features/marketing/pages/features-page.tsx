import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Magnetic } from '@/components/motion/magnetic'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { featureDetails } from '@/features/marketing/content'
import { cn } from '@/lib/utils'

export function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Everything, built in</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-6xl">
            One system for actually getting better, not five tabs pretending to be one.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
            Every feature below is either live in the product today or in active development —
            marked clearly, no vaporware.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        <div className="space-y-20">
          {featureDetails.map((feature, i) => (
            <Reveal key={feature.title} delay={0.05}>
              <div
                className={cn(
                  'grid grid-cols-1 items-center gap-10 lg:grid-cols-2',
                  i % 2 === 1 && 'lg:[&>*:first-child]:order-2',
                )}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand-muted-foreground">
                      <feature.icon className="size-5" strokeWidth={1.75} />
                    </div>
                    <span className="text-sm font-medium tracking-wide text-brand uppercase">
                      {feature.eyebrow}
                    </span>
                    {feature.status === 'in-progress' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        <Clock className="size-3" /> In development
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-balance font-display text-2xl font-medium sm:text-3xl">
                    {feature.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground">{feature.description}</p>
                  <ul className="mt-6 space-y-2.5">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <StaggerGroup className="grid grid-cols-2 gap-3">
                  {feature.points.slice(0, 4).map((point) => (
                    <motion.div
                      key={point}
                      variants={staggerItem}
                      whileHover={{ y: -3 }}
                      className="flex aspect-square flex-col justify-between rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-sm)]"
                    >
                      <feature.icon className="size-5 text-brand" strokeWidth={1.75} />
                      <p className="text-sm font-medium text-balance">{point}</p>
                    </motion.div>
                  ))}
                </StaggerGroup>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-medium text-balance sm:text-4xl">
            Start with the pieces that are live today.
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Magnetic>
              <Button asChild variant="brand" size="lg" className="h-11 gap-2 px-6 text-base">
                <Link to="/signup">
                  Start creating <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Magnetic>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 text-base">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </Reveal>
      </section>
    </MarketingLayout>
  )
}
