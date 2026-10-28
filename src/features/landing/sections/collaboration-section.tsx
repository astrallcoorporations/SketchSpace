import { collaborationShowcase } from '@/features/landing/content'

const caps = ['bg-ink-pink', 'bg-ink-magenta', 'bg-ink-violet', 'bg-ink-violet-light']

/** The project flow as one ruled board on paper: four columns, in order. */
export function CollaborationSection() {
  return (
    <section aria-labelledby="collab-title" className="bg-pass-v6 px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="collab-title" className="max-w-3xl font-display text-5xl leading-[0.9] uppercase sm:text-7xl">
            From open call to shipped project.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Projects get a real board, shared files and live presence, and the finished work lands in every
            collaborator's portfolio.
          </p>
        </div>

        <ol className="sheet mt-14 grid sm:grid-cols-2 lg:grid-cols-4">
          {collaborationShowcase.map((step, i) => (
            <li
              key={step.title}
              className="border-paper-rule p-6 not-last:border-b-[1.5px] sm:[&:nth-child(odd)]:border-r-[1.5px] lg:border-b-0 lg:not-last:border-r-[1.5px]"
            >
              <h3 className="flex items-center gap-3 border-b-2 border-paper-ink pb-3 font-display text-3xl leading-none uppercase">
                <span aria-hidden="true" className={`size-3.5 shrink-0 rounded-full ${caps[i]}`} />
                <span className="font-code text-sm text-paper-ink/60">{i + 1}</span>
                {step.title}
              </h3>
              <p className="mt-4 text-paper-ink/80">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
