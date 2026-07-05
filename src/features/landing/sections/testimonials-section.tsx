import { Reveal } from '@/components/motion/reveal'
import { testimonials } from '@/features/landing/content'

function TestimonialCard({ quote, name, role }: (typeof testimonials)[number]) {
  return (
    <figure className="w-[min(85vw,22rem)] shrink-0 rounded-2xl border border-border bg-background p-6">
      <blockquote className="text-sm text-foreground">"{quote}"</blockquote>
      <figcaption className="mt-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{name}</span> — {role}
      </figcaption>
    </figure>
  )
}

export function TestimonialsSection() {
  const row = [...testimonials, ...testimonials]

  return (
    <section className="overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">
            From the community
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-medium text-balance sm:text-5xl">
            Artists say it feels different.
          </h2>
        </Reveal>
      </div>

      <div className="group mt-14 flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
