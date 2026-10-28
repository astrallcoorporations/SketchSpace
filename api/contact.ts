/**
 * POST /api/contact — sends a contact-form message through Resend.
 *
 * Runs on Vercel, server-side only. Configure in Vercel → Project → Settings →
 * Environment Variables (never in the client, never committed):
 *   RESEND_API_KEY  the Resend API key
 *   CONTACT_TO      inbox that receives messages
 *   CONTACT_FROM    verified sender, e.g. "SketchSpace <contact@your-domain>"
 *                   (until a domain is verified in Resend, "onboarding@resend.dev"
 *                   only delivers to the Resend account's own address)
 */

type Body = { name?: unknown; email?: unknown; subject?: unknown; message?: unknown; company?: unknown }

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function field(v: unknown, max: number) {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  const from = process.env.CONTACT_FROM ?? 'SketchSpace <onboarding@resend.dev>'
  if (!key || !to) {
    return Response.json({ error: 'Contact form is not configured yet.' }, { status: 503 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return Response.json({ error: 'Send the form as JSON.' }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill the "company" field.
  if (field(body.company, 200)) return Response.json({ ok: true })

  const name = field(body.name, LIMITS.name)
  const email = field(body.email, LIMITS.email)
  const subject = field(body.subject, LIMITS.subject)
  const message = field(body.message, LIMITS.message)
  if (!name || !subject || !message) {
    return Response.json({ error: 'Name, subject and message are all needed.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `[SketchSpace contact] ${subject}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p><p>— ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
    }),
  })

  if (!res.ok) {
    return Response.json({ error: 'The message could not be sent right now.' }, { status: 502 })
  }
  return Response.json({ ok: true })
}
