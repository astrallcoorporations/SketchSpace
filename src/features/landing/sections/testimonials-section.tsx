import { testimonials } from '@/features/landing/content'

export function TestimonialsSection() {
  return (
    <section aria-labelledby="voices-title" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[88rem]">
        <h2 id="voices-title" className="font-display text-5xl leading-[0.9] uppercase sm:text-7xl">
          Artists say it feels different.
        </h2>
        <ul className="mt-14 grid gap-x-12 gap-y-14 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <li key={t.name}>
              <figure>
                <blockquote
                  className={`font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05] font-[650] [font-stretch:80%] ${
                    ['text-ink-pink-light', 'text-foreground', 'text-foreground', 'text-ink-violet-light'][i]
                  }`}
                >
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className="h-[2px] w-8 bg-border" />
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground">{t.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
