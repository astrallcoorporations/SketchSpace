import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { faqs } from '@/features/landing/content'

export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
        <h2 id="faq-title" className="font-display text-5xl leading-[0.9] uppercase sm:text-6xl">
          Before you ask in a Discord no one reads.
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
  )
}
