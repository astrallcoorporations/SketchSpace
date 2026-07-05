import { Reveal } from '@/components/motion/reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faqs } from '@/features/landing/content'

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-28 sm:py-36">
      <div className="text-center">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">
            Questions
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 font-display text-3xl font-medium text-balance sm:text-5xl">
            Before you ask in a Discord no one reads.
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  )
}
