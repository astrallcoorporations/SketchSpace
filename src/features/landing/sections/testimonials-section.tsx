import { Reveal } from '@/components/motion/reveal'
import { TextReveal } from '@/components/motion/text-reveal'
import { testimonials } from '@/features/landing/content'

function TestimonialCard({ quote, name, role }: (typeof testimonials)[number]) {
  return (
    <figure className="group w-[min(85vw,22rem)] shrink-0 rounded-2xl border border-border bg-background p-6 transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5">
      <blockquote className="pull-quote text-base text-foreground">{quote}</blockquote>
      <figcaption className="mt-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span> — {role}
      </figcaption>
    </figure>
  )
}

export function TestimonialsSection() {
  const row = [...testimonials, ...testimonials]

  return (
    <section className="overflow-hidden py-40 sm:py-52">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="eyebrow">From the community</p>
        </Reveal>
        <TextReveal
          as="h2"
          text="Artists say it feels different."
          className="mt-4 max-w-lg font-display text-4xl font-medium text-balance sm:text-6xl"
        />
      </div>

      <div className="group mt-20 flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {row.map((t, i) => (
            <TestimonialCard key={`${t.name}-${i}`} {...t} />
          ))}
        </div>
        <div className="flex w-max gap-4 animate-marquee-reverse group-hover:[animation-play-state:paused]">
          {row
            .slice()
            .reverse()
            .map((t, i) => (
              <TestimonialCard key={`${t.name}-rev-${i}`} {...t} />
            ))}
        </div>
      </div>
    </section>
  )
}
