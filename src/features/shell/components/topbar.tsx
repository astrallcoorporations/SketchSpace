import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarNav } from '@/features/shell/components/sidebar'
import { UploadDialog } from '@/features/artwork/components/upload-dialog'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'
import { getUnreadCount } from '@/features/notifications/api'

export function Topbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Refresh on route change so the badge clears after visiting /notifications.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    getUnreadCount(user.id)
      .then((count) => {
        if (!cancelled) setUnreadCount(count)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [user, location.pathname])

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    const term = query.trim()
    navigate(term ? `/portfolio?q=${encodeURIComponent(term)}` : '/portfolio')
  }

  return (
    <header className="flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3 lg:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <SheetContent side="left" className="w-64 p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <form onSubmit={handleSearchSubmit} className="relative max-w-sm flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your artwork…"
          aria-label="Search"
          className="pl-9 input-focus-glow"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="brand" size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          <span className="hidden sm:inline">Quick upload</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
          onClick={() => navigate('/notifications')}
          className="relative transition-colors duration-200"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] leading-4 font-medium text-brand-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex size-8 items-center justify-center rounded-full bg-brand-muted text-xs font-medium text-brand-muted-foreground outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="truncate px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => signOut()}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => navigate('/portfolio')}
      />
    </header>
  )
}
