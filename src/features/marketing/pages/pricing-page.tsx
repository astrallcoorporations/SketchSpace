import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { MarkerSwatch } from '@/components/swatch/marker-swatch'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'
import { marketingPricingTiers } from '@/features/marketing/content'

// No subscriptions or tiers. The only paid thing is an extra project slot: 3 projects free, then Rs 5 each.
const free = marketingPricingTiers[0]

const faqs = [
  {
    question: 'Do I need a card to start?',
    answer: 'No. SketchSpace is free to start, with no card and no trial clock running in the background. A card is only ever involved if you choose to buy an extra project slot.',
  },
  {
    question: 'What happens to my work if I leave?',
    answer: 'You keep full export access to every artwork, comment and project file at any time. There is no lock-in.',
  },
  {
    question: 'How much do projects cost?',
    answer: 'Your first 3 projects are free. Each project after that costs ₹5, paid once for that slot. There is no subscription and no recurring charge. Slots are only sold where payments are switched on; if they are not, you will be told plainly.',
  },
  {
    question: 'Are there paid plans?',
    answer: 'No. There are no tiers or subscriptions, only the ₹5 slot for each project after your third. Everything else stays free.',
  },
] as const

export function PricingPage() {
  return (
    <MarketingLayout>
      <Seo
        title="Pricing"
        description="SketchSpace is free to start: unlimited uploads, full version history, every learning path and a public profile. Your first 3 projects are free, then ₹5 each."
        canonical="/pricing"
      />
      <section className="px-4 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start">
          <div>
            <h1 className="font-display text-6xl leading-[0.86] uppercase sm:text-8xl">Free to start. ₹5 a project after three.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              No tiers to compare and nothing to upgrade. Your first 3 projects are free; each one after that is ₹5, once. Make work, keep its history, find your people.
            </p>
            <div className="mt-10 grid max-w-md grid-cols-5 gap-2" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-12 overflow-hidden rounded-[3px]">
                  <MarkerSwatch ink={n < 3 ? 'pink' : n < 5 ? 'magenta' : 'violet'} passes={n} seed={n + 60} animate />
                </div>
              ))}
            </div>
          </div>

          <div className="sheet p-6 sm:p-8">
            <h2 className="font-display text-4xl uppercase">{free.name}</h2>
            <p className="mt-2 text-paper-ink/80">{free.description}</p>
            <ul className="mt-6 space-y-3">
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

      <section aria-labelledby="pricing-faq" className="px-4 pb-28 sm:px-8">
        <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <h2 id="pricing-faq" className="font-display text-4xl leading-[0.9] uppercase sm:text-5xl">
            Fair questions
          </h2>
          <Accordion type="single" collapsible className="border-t-2 border-border">
            {faqs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question} className="border-b-2 border-border">
                <AccordionTrigger className="py-5 text-left text-lg font-semibold hover:no-underline hover:text-ink-pink-light">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-[62ch] pb-6 text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </MarketingLayout>
  )
}
