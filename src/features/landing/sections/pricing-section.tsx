import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pricingTiers } from '@/features/landing/content'

// No subscriptions or tiers. The only paid thing is an extra project slot: 3 projects free, then Rs 5 each.
const free = pricingTiers[0]

export function PricingSection() {
  return (
    <section aria-labelledby="pricing-title" className="bg-pass-v6 px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center">
        <div>
          <h2 id="pricing-title" className="font-display text-6xl leading-[0.86] uppercase sm:text-8xl">
            Free to start. ₹5 a project after three.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            SketchSpace is free to use, and your first 3 projects cost nothing. Every project after that is ₹5, paid once. No subscription, and nothing you make is locked in.
          </p>
        </div>
        <div className="sheet p-6 sm:p-8">
          <p className="font-display text-3xl uppercase">Everything you need to start</p>
          <ul className="mt-5 space-y-3">
            {free.features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-ink-magenta" strokeWidth={2.25} aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Button asChild variant="brand" size="lg" className="mt-8 w-full">
            <Link to="/signup">Create free account</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
