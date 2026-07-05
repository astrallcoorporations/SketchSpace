import { createClient } from '@supabase/supabase-js'

// Generic types arrive in Phase 4 via:
//   supabase gen types typescript --project-id <id> > src/types/database.ts
// import type { Database } from '@/types/database'

const url = import.meta.env.VITE_SUPABASE_URL
// Supabase renamed the client-safe key from "anon key" to "publishable key" —
// accept either so .env files created from either era of the dashboard work.
const anonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(url && anonKey)

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
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-key',
  {
    auth: { storage: rememberAwareStorage, persistSession: true, autoRefreshToken: true },
  },
)
