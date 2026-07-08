import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'
import { marketingPricingTiers, pricingFaqs } from '@/features/marketing/content'
import { cn } from '@/lib/utils'

const currencies = [
  { code: 'INR', symbol: '₹', label: 'INR' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
] as const

const rates: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
}

function convertPrice(inr: number, currency: string): number {
  if (inr === 0) return 0
  return Math.round(inr * (rates[currency] ?? 1))
}

export function PricingPage() {
  const [yearly, setYearly] = useState(true)
  const [currency, setCurrency] = useState<string>('INR')
  const [currencyOpen, setCurrencyOpen] = useState(false)

  const currentCurrency = currencies.find((c) => c.code === currency) ?? currencies[0]

  return (
    <MarketingLayout>
      <Seo
        title="Pricing"
        description="Start free. Upgrade when your team depends on it. Simple plans for solo artists and studios."
        canonical="/pricing"
      />
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
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
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

            {/* Currency selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background"
              >
                <span>{currentCurrency.symbol}</span>
                <span>{currentCurrency.code}</span>
                <ChevronDown className={cn('size-3.5 transition-transform', currencyOpen && 'rotate-180')} />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-lg)]">
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCurrency(c.code); setCurrencyOpen(false) }}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted',
                        currency === c.code && 'bg-muted font-medium',
                      )}
                    >
                      <span className="w-4 text-center">{c.symbol}</span>
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <StaggerGroup className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {marketingPricingTiers.map((tier) => {
            const price = convertPrice(yearly ? tier.yearly : tier.monthly, currency)
            return (
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
                  <span className="font-display text-4xl font-medium">{currentCurrency.symbol}</span>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={`${yearly}-${currency}-${tier.name}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="font-display text-4xl font-medium"
                    >
                      {price}
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
                    <Link to="/contact">{tier.cta}</Link>
                  ) : (
                    <Link to="/signup">{tier.cta}</Link>
                  )}
                </Button>
              </motion.div>
            )
          })}
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
