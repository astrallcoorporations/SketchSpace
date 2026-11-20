/**
 * POST /api/payments/order - creates a Razorpay order for ONE extra project slot (INR 5) for the
 * signed-in user. Creating an order grants nothing: the slot is granted only when the signed
 * Razorpay webhook (api/payments/webhook.ts) confirms the payment.
 *
 * Auth: `Authorization: Bearer <Supabase access token>`.
 */
import { CURRENCY, SLOT_PRICE_PAISE, notConfigured, readEnv, serviceHeaders, userFromToken } from '../_lib/payments'

export async function POST(request: Request) {
  const env = readEnv()
  if (!env) return notConfigured()

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  const user = token ? await userFromToken(env, token) : null
  if (!user) return Response.json({ error: 'Sign in to buy a project slot.' }, { status: 401 })

  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.keyId}:${env.keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: SLOT_PRICE_PAISE,
      currency: CURRENCY,
      receipt: `slot_${Date.now().toString(36)}`,
      notes: { user_id: user.id, purpose: 'project_slot' },
    }),
  })
  if (!orderRes.ok) return Response.json({ error: 'The payment could not be started right now.' }, { status: 502 })
  const order = (await orderRes.json()) as { id?: string }
  if (!order.id) return Response.json({ error: 'The payment could not be started right now.' }, { status: 502 })

  // Record the pending order so the webhook can match it to this user and amount.
  const saved = await fetch(`${env.supabaseUrl}/rest/v1/payments`, {
    method: 'POST',
    headers: { ...serviceHeaders(env), Prefer: 'return=minimal' },
    body: JSON.stringify({
      user_id: user.id,
      provider: 'razorpay',
      provider_order_id: order.id,
      amount_paise: SLOT_PRICE_PAISE,
      currency: CURRENCY,
    }),
  })
  if (!saved.ok) return Response.json({ error: 'The payment could not be started right now.' }, { status: 502 })

  return Response.json({ orderId: order.id, amount: SLOT_PRICE_PAISE, currency: CURRENCY })
}
