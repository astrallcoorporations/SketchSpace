import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
// Supabase renamed the client-safe key from "anon key" to "publishable key" —
// accept either so .env files created from either era of the dashboard work.
const anonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(url && anonKey)

/** True once real Supabase env vars are present — false means every auth/data
 *  call is talking to the placeholder client and will never succeed. */
export function isSupabaseConfigured() {
  return isConfigured
}

// Exposed for lib/storage.ts, which talks to the Storage REST API directly
// (via XHR) to get real upload-progress events — the supabase-js client's
// .upload() is a single opaque fetch with no progress callback.
export const SUPABASE_URL = url || 'https://placeholder.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = anonKey || 'placeholder-key'

if (!isConfigured) {
  console.warn(
    '[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — auth and data calls will fail until .env is configured.',
  )
}

const REMEMBER_ME_KEY = 'sketchspace:remember-me'

/** Call before sign-in. `false` keeps the session in sessionStorage only. */
export function setRememberMe(remember: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, String(remember))
}

function activeStorage(): Storage {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'false' ? sessionStorage : localStorage
}

// Backing store is picked per call so "Remember me" can move the session
// between localStorage (persists across browser restarts) and sessionStorage
// (cleared when the tab closes) without swapping out the Supabase client.
const rememberAwareStorage = {
  getItem: (key: string) => activeStorage().getItem(key),
  setItem: (key: string, value: string) => activeStorage().setItem(key, value),
  removeItem: (key: string) => activeStorage().removeItem(key),
}

// createClient throws synchronously on an empty URL — and this module is
// imported at the app root (AuthProvider), so an unconfigured .env must never
// reach it, or the entire app (landing page included) white-screens on load.
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { storage: rememberAwareStorage, persistSession: true, autoRefreshToken: true },
})
