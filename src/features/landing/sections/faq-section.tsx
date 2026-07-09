import { Reveal } from '@/components/motion/reveal'
import { TextReveal } from '@/components/motion/text-reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faqs } from '@/features/landing/content'

export function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-40 sm:py-52">
      <div className="text-center">
        <Reveal>
          <p className="eyebrow justify-center">Questions</p>
        </Reveal>
        <TextReveal
          as="h2"
          text="Before you ask in a Discord no one reads."
          className="mx-auto mt-4 max-w-xl font-display text-4xl font-medium text-balance sm:text-6xl"
        />
      </div>

      <Reveal delay={0.1}>
        <Accordion type="single" collapsible className="mt-16">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-border/50">
              <AccordionTrigger className="text-left text-base transition-colors duration-200 hover:text-brand">
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
