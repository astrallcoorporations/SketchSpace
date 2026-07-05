import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'

/**
 * Temporary stub — proves the protected-route + session flow end to end.
 * The real dashboard shell (sidebar, topbar, onboarding empty state) is a
 * separate phase; do not build it out here.
 */
export default function AppPage() {
  const { user } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm text-muted-foreground">Signed in as</p>
      <h1 className="font-display text-2xl font-medium">{user?.email}</h1>
      <Button variant="outline" onClick={() => signOut()}>
        Sign out
      </Button>
    </main>
  )
}
