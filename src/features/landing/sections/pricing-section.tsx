import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pricingTiers } from '@/features/landing/content'

export function PricingSection() {
  const [yearly, setYearly] = useState(true)

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <div className="text-center">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Pricing</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 font-display text-3xl font-medium text-balance sm:text-5xl">
            Start free. Upgrade when a team depends on it.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
            {(['monthly', 'yearly'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setYearly(option === 'yearly')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all duration-300',
                  (option === 'yearly') === yearly
                    ? 'bg-background text-foreground shadow-[var(--shadow-sm)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option}
                {option === 'yearly' && (
                  <span className="ml-1.5 text-xs text-brand">save 25%</span>
                )}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => (
          <motion.div
            key={tier.name}
            variants={staggerItem}
            whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
            className={cn(
              'flex flex-col rounded-2xl border p-8 transition-shadow duration-300',
              tier.featured
                ? 'border-brand bg-foreground text-background shadow-[var(--shadow-lg)] pricing-featured-glow'
                : 'border-border bg-background hover:shadow-[var(--shadow-md)]',
            )}
          >
            <h3 className="text-lg font-medium">{tier.name}</h3>
            <p
              className={cn(
                'mt-1 text-sm',
                tier.featured ? 'text-background/70' : 'text-muted-foreground',
              )}
            >
              {tier.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-medium">$</span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={yearly ? tier.yearly : tier.monthly}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="font-display text-4xl font-medium"
                >
                  {yearly ? tier.yearly : tier.monthly}
                </motion.span>
              </AnimatePresence>
              <span
                className={cn(
                  'text-sm',
                  tier.featured ? 'text-background/70' : 'text-muted-foreground',
                )}
              >
                /mo
              </span>
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span className={tier.featured ? 'text-background/90' : 'text-foreground'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.featured ? 'brand' : 'outline'}
              className={cn(
                'mt-8',
                tier.featured && 'bg-background text-foreground hover:bg-background/90',
              )}
            >
              {tier.monthly === 0 ? 'Start free' : `Choose ${tier.name}`}
            </Button>
          </motion.div>
        ))}
      </StaggerGroup>
    </section>
  )
}
