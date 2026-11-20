import { supabase } from '@/lib/supabase'
import type { ProjectQuota } from './types'

export async function getProjectQuota(): Promise<ProjectQuota> {
  const { data, error } = await supabase.rpc('my_project_quota')
  if (error) throw error
  return data as unknown as ProjectQuota
}

/** "₹5" — whole rupees drop the decimals. */
export function formatInr(paise: number) {
  const rupees = paise / 100
  return `₹${Number.isInteger(rupees) ? rupees : rupees.toFixed(2)}`
}

export type PaymentsConfig = { enabled: boolean; keyId?: string }

/** Asks the server whether Razorpay is configured. Any failure (no /api in dev, 404, bad JSON) means "off". */
export async function getPaymentsConfig(): Promise<PaymentsConfig> {
  try {
    const res = await fetch('/api/payments/config')
    if (!res.ok) return { enabled: false }
    const body = (await res.json()) as Partial<PaymentsConfig>
    return body.enabled && body.keyId ? { enabled: true, keyId: body.keyId } : { enabled: false }
  } catch {
    return { enabled: false }
  }
}

export type CreatedOrder = { orderId: string; amount: number; currency: string }

export async function createSlotOrder(): Promise<CreatedOrder> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Sign in again to continue.')
  const res = await fetch('/api/payments/order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = (await res.json().catch(() => ({}))) as Partial<CreatedOrder> & { error?: string }
  if (!res.ok || !body.orderId) throw new Error(body.error ?? 'Could not start the payment.')
  return body as CreatedOrder
}

type RazorpayHandlerResponse = { razorpay_payment_id: string; razorpay_order_id: string }
type RazorpayInstance = { open: () => void; on: (event: 'payment.failed', cb: () => void) => void }
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance
  }
}

let checkoutScript: Promise<void> | null = null
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve()
  checkoutScript ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement('script')
    el.src = 'https://checkout.razorpay.com/v1/checkout.js'
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => {
      checkoutScript = null
      reject(new Error('Could not load the payment window.'))
    }
    document.head.appendChild(el)
  })
  return checkoutScript
}

/** Opens Razorpay Checkout. Resolves true once the user finishes paying, false if they close it.
 *  Paying does NOT grant the slot: only the signature-verified webhook does. */
export async function openCheckout(keyId: string, order: CreatedOrder): Promise<boolean> {
  await loadCheckout()
  const Razorpay = window.Razorpay
  if (!Razorpay) throw new Error('Could not load the payment window.')
  return new Promise<boolean>((resolve) => {
    const rz = new Razorpay({
      key: keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'SketchSpace',
      description: 'One extra project slot',
      theme: { color: '#c026d3' },
      handler: (_response: RazorpayHandlerResponse) => resolve(true),
      modal: { ondismiss: () => resolve(false) },
    })
    rz.on('payment.failed', () => resolve(false))
    rz.open()
  })
}
