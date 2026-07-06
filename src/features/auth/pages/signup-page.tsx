import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { PasswordInput } from '@/features/auth/components/password-input'
import { PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter'
import { OAuthButtons } from '@/features/auth/components/oauth-buttons'
import { resendConfirmationEmail, signUpWithPassword } from '@/lib/auth'
import { getPasswordStrength } from '@/lib/password-strength'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

export function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)
  const [resending, setResending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (getPasswordStrength(password).score < 1) {
      setError({ kind: 'weak-password', message: 'Use at least 8 characters.' })
      return
    }

    setStatus('loading')
    try {
      const { data, error: signUpError } = await signUpWithPassword(email, password, name)

      if (signUpError) {
        setError(describeAuthError(signUpError))
        setStatus('idle')
        return
      }

      if (data.session) {
        navigate('/app', { replace: true })
        return
      }

      setStatus('success')
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  async function handleResendEmail() {
    if (!email) return
    setResending(true)
    await resendConfirmationEmail(email)
    setResending(false)
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      visualCopy="A creative operating system, not another feed to scroll."
    >
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4 py-6 text-center"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
              <MailCheck className="size-6" />
            </div>
            <h2 className="text-lg font-medium">Check your inbox</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>.
              Follow it to finish setting up your account.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              disabled={resending}
              onClick={handleResendEmail}
            >
              {resending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Resend confirmation email
            </Button>
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

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <div className="space-y-3">
              <PasswordInput
                label="Password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <Button type="submit" variant="brand" className="w-full" disabled={status === 'loading'}>
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
