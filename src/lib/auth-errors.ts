import {
  isAuthApiError,
  isAuthRetryableFetchError,
  isAuthWeakPasswordError,
} from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase'

export type AuthErrorKind = 'config' | 'network' | 'weak-password' | 'supabase' | 'unknown'

export type AuthErrorDescription = {
  kind: AuthErrorKind
  message: string
}

/** Supabase's own error text is already specific, but a few messages read
 *  better rephrased for someone who isn't debugging the backend. */
const FRIENDLY_OVERRIDES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'User already registered': 'An account with this email already exists — try signing in instead.',
  'Email not confirmed': 'Confirm your email before signing in — check your inbox for the link we sent.',
  'Signups not allowed for this instance': 'New sign-ups are currently disabled for this project.',
  'Email rate limit exceeded': 'Too many attempts with this email. Wait a few minutes and try again.',
}

/**
 * Turns whatever `supabase-js` hands back into one of four *distinct*
 * categories instead of a single generic "something went wrong":
 *
 * - `config`   — the app itself has no valid Supabase URL/key (a deploy/dev-env problem)
 * - `network`  — the request never reached Supabase at all (offline, DNS, an
 *                ad-blocker/firewall, or a genuine CORS rejection — browsers
 *                deliberately expose all of these as the same `TypeError`, so
 *                they cannot be told apart from JS; the copy says so)
 * - `weak-password` — Supabase's own password policy rejected it
 * - `supabase` — the request reached Supabase and it returned a real API error
 */
export function describeAuthError(error: unknown): AuthErrorDescription {
  if (!isSupabaseConfigured()) {
    return {
      kind: 'config',
      message:
        "SketchSpace isn't fully configured — Supabase environment variables are missing. If you're the developer, check your .env file (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY) and restart the dev server.",
    }
  }

  if (isAuthRetryableFetchError(error)) {
    return {
      kind: 'network',
      message:
        "Couldn't reach SketchSpace's servers. Check your internet connection — an ad-blocker, VPN, corporate firewall, or a paused Supabase project can also block this request.",
    }
  }

  if (isAuthWeakPasswordError(error)) {
    return { kind: 'weak-password', message: error.message }
  }

  if (isAuthApiError(error)) {
    return { kind: 'supabase', message: FRIENDLY_OVERRIDES[error.message] ?? error.message }
  }

  if (error instanceof Error) {
    return { kind: 'unknown', message: error.message }
  }

  return { kind: 'unknown', message: 'Something unexpected happened. Please try again.' }
}
