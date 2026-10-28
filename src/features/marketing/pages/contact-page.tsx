import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'

const CONTACT_EMAIL = 'hello@sketchspace.app'

export function ContactPage() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [opened, setOpened] = useState(false)

  // There is no send backend yet, so the form hands the message to the
  // visitor's own email app, ready to send, instead of pretending it went.
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const body = `${message}\n\n— ${name}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setOpened(true)
  }

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
            {opened ? (
              <div className="flex flex-col items-start gap-4" role="status">
                <h2 className="font-display text-4xl leading-[0.9] uppercase">Check your email app</h2>
                <p className="max-w-md text-muted-foreground">
                  Your message is waiting there, addressed to {CONTACT_EMAIL}. Press send in that app to deliver it.
                  If nothing opened, email us directly at the address on the left.
                </p>
                <Button variant="outline" onClick={() => setOpened(false)}>
                  Back to the form
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Your name</Label>
                  <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
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
                <Button type="submit" variant="brand" size="lg" className="w-full">
                  Write it in my email app
                </Button>
                <p className="text-sm text-muted-foreground">Opens your email app with this message ready to send.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
