import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { marketingPricingTiers, pricingFaqs } from '@/features/marketing/content'
import { cn } from '@/lib/utils'

export function PricingPage() {
  const [yearly, setYearly] = useState(true)

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Pricing</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-6xl">
            Start free. Upgrade when a team depends on it.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
            {(['monthly', 'yearly'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setYearly(option === 'yearly')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                  (option === 'yearly') === yearly
                    ? 'bg-background text-foreground shadow-[var(--shadow-sm)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option}
                {option === 'yearly' && <span className="ml-1.5 text-xs text-brand">save 25%</span>}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <StaggerGroup className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {marketingPricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              className={cn(
                'flex flex-col rounded-2xl border p-8',
                tier.featured
                  ? 'border-brand bg-foreground text-background shadow-[var(--shadow-lg)]'
                  : 'border-border bg-background',
              )}
            >
              <h2 className="text-lg font-medium">{tier.name}</h2>
              <p className={cn('mt-1 text-sm', tier.featured ? 'text-background/70' : 'text-muted-foreground')}>
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
                <span className={cn('text-sm', tier.featured ? 'text-background/70' : 'text-muted-foreground')}>
                  /mo
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span className={tier.featured ? 'text-background/90' : 'text-foreground'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={tier.featured ? 'brand' : 'outline'}
                className={cn('mt-8', tier.featured && 'bg-background text-foreground hover:bg-background/90')}
              >
                {tier.ctaTarget === 'contact' ? (
                  <a href="mailto:hello@sketchspace.app?subject=Teams%20plan">{tier.cta}</a>
                ) : (
                  <Link to="/signup">{tier.cta}</Link>
                )}
              </Button>
            </motion.div>
          ))}
        </StaggerGroup>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-28">
        <Reveal>
          <h2 className="text-center font-display text-2xl font-medium">Billing questions</h2>
        </Reveal>
        <div className="mt-10 space-y-8">
          {pricingFaqs.map((faq) => (
            <Reveal key={faq.question} delay={0.05}>
              <h3 className="font-medium">{faq.question}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{faq.answer}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
