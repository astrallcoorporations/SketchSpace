import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { FormField } from '@/features/auth/components/form-field'
import { PasswordInput } from '@/features/auth/components/password-input'
import { PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { inboxUrl, validateEmail, validateName, validatePassword } from '@/features/auth/lib/validation'
import { Turnstile } from '@/components/shared/turnstile'
import { Seo } from '@/components/shared/seo'
import { useAuth } from '@/hooks/use-auth'
import { useResendCooldown } from '@/hooks/use-resend-cooldown'
import { resendConfirmationEmail, signUpWithPassword } from '@/lib/auth'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

type Field = 'name' | 'email' | 'password'

export function SignupPage() {
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()
  const { remaining, start, cooling } = useResendCooldown()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)
  const [resending, setResending] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
  }

  if (!authLoading && session && status !== 'success') return <Navigate to="/" replace />

  const errors: Record<Field, string | undefined> = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  }
  const shown = (field: Field) => (touched[field] ? errors[field] : undefined)
  const touch = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const firstInvalid = (['name', 'email', 'password'] as const).find((f) => errors[f])
    if (firstInvalid) {
      setTouched({ name: true, email: true, password: true })
      refs[firstInvalid].current?.focus()
      return
    }

    setStatus('loading')
    try {
      const { data, error: signUpError } = await signUpWithPassword(
        email.trim(),
        password,
        name.trim(),
        captchaToken ?? undefined,
      )

      if (signUpError) {
        setError(describeAuthError(signUpError))
        setStatus('idle')
        return
      }

      // Supabase hides "already registered" behind a fake success: the user comes back with no identities.
      if (data.user && data.user.identities?.length === 0) {
        setError({
          kind: 'supabase',
          message: 'An account with this email already exists. Try signing in instead.',
        })
        setStatus('idle')
        return
      }

      if (data.session) {
        navigate('/', { replace: true })
        return
      }

      start()
      setStatus('success')
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  async function handleResendEmail() {
    setResending(true)
    try {
      const { error: resendError } = await resendConfirmationEmail(email.trim())
      if (resendError) {
        toast.error(describeAuthError(resendError).message)
        return
      }
      start()
      toast.success('Confirmation email sent. Use the newest one.')
    } catch (err) {
      toast.error(describeAuthError(err).message)
    } finally {
      setResending(false)
    }
  }

  const inbox = inboxUrl(email)

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      visualCopy="A creative operating system, not another feed to scroll."
    >
      <Seo title="Create account" canonical="/signup" />
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4 py-6 text-center"
            role="status"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
              <MailCheck className="size-6" />
            </div>
            <h2 className="text-lg font-medium">Check your inbox</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              We sent a confirmation link to <span className="break-all text-foreground">{email.trim()}</span>.
              Open it on this device to finish setting up. It works once and lasts about an hour.
            </p>
            {inbox && (
              <Button asChild variant="brand" size="sm">
                <a href={inbox.href} target="_blank" rel="noopener noreferrer">
                  {inbox.label}
                  <ExternalLink className="ml-2 size-3.5" aria-hidden="true" />
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={resending || cooling}
              onClick={handleResendEmail}
            >
              {resending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {cooling ? `Resend available in ${remaining}s` : 'Resend confirmation email'}
            </Button>
            <p className="max-w-xs text-xs text-muted-foreground">
              Nothing after a minute? Check spam.{' '}
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="text-foreground underline underline-offset-4"
              >
                Wrong email? Change it
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <OAuthButtons onError={setError} />

            <div className="relative text-center text-xs text-muted-foreground">
              <span className="relative z-10 bg-background px-3">or continue with email</span>
              <div className="absolute inset-x-0 top-1/2 border-t border-border" />
            </div>

            {error && <AuthErrorAlert error={error} />}

            <FormField
              ref={refs.name}
              label="Name"
              autoComplete="name"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={touch('name')}
              error={shown('name')}
            />

            <FormField
              ref={refs.email}
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={touch('email')}
              error={shown('email')}
            />

            <div className="space-y-3">
              <PasswordInput
                ref={refs.password}
                label="Password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={touch('password')}
                error={shown('password')}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            {TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
              />
            )}

            <Button
              type="submit"
              variant="brand"
              className="w-full"
              aria-busy={status === 'loading'}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {status === 'loading' ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By continuing you agree to SketchSpace's Terms and Privacy Policy.
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
