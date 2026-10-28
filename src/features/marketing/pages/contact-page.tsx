import { useState, type FormEvent } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'

const CONTACT_EMAIL = 'hello@sketchspace.app'

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot, hidden from people
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus({ kind: 'sending' })
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, company }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error ?? 'The message could not be sent right now.')
      setStatus({ kind: 'sent' })
    } catch (e) {
      setStatus({ kind: 'error', message: e instanceof Error ? e.message : 'The message could not be sent right now.' })
    }
  }

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${message}\n\n— ${name}`)}`

  return (
    <MarketingLayout>
      <Seo
        title="Contact"
        description="Questions about SketchSpace, feedback on a feature, or a partnership idea. Write to the team."
        canonical="/contact"
      />

      <section className="px-4 pt-16 pb-28 sm:px-8 sm:pt-24">
        <div className="mx-auto grid max-w-[88rem] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.86] uppercase">Let's talk.</h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Questions about SketchSpace, feedback on a feature, a bug you hit, or a partnership idea. Write to the
              team.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-8 inline-flex items-center gap-3 text-lg font-semibold text-ink-pink-light hover:underline"
            >
              <Mail className="size-5" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="rounded-md border-2 border-border bg-pass-v4 p-6 sm:p-8">
            {status.kind === 'sent' ? (
              <div className="flex flex-col items-start gap-4" role="status">
                <h2 className="font-display text-4xl leading-[0.9] uppercase">Message sent</h2>
                <p className="max-w-md text-muted-foreground">
                  It's with the team now. Replies go to {email}.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatus({ kind: 'idle' })
                    setSubject('')
                    setMessage('')
                  }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Your name</Label>
                    <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Your email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    id="contact-subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What's it about?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                {/* honeypot: off-screen and skipped by keyboard and screen readers */}
                <div aria-hidden="true" className="absolute -left-[9999px]">
                  <label htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                {status.kind === 'error' && (
                  <p role="alert" className="rounded-md border-2 border-destructive/50 p-3 text-sm">
                    {status.message}{' '}
                    <a href={mailto} className="font-semibold text-ink-pink-light underline">
                      Send it from your email app instead
                    </a>
                    .
                  </p>
                )}

                <Button type="submit" variant="brand" size="lg" className="w-full" disabled={status.kind === 'sending'}>
                  {status.kind === 'sending' ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sending
                    </>
                  ) : (
                    'Send message'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
