import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Wordmark } from '@/components/shared/wordmark'
import { navGroups, accountItems, type NavItem } from '@/features/shell/nav-items'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

/**
 * The marker rack. The page you are on gets the one live edge: its cap fills
 * magenta. Nothing else in the rack wears the accent.
 */
function NavRow({ label, href, icon: Icon, onNavigate }: NavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={href}
      end={href === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-full border-2 border-transparent py-1.5 pr-3 pl-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-foreground',
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
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <NavLink to="/" className="self-start rounded-sm px-2" aria-label="SketchSpace studio">
        <Wordmark />
      </NavLink>

      <nav aria-label="App" className="mt-8 flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={group.label ?? `top-${i}`} className="flex flex-col gap-0.5">
            {group.label && (
              <p className="px-3 pb-1 font-code text-[0.65rem] tracking-wide text-muted-foreground/60 uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavRow key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}

        <div className="mt-auto flex flex-col gap-0.5 border-t-2 border-sidebar-border pt-4">
          {accountItems.map((item) => (
            <NavRow key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="flex min-w-0 items-center gap-2 border-t-2 border-sidebar-border px-1 pt-4">
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
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 border-r-2 border-sidebar-border bg-sidebar p-4 lg:flex">
      <SidebarNav />
    </aside>
  )
}
