import { useState, type FormEvent } from 'react'
import { Mail, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'
import { Reveal } from '@/components/motion/reveal'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    // Simulate send — in production, wire to Supabase Edge Function or email API
    await new Promise((r) => setTimeout(r, 1200))
    setStatus('sent')
  }

  return (
    <MarketingLayout>
      <Seo
        title="Contact"
        description="Get in touch with the SketchSpace team. Questions, feedback, or partnership inquiries — we'd love to hear from you."
        canonical="/contact"
      />

      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Contact</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-5xl">
            Let's talk
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions, feedback, or partnership inquiries — we'd love to hear from you.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-shadow duration-300 hover:shadow-[var(--shadow-sm)]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground">
                <Mail className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">hello@sketchspace.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-shadow duration-300 hover:shadow-[var(--shadow-sm)]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Response time</p>
                <p className="text-xs text-muted-foreground">Within 24 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition-shadow duration-300 hover:shadow-[var(--shadow-sm)]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground">
                <Send className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Teams plan</p>
                <p className="text-xs text-muted-foreground">Custom pricing</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          {status === 'sent' ? (
            <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-border bg-background p-12 text-center">
              <CheckCircle2 className="size-12 text-brand" />
              <h2 className="font-display text-xl font-medium">Message sent</h2>
              <p className="text-sm text-muted-foreground">
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
              <Button variant="outline" onClick={() => { setStatus('idle'); setName(''); setEmail(''); setSubject(''); setMessage('') }}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 space-y-5 rounded-2xl border border-border bg-background p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-focus-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-focus-glow"
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
                  placeholder="How can we help?"
                  className="input-focus-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  className="input-focus-glow"
                />
              </div>

              <Button type="submit" variant="brand" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send message'
                )}
              </Button>
            </form>
          )}
        </Reveal>
      </section>
    </MarketingLayout>
  )
}
