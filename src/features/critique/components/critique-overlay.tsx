import { useState, type MouseEvent } from 'react'
import { MapPin, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { UseCritique } from '@/features/critique/use-critique'

/**
 * Pin layer for the artwork image: render this inside the same `relative`
 * wrapper as the cover image. In pin mode, clicking the image drops a
 * numbered marker and opens an inline composer anchored to that exact spot.
 */
export function CritiqueOverlay({
  critique,
  currentUserId,
  pinMode,
  onPinModeChange,
  activeThread,
  onActiveThreadChange,
}: {
  critique: UseCritique
  currentUserId: string | undefined
  pinMode: boolean
  onPinModeChange: (on: boolean) => void
  activeThread: string | null
  onActiveThreadChange: (id: string | null) => void
}) {
  const [pendingAnchor, setPendingAnchor] = useState<{ x: number; y: number } | null>(null)
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (!pinMode || !currentUserId) return
    const rect = e.currentTarget.getBoundingClientRect()
    setPendingAnchor({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height })
    setDraft('')
  }

  async function submit() {
    if (!currentUserId || !pendingAnchor || !draft.trim()) return
    setBusy(true)
    try {
      await critique.post({ authorId: currentUserId, body: draft.trim(), anchorX: pendingAnchor.x, anchorY: pendingAnchor.y })
      setDraft('')
      setPendingAnchor(null)
      onPinModeChange(false)
      toast.success('Critique left on that spot.')
    } catch {
      toast.error('Could not post that comment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn('pointer-events-none absolute inset-0', pinMode && 'pointer-events-auto cursor-crosshair')}
    >
      {critique.pinned.map((t, i) => (
        <button
          key={t.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onActiveThreadChange(t.id)
            document.getElementById(`critique-${t.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          style={{ left: `${(t.anchor_x ?? 0) * 100}%`, top: `${(t.anchor_y ?? 0) * 100}%` }}
          className={cn(
            'pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-ink-magenta font-code text-[0.65rem] font-medium text-white shadow-[0_0_0_2px_var(--ink-magenta-light)] transition-transform hover:scale-110',
            activeThread === t.id && 'ring-2 ring-ink-magenta-light ring-offset-2 ring-offset-background',
          )}
          aria-label={`Open critique: ${t.body.slice(0, 40)}`}
        >
          {i + 1}
        </button>
      ))}

      {pendingAnchor && (
        <div
          style={{ left: `${pendingAnchor.x * 100}%`, top: `${pendingAnchor.y * 100}%` }}
          className="pointer-events-auto absolute z-10 flex w-56 -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-md border-2 border-ink-magenta-light bg-popover p-3 shadow-[var(--shadow-lg)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-code text-[0.65rem] text-muted-foreground">New critique</span>
            <button type="button" onClick={() => setPendingAnchor(null)} aria-label="Cancel">
              <X className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <Textarea
            autoFocus
            rows={2}
            placeholder="What do you notice here?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button size="sm" variant="brand" disabled={busy || !draft.trim()} onClick={() => void submit()}>
            {busy ? 'Posting…' : 'Post'}
          </Button>
        </div>
      )}

      {pinMode && !pendingAnchor && (
        <div className="pointer-events-none absolute top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-pass-v6/90 px-3 py-1.5 font-code text-[0.65rem] text-foreground">
          <MapPin className="size-3" /> Click the art to pin a spot
        </div>
      )}
    </div>
  )
}
