/**
 * Shared server-side helpers for the project-slot payments (Razorpay, INR).
 * Server only: this folder is prefixed with "_" so Vercel does not expose it as a route.
 *
 * Environment variables (Vercel -> Project -> Settings -> Environment Variables; never in client code):
 *   RAZORPAY_KEY_ID           Razorpay API key id (rzp_test_... / rzp_live_...)
 *   RAZORPAY_KEY_SECRET       Razorpay API key secret
 *   RAZORPAY_WEBHOOK_SECRET   secret you set when creating the webhook in the Razorpay dashboard
 *   SUPABASE_URL              project URL (falls back to VITE_SUPABASE_URL)
 *   SUPABASE_ANON_KEY         publishable key, used to verify the caller's session
 *                             (falls back to VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_ANON_KEY)
 *   SUPABASE_SERVICE_ROLE_KEY service-role key: the ONLY credential able to record a payment and grant a slot
 *
 * Payments are "off" until every one of these is set. Nothing here ever marks a payment as paid
 * except the signature-verified webhook calling the database function public.fulfill_payment.
 */

/** Price of one extra project slot. Mirrors private.project_price_paise() in the database. */
export const SLOT_PRICE_PAISE = 500
export const CURRENCY = 'INR'

export type PaymentsEnv = {
  keyId: string
  keySecret: string
  webhookSecret: string
  supabaseUrl: string
  anonKey: string
  serviceKey: string
}

export function readEnv(): PaymentsEnv | null {
  const env = process.env
  const keyId = env.RAZORPAY_KEY_ID
  const keySecret = env.RAZORPAY_KEY_SECRET
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET
  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const anonKey = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!keyId || !keySecret || !webhookSecret || !supabaseUrl || !anonKey || !serviceKey) return null
  return { keyId, keySecret, webhookSecret, supabaseUrl: supabaseUrl.replace(/\/$/, ''), anonKey, serviceKey }
}

export function notConfigured() {
  return Response.json({ error: 'Payments are not set up yet.' }, { status: 503 })
}

/** Resolves the signed-in user from a Supabase access token, or null. */
export async function userFromToken(env: PaymentsEnv, token: string): Promise<{ id: string } | null> {
  const res = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.anonKey },
  })
  if (!res.ok) return null
  const user = (await res.json()) as { id?: string }
  return user.id ? { id: user.id } : null
}

export function serviceHeaders(env: PaymentsEnv) {
  return {
    apikey: env.serviceKey,
    Authorization: `Bearer ${env.serviceKey}`,
    'Content-Type': 'application/json',
  }
}
