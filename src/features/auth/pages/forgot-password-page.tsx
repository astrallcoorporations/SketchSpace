import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { Turnstile } from '@/components/shared/turnstile'
import { Seo } from '@/components/shared/seo'
import { sendPasswordReset } from '@/lib/auth'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setStatus('loading')

    try {
      const { error: resetError } = await sendPasswordReset(email, captchaToken ?? undefined)

      if (resetError) {
        setError(describeAuthError(resetError))
        setStatus('idle')
        return
      }

      setStatus('sent')
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      visualCopy="Locked out happens. Your work is still exactly where you left it."
    >
      <Seo title="Reset password" canonical="/forgot-password" />
      <AnimatePresence mode="wait">
        {status === 'sent' ? (
          <motion.div
            key="sent"
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
              If an account exists for <span className="text-foreground">{email}</span>, a reset
              link is on its way.
            </p>
            <Link to="/login" className="text-sm text-foreground underline underline-offset-4">
              Back to sign in
            </Link>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate className="space-y-5">
            {error && <AuthErrorAlert error={error} />}

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

            {TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
              />
            )}

            <Button type="submit" variant="brand" className="w-full" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending link…' : 'Send reset link'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remembered it?{' '}
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
