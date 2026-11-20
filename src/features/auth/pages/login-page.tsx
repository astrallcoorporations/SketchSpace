import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { FormField } from '@/features/auth/components/form-field'
import { PasswordInput } from '@/features/auth/components/password-input'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { validateEmail } from '@/features/auth/lib/validation'
import { Turnstile } from '@/components/shared/turnstile'
import { Seo } from '@/components/shared/seo'
import { useAuth } from '@/hooks/use-auth'
import { useResendCooldown } from '@/hooks/use-resend-cooldown'
import { resendConfirmationEmail, signInWithPassword } from '@/lib/auth'
import { setRememberMe as persistRememberMe } from '@/lib/supabase'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading: authLoading } = useAuth()
  const { remaining, start, cooling } = useResendCooldown()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)
  const [resending, setResending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'
  if (!authLoading && session) return <Navigate to={from} replace />

  const emailError = validateEmail(email)
  const passwordError = password ? undefined : 'Enter your password.'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (emailError || passwordError) {
      setEmailTouched(true)
      setPasswordTouched(true)
      ;(emailError ? emailRef : passwordRef).current?.focus()
      return
    }

    setStatus('loading')
    persistRememberMe(rememberMe)

    try {
      const { error: signInError } = await signInWithPassword(
        email.trim(),
        password,
        captchaToken ?? undefined,
      )

      if (signInError) {
        setError(describeAuthError(signInError))
        setStatus('idle')
        passwordRef.current?.focus()
        return
      }

      navigate(from, { replace: true })
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  async function handleResendEmail() {
    if (emailError) {
      setEmailTouched(true)
      emailRef.current?.focus()
      return
    }

    setResending(true)
    try {
      const { error: resendError } = await resendConfirmationEmail(email.trim())
      if (resendError) {
        setError(describeAuthError(resendError))
        return
      }
      start()
      toast.success('Confirmation email sent. Use the newest one.')
    } catch (err) {
      setError(describeAuthError(err))
    } finally {
      setResending(false)
    }
  }

  const needsConfirmation =
    error?.kind === 'supabase' && error.message.includes('Confirm your email')

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to SketchSpace"
      visualCopy="Every piece keeps its history. Come see how far you've come."
    >
      <Seo title="Sign in" canonical="/login" />
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <OAuthButtons onError={setError} />

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="relative z-10 bg-background px-3">or continue with email</span>
          <div className="absolute inset-x-0 top-1/2 border-t border-border" />
        </div>

        {error && <AuthErrorAlert error={error} />}
        {needsConfirmation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={resending || cooling}
            onClick={handleResendEmail}
          >
            {resending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {cooling ? `Resend available in ${remaining}s` : 'Resend confirmation email'}
          </Button>
        )}

        <FormField
          ref={emailRef}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          error={emailTouched ? emailError : undefined}
        />

        <PasswordInput
          ref={passwordRef}
          label="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setPasswordTouched(true)}
          error={passwordTouched ? passwordError : undefined}
        />

        {TURNSTILE_SITE_KEY && (
          <Turnstile
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
          />
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-foreground underline underline-offset-4">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="brand"
          className="w-full"
          aria-busy={status === 'loading'}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
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
