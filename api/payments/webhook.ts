/**
 * POST /api/payments/webhook - Razorpay webhook. Register this URL in the Razorpay dashboard
 * (Settings -> Webhooks) with the events `payment.captured` and `order.paid`, and put the secret
 * you choose there into RAZORPAY_WEBHOOK_SECRET.
 *
 * The request is trusted only if its X-Razorpay-Signature matches HMAC-SHA256(rawBody, secret).
 * A verified payment is then settled by public.fulfill_payment, which is idempotent, checks the
 * amount against the order we created, and is executable by the service role only.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'
import { notConfigured, readEnv, serviceHeaders } from '../_lib/payments'

type PaymentEntity = { id?: string; order_id?: string; amount?: number; currency?: string; status?: string }
type WebhookEvent = {
  event?: string
  payload?: { payment?: { entity?: PaymentEntity } }
}

function validSignature(body: string, signature: string, secret: string) {
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const env = readEnv()
  if (!env) return notConfigured()

  // Must be the exact raw bytes Razorpay signed, so read text before any JSON parsing.
  const raw = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  if (!signature || !validSignature(raw, signature, env.webhookSecret)) {
    return Response.json({ error: 'Bad signature.' }, { status: 400 })
  }

  let event: WebhookEvent
  try {
    event = JSON.parse(raw) as WebhookEvent
  } catch {
    return Response.json({ error: 'Bad payload.' }, { status: 400 })
  }

  if (event.event !== 'payment.captured' && event.event !== 'order.paid') {
    return Response.json({ ok: true, ignored: event.event ?? 'unknown' })
  }

  const payment = event.payload?.payment?.entity
  if (!payment?.id || !payment.order_id || typeof payment.amount !== 'number' || payment.currency !== 'INR') {
    return Response.json({ ok: true, ignored: 'incomplete payment' })
  }
  if (payment.status && payment.status !== 'captured') {
    return Response.json({ ok: true, ignored: `status ${payment.status}` })
  }

  const res = await fetch(`${env.supabaseUrl}/rest/v1/rpc/fulfill_payment`, {
    method: 'POST',
    headers: serviceHeaders(env),
    body: JSON.stringify({
      p_order_id: payment.order_id,
      p_payment_id: payment.id,
      p_amount_paise: payment.amount,
    }),
  })
  // A database failure is worth a retry from Razorpay; an unknown order or amount mismatch is not.
  if (!res.ok) return Response.json({ error: 'Could not record the payment.' }, { status: 500 })
  const granted = (await res.json()) as boolean
  return Response.json({ ok: true, granted })
}
