import { supabase } from '@/lib/supabase'

const redirectOrigin = () => window.location.origin

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
      emailRedirectTo: `${redirectOrigin()}/login`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  })
}

export function signInWithOAuth(provider: 'google' | 'github') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${redirectOrigin()}/studio` },
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

export function resendConfirmationEmail(email: string) {
  return supabase.auth.resend({ type: 'signup', email })
}

export function signOut() {
  return supabase.auth.signOut()
}
