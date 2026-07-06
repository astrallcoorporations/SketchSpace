import { Link } from 'react-router-dom'
import { Code2, Send, Camera } from 'lucide-react'
import { Magnetic } from '@/components/motion/magnetic'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Community quests', href: '/community' },
      { label: 'Portfolio builder', href: '#' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '#' },
      { label: 'Guidelines', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
] as const

const socials = [
  { icon: Code2, label: 'GitHub' },
  { icon: Send, label: 'Twitter' },
  { icon: Camera, label: 'Instagram' },
] as const

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-xl font-medium">SketchSpace</p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The home where artists improve together.
            </p>
            <form
              className="mt-6 flex max-w-sm gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input type="email" placeholder="you@example.com" aria-label="Email address" />
              <Button type="submit" variant="brand" className="shrink-0">
                Notify me
              </Button>
            </form>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) =>
                  link.href === '#' ? (
                    <li key={link.label}>
                      <span className="text-sm text-muted-foreground/60">{link.label}</span>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SketchSpace. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, label }) => (
              <Magnetic key={label} strength={10}>
                <a
                  href="#"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <Icon className="size-4" />
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
