import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { AuthErrorAlert } from '@/features/auth/components/auth-error-alert'
import { PasswordInput } from '@/features/auth/components/password-input'
import { PasswordStrengthMeter } from '@/features/auth/components/password-strength-meter'
import { updatePassword } from '@/lib/auth'
import { getPasswordStrength } from '@/lib/password-strength'
import { useAuth } from '@/hooks/use-auth'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { session, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState<AuthErrorDescription | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (getPasswordStrength(password).score < 1) {
      setError({ kind: 'weak-password', message: 'Use at least 8 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setError({ kind: 'weak-password', message: 'Passwords do not match.' })
      return
    }

    setStatus('loading')
    try {
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        setError(describeAuthError(updateError))
        setStatus('idle')
        return
      }

      navigate('/', { replace: true })
    } catch (err) {
      setError(describeAuthError(err))
      setStatus('idle')
    }
  }

  const linkInvalid = !loading && !session

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Choose a new password"
      visualCopy="One more step and you're back to work."
    >
      {linkInvalid ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>This reset link is invalid or has expired.</span>
          </div>
          <Link to="/forgot-password" className="text-foreground underline underline-offset-4">
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && <AuthErrorAlert error={error} />}

          <div className="space-y-3">
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" variant="brand" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
