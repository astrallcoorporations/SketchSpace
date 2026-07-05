import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Magnetic } from '@/components/motion/magnetic'
import { Button } from '@/components/ui/button'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Community', href: '#community' },
  { label: 'Pricing', href: '#pricing' },
] as const

export function SiteHeader() {
  const { scrollY } = useScroll()
  const background = useTransform(
    scrollY,
    [0, 80],
    ['rgba(255,255,255,0)', 'var(--background)'],
  )
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <motion.header
      style={{ background }}
      className="fixed inset-x-0 top-0 z-50 border-b"
    >
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-0 -z-10 border-b border-border"
      />
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Magnetic strength={8}>
          <Link to="/" className="font-display text-lg font-medium">
            SketchSpace
          </Link>
        </Magnetic>

        <div className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Magnetic strength={6}>
            <Button asChild variant="brand" size="sm">
              <Link to="/signup">Get started</Link>
            </Button>
          </Magnetic>
        </div>
      </nav>
    </motion.header>
  )
}
