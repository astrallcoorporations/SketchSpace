/**
 * GET /api/payments/config - tells the client whether paid project slots can be bought.
 * Returns only the PUBLIC Razorpay key id (safe to expose) and never any secret.
 */
import { readEnv } from '../_lib/payments'

export function GET() {
  const env = readEnv()
  return Response.json(env ? { enabled: true, keyId: env.keyId } : { enabled: false }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
