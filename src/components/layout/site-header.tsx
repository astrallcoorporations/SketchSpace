import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from '@/components/motion/magnetic'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Community', href: '/community' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
] as const

export function SiteHeader() {
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const { session, loading } = useAuth()

  return (
    <motion.header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 -z-10 bg-background backdrop-blur-sm"
      />
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-0 -z-10 border-b border-border"
      />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Magnetic strength={8}>
          <Link to="/" className="font-display text-lg font-medium transition-opacity duration-200 hover:opacity-80">
            SketchSpace
          </Link>
        </Magnetic>

        <div className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="relative text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground nav-link-hover"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!loading && (
            session ? (
              <Magnetic strength={6}>
                  <Button asChild variant="brand" size="sm">
                    <Link to="/studio">Open Studio</Link>
                  </Button>
              </Magnetic>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="transition-colors duration-200">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Magnetic strength={6}>
                  <Button asChild variant="brand" size="sm">
                    <Link to="/signup">Get started</Link>
                  </Button>
                </Magnetic>
              </>
            )
          )}
        </div>
      </nav>
    </motion.header>
  )
}
