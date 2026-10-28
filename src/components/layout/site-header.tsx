import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Wordmark } from '@/components/shared/wordmark'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Each route is a marker in the rack; the cap colour is its own.
const navLinks = [
  { label: 'Features', href: '/features', cap: 'bg-ink-pink' },
  { label: 'Community', href: '/community', cap: 'bg-ink-magenta' },
  { label: 'Pricing', href: '/pricing', cap: 'bg-ink-violet' },
  { label: 'Contact', href: '/contact', cap: 'bg-ink-violet-light' },
] as const

function CapLink({ label, href, cap, onNavigate }: (typeof navLinks)[number] & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={href}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'inline-flex h-10 items-center gap-2.5 rounded-full border-2 border-border pr-4 pl-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-input hover:bg-accent',
          isActive && 'border-ink-magenta-light',
        )
      }
    >
      <span aria-hidden="true" className={cn('size-5 rounded-full ring-2 ring-background', cap)} />
      {label}
    </NavLink>
  )
}

export function SiteHeader() {
  const { session, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const actions = !loading && (
    session ? (
      <Button asChild variant="brand">
        <Link to="/studio">Open Studio</Link>
      </Button>
    ) : (
      <>
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/login">Log in</Link>
        </Button>
        <Button asChild variant="brand" className="hidden sm:inline-flex">
          <Link to="/signup">Create free account</Link>
        </Button>
      </>
    )
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b-2 transition-colors duration-300',
        scrolled ? 'border-border bg-background' : 'border-transparent bg-transparent',
      )}
    >
      <nav aria-label="Main" className="mx-auto flex max-w-[88rem] items-center gap-3 px-4 py-3 sm:px-8">
        <Link to="/" className="mr-auto rounded-sm" aria-label="SketchSpace home">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <CapLink key={link.href} {...link} />
          ))}
        </div>

        <div className="flex items-center gap-2 lg:ml-4">{actions}</div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-l-2 bg-pass-v4 p-6">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Wordmark />
            <div className="mt-8 flex flex-col items-start gap-3">
              {navLinks.map((link) => (
                <CapLink key={link.href} {...link} onNavigate={() => setOpen(false)} />
              ))}
              {!loading && !session && (
                <>
                  <Button asChild variant="brand" className="mt-4">
                    <Link to="/signup" onClick={() => setOpen(false)}>
                      Create free account
                    </Link>
                  </Button>
                  <Link to="/login" onClick={() => setOpen(false)} className="mt-2 text-sm text-ink-pink-light underline">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
