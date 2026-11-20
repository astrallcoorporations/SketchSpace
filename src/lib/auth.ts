import { supabase } from '@/lib/supabase'

const redirectOrigin = () => window.location.origin

/** Every email link and OAuth round-trip lands here, so verification behaves the same
 *  whether it came from signup, a resend, or Google. */
const callbackUrl = () => `${redirectOrigin()}/auth/callback`

export function signInWithPassword(email: string, password: string, captchaToken?: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  })
}

export function signUpWithPassword(
  email: string,
  password: string,
  name: string,
  captchaToken?: string,
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: callbackUrl(),
      ...(captchaToken ? { captchaToken } : {}),
    },
  })
}

export function signInWithOAuth(provider: 'google' | 'github') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl(),
      // Google only returns a refresh-capable, account-chooser flow when asked.
      queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
    },
  })
}

export function sendPasswordReset(email: string, captchaToken?: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectOrigin()}/reset-password`,
    captchaToken,
  })
}

export function updatePassword(password: string) {
  return supabase.auth.updateUser({ password })
}

export function resendConfirmationEmail(email: string, captchaToken?: string) {
  return supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: callbackUrl(), ...(captchaToken ? { captchaToken } : {}) },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}
