import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Reply, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { UseCritique } from '@/features/critique/use-critique'
import type { CommentWithAuthor } from '@/features/critique/types'

const relativeTime = (iso: string) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const steps: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.345, 'w'],
    [12, 'mo'],
    [Infinity, 'y'],
  ]
  let value = seconds
  for (const [span, unit] of steps) {
    if (value < span) return `${Math.max(1, Math.floor(value))}${unit}`
    value /= span
  }
  return 'now'
}

function Author({ profile }: { profile: CommentWithAuthor['profiles'] }) {
  const name = profile?.display_name || profile?.username || 'Someone'
  return (
    <Avatar className="size-6">
      {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
      <AvatarFallback className="text-[0.6rem]">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function CritiqueThreadList({
  critique,
  currentUserId,
  pinMode,
  onPinModeChange,
  activeThread,
}: {
  critique: UseCritique
  currentUserId: string | undefined
  pinMode: boolean
  onPinModeChange: (on: boolean) => void
  activeThread: string | null
}) {
  const [draft, setDraft] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitGeneral() {
    if (!currentUserId || !draft.trim()) return
    setBusy(true)
    try {
      await critique.post({ authorId: currentUserId, body: draft.trim() })
      setDraft('')
    } catch {
      toast.error('Could not post that comment.')
    } finally {
      setBusy(false)
    }
  }

  async function submitReply(parentId: string) {
    if (!currentUserId || !replyDraft.trim()) return
    setBusy(true)
    try {
      await critique.post({ authorId: currentUserId, body: replyDraft.trim(), parentId })
      setReplyDraft('')
      setReplyingTo(null)
    } catch {
      toast.error('Could not post that reply.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    try {
      await critique.remove(id)
      toast('Comment deleted.')
    } catch {
      toast.error('Could not delete that comment.')
    }
  }

  const ordered = [...critique.pinned, ...critique.general]

  return (
    <div className="mt-10 border-t-2 border-border pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Critique {critique.threads.length > 0 && `(${critique.threads.length})`}
        </h2>
        {currentUserId && (
          <Button variant={pinMode ? 'brand' : 'outline'} size="sm" className="gap-1.5" onClick={() => onPinModeChange(!pinMode)}>
            <MapPin className="size-3.5" />
            {pinMode ? 'Pinning…' : 'Point at something'}
          </Button>
        )}
      </div>

      {currentUserId && !pinMode && (
        <div className="mt-4 flex gap-3">
          <Textarea rows={2} placeholder="Leave a general comment…" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button variant="brand" disabled={busy || !draft.trim()} onClick={() => void submitGeneral()} className="self-end">
            Post
          </Button>
        </div>
      )}
      {!currentUserId && (
        <p className="mt-4 text-sm text-muted-foreground">
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>{' '}
          to leave critique.
        </p>
      )}

      <div className="mt-6 space-y-5">
        {critique.loading ? (
          <p className="text-sm text-muted-foreground">Loading critique…</p>
        ) : ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No critique yet. Point at something specific, or leave a general note.
          </p>
        ) : (
          ordered.map((thread) => (
            <div
              key={thread.id}
              id={`critique-${thread.id}`}
              className={cn(
                'rounded-md border-2 border-border bg-pass-v4 p-4 transition-colors',
                activeThread === thread.id && 'border-ink-magenta-light',
              )}
            >
              <div className="flex items-start gap-3">
                <Author profile={thread.profiles} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={thread.profiles ? `/u/${thread.profiles.username}` : '#'}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {thread.profiles?.display_name || thread.profiles?.username || 'Someone'}
                    </Link>
                    {thread.anchor_x !== null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-1.5 py-0.5 font-code text-[0.6rem] text-brand-muted-foreground">
                        <MapPin className="size-2.5" /> {critique.pinned.findIndex((p) => p.id === thread.id) + 1}
                      </span>
                    )}
                    <span className="font-code text-[0.65rem] text-muted-foreground">{relativeTime(thread.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm">{thread.body}</p>

                  <div className="mt-2 flex items-center gap-3">
                    {currentUserId && (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
                      >
                        <Reply className="size-3" /> Reply
                      </button>
                    )}
                    {thread.author_id === currentUserId && (
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => void remove(thread.id)}
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    )}
                  </div>

                  {replyingTo === thread.id && (
                    <div className="mt-3 flex gap-2">
                      <Textarea
                        autoFocus
                        rows={1}
                        placeholder="Write a reply…"
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        className="text-sm"
                      />
                      <Button size="sm" variant="brand" disabled={busy || !replyDraft.trim()} onClick={() => void submitReply(thread.id)}>
                        Reply
                      </Button>
                    </div>
                  )}

                  {thread.replies.length > 0 && (
                    <div className="mt-3 space-y-3 border-l-2 border-border pl-3">
                      {thread.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2.5">
                          <Author profile={r.profiles} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-medium">
                                {r.profiles?.display_name || r.profiles?.username || 'Someone'}
                              </span>
                              <span className="font-code text-[0.6rem] text-muted-foreground">{relativeTime(r.created_at)}</span>
                            </div>
                            <p className="mt-0.5 text-sm">{r.body}</p>
                            {r.author_id === currentUserId && (
                              <button
                                type="button"
                                className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => void remove(r.id)}
                              >
                                <Trash2 className="size-3" /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
