import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Wordmark } from '@/components/shared/wordmark'

const links = [
  { label: 'Features', href: '/features' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'Log in', href: '/login' },
] as const

export function FooterSection() {
  return (
    <footer className="border-t-2 border-border bg-pass-v6 px-4 pt-20 pb-10 sm:px-8">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-3xl font-display text-5xl leading-[0.9] uppercase sm:text-7xl">
            Start your first swatch.
          </p>
          <Button asChild variant="brand" size="lg">
            <Link to="/signup">Create free account</Link>
          </Button>
        </div>
        <div className="mt-16 flex flex-col gap-6 border-t-2 border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark />
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {links.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SketchSpace</p>
        </div>
      </div>
    </footer>
  )
}
