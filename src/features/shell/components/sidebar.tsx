import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Wordmark } from '@/components/shared/wordmark'
import { navItems } from '@/features/shell/nav-items'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

/**
 * The marker rack. The page you are on gets the one live edge: its cap fills
 * magenta. Nothing else in the rack wears the accent.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" className="self-start rounded-sm px-2" aria-label="SketchSpace studio">
        <Wordmark />
      </NavLink>

      <nav aria-label="App" className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-full border-2 border-transparent py-2 pr-3 pl-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground',
                isActive && 'border-sidebar-border bg-sidebar-accent text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2.5 rounded-full transition-colors',
                    isActive ? 'bg-ink-magenta-light' : 'bg-transparent group-hover:bg-pass-v1',
                  )}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t-2 border-sidebar-border px-1 pt-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-input bg-pass-v3 font-display text-base uppercase">
          {user?.email?.[0] ?? '?'}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{user?.email}</p>
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => signOut()}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 border-r-2 border-sidebar-border bg-sidebar p-4 lg:flex">
      <SidebarNav />
    </aside>
  )
}
