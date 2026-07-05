import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { navItems } from '@/features/shell/nav-items'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'
import { cn } from '@/lib/utils'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <NavLink to="/" className="px-2 font-display text-lg font-medium">
        SketchSpace
      </NavLink>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/app'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-brand-muted text-brand-muted-foreground hover:bg-brand-muted hover:text-brand-muted-foreground',
              )
            }
          >
            <Icon className="size-4.5" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-border px-2 pt-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-medium text-brand-muted-foreground">
          {user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{user?.email}</p>
        <button
          type="button"
          aria-label="Sign out"
          onClick={() => signOut()}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-background p-4 lg:flex">
      <SidebarNav />
    </aside>
  )
}
