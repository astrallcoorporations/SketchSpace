import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { PasswordInput } from '@/features/auth/components/password-input'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { resendConfirmationEmail, signInWithPassword } from '@/lib/auth'
import { setRememberMe as persistRememberMe } from '@/lib/supabase'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)
  const [resending, setResending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setStatus('loading')
    persistRememberMe(rememberMe)

    try {
      const { error: signInError } = await signInWithPassword(email, password)

      if (signInError) {
        setError(describeAuthError(signInError))
        setStatus('idle')
        return
      }

      const from = (location.state as { from?: string } | null)?.from ?? '/app'
      navigate(from, { replace: true })
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  async function handleResendEmail() {
    if (!email.trim()) {
      toast.error('Enter your email first.')
      return
    }

    setResending(true)
    try {
      const { error: resendError } = await resendConfirmationEmail(email.trim())
      if (resendError) {
        setError(describeAuthError(resendError))
        return
      }
      toast.success('Confirmation email sent.')
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to SketchSpace"
      visualCopy="Every piece keeps its history. Come see how far you've come."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <OAuthButtons onError={setError} />

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="relative z-10 bg-background px-3">or continue with email</span>
          <div className="absolute inset-x-0 top-1/2 border-t border-border" />
        </div>

        {error && <AuthErrorAlert error={error} />}
        {error && error.kind === 'supabase' && error.message.includes('Confirm your email') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={resending}
            onClick={handleResendEmail}
          >
            {resending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Resend confirmation email
          </Button>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-foreground underline underline-offset-4">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="brand" className="w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link to="/signup" className="text-foreground underline underline-offset-4">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
