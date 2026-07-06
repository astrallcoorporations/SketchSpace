import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signInWithOAuth } from '@/lib/auth'
import { describeAuthError, type AuthErrorDescription } from '@/lib/auth-errors'
import { GoogleIcon, GithubMarkIcon } from './provider-icons'

export function OAuthButtons({ onError }: { onError: (error: AuthErrorDescription) => void }) {
  const [pending, setPending] = useState<'google' | 'github' | null>(null)

  async function handleClick(provider: 'google' | 'github') {
    setPending(provider)
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        onError(describeAuthError(error))
        setPending(null)
      }
      // On success the browser redirects away — no need to reset state.
    } catch (err) {
      onError(describeAuthError(err))
      setPending(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={pending !== null}
        onClick={() => handleClick('google')}
      >
        <GoogleIcon className={pending === 'google' ? 'animate-pulse' : undefined} />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={pending !== null}
        onClick={() => handleClick('github')}
      >
        <GithubMarkIcon className={pending === 'github' ? 'animate-pulse' : undefined} />
        GitHub
      </Button>
    </div>
  )
}
