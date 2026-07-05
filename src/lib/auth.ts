import { supabase } from '@/lib/supabase'

const redirectOrigin = () => window.location.origin

export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signUpWithPassword(email: string, password: string, name: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${redirectOrigin()}/app`,
    },
  })
}

export function signInWithOAuth(provider: 'google' | 'github') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${redirectOrigin()}/app` },
  })
}

export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectOrigin()}/reset-password`,
  })
}

export function updatePassword(password: string) {
  return supabase.auth.updateUser({ password })
}

export function signOut() {
  return supabase.auth.signOut()
}
