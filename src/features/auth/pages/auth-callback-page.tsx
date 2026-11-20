import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, MailWarning } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { Seo } from '@/components/shared/seo'
import { useAuth } from '@/hooks/use-auth'
import { useResendCooldown } from '@/hooks/use-resend-cooldown'
import { resendConfirmationEmail } from '@/lib/auth'
import { describeAuthError } from '@/lib/auth-errors'
import { supabase, urlAuthError } from '@/lib/supabase'

/** How long to wait for Supabase to turn the link into a session before calling it failed. */
const SESSION_WAIT_MS = 10_000

/**
 * Single landing spot for email confirmation, resend links and OAuth (Google/GitHub).
 * Success: the session appears and the person goes straight to the studio.
 * Failure (expired / already-used link): say so plainly and offer a fresh email.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const { remaining, start, cooling } = useResendCooldown()

  // PKCE-style links arrive as ?code=... so exchange it. (Implicit links are handled by supabase-js itself.)
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) void supabase.auth.exchangeCodeForSession(code).catch(() => setTimedOut(true))
  }, [])

  useEffect(() => {
    if (!loading && session) navigate('/studio', { replace: true })
  }, [loading, session, navigate])

  useEffect(() => {
    if (urlAuthError) return
    const id = window.setTimeout(() => setTimedOut(true), SESSION_WAIT_MS)
    return () => window.clearTimeout(id)
  }, [])

  const failed = Boolean(urlAuthError) || timedOut

  async function handleResend(event: FormEvent) {
    event.preventDefault()
    if (!email.trim() || cooling) return
    setSending(true)
    try {
      const { error } = await resendConfirmationEmail(email.trim())
      if (error) {
        toast.error(describeAuthError(error).message)
        return
      }
      start()
      toast.success('New link sent. Use the newest email.')
    } catch (err) {
      toast.error(describeAuthError(err).message)
    } finally {
      setSending(false)
    }
  }

  const expired =
    urlAuthError?.code === 'otp_expired' || /expired|invalid/i.test(urlAuthError?.description ?? '')

  return (
    <AuthLayout
      eyebrow="One moment"
      title={failed ? 'That link did not work' : 'Signing you in'}
      visualCopy="Every piece keeps its history. Come see how far you've come."
    >
      <Seo title="Signing in" canonical="/auth/callback" />
      {failed ? (
        <div className="space-y-5" role="alert">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <MailWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {expired
                ? 'This link expired or was already used. Links work once and last about an hour.'
                : (urlAuthError?.description ?? 'We could not finish signing you in.')}
            </span>
          </div>

          <form onSubmit={handleResend} className="space-y-3">
            <Label htmlFor="resend-email">Send me a new confirmation email</Label>
            <Input
              id="resend-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="brand" className="w-full" disabled={sending || cooling}>
              {sending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {cooling ? `Resend available in ${remaining}s` : 'Send new link'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already confirmed?{' '}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Confirming your account…
        </div>
      )}
    </AuthLayout>
  )
}
