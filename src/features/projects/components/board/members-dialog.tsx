import { useEffect, useRef, useState } from 'react'
import { Loader2, Search, UserMinus, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { searchProfiles } from '@/features/projects/api'
import type { MemberProfile } from '@/features/projects/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MemberProfile[]
  ownerId: string
  currentUserId: string
  onAdd: (profile: MemberProfile) => Promise<void>
  onRemove: (userId: string) => Promise<void>
}

function PersonAvatar({ person }: { person: MemberProfile }) {
  const name = person.display_name || person.username
  return (
    <Avatar>
      {person.avatar_url && <AvatarImage src={person.avatar_url} alt="" />}
      <AvatarFallback className="text-xs">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function MembersDialog({ open, onOpenChange, members, ownerId, currentUserId, onAdd, onRemove }: Props) {
  const isOwner = ownerId === currentUserId
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MemberProfile[]>([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Debounced search; a late response from an older query is ignored.
  useEffect(() => {
    if (!isOwner) return
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const id = ++requestId.current
    const timer = window.setTimeout(() => {
      searchProfiles(q, members.map((m) => m.id))
        .then((found) => {
          if (id === requestId.current) setResults(found)
        })
        .catch(() => {
          if (id === requestId.current) toast.error('Search failed. Try again.')
        })
        .finally(() => {
          if (id === requestId.current) setSearching(false)
        })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query, members, isOwner])

  async function add(person: MemberProfile) {
    setBusyId(person.id)
    try {
      await onAdd(person)
      setResults((r) => r.filter((p) => p.id !== person.id))
      toast.success(`${person.display_name || person.username} was added. They get a notification.`)
    } catch {
      toast.error(`Could not add ${person.display_name || person.username}.`)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(person: MemberProfile) {
    const leaving = person.id === currentUserId
    setBusyId(person.id)
    try {
      await onRemove(person.id)
      toast.success(leaving ? 'You left the project.' : `${person.display_name || person.username} was removed.`)
      if (leaving) window.location.assign('/projects')
    } catch {
      toast.error(leaving ? 'Could not leave the project.' : `Could not remove ${person.display_name || person.username}.`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>People on this project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? 'Search by username or name to add someone. They can then see the board and take tasks.'
              : 'Everyone here can see the board and take tasks.'}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find people by username"
                aria-label="Find people to add by username or name"
                className="pl-9"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              {searching && (
                <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />
              )}
            </div>

            <ul className="space-y-1" aria-live="polite">
              {results.map((person) => (
                <li key={person.id} className="flex items-center gap-3 rounded-md px-2 py-1.5">
                  <PersonAvatar person={person} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{person.display_name || person.username}</p>
                    <p className="truncate font-code text-[0.7rem] text-muted-foreground">@{person.username}</p>
                  </div>
                  <Button size="sm" variant="outline" disabled={busyId === person.id} onClick={() => add(person)}>
                    {busyId === person.id ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                    Add
                  </Button>
                </li>
              ))}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <li className="px-2 py-2 text-sm text-muted-foreground">
                  No one found for "{query.trim()}". They need an account first. Share the site link so they can sign up.
                </li>
              )}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-1 font-code text-[0.7rem] text-muted-foreground">{members.length} on the project</h3>
          <ul className="space-y-1">
            {members.map((person) => {
              const isProjectOwner = person.id === ownerId
              const isMe = person.id === currentUserId
              const canRemove = !isProjectOwner && (isOwner || isMe)
              return (
                <li key={person.id} className="flex items-center gap-3 rounded-md px-2 py-1.5">
                  <PersonAvatar person={person} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {person.display_name || person.username}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-muted-foreground">you</span>}
                    </p>
                    <p className="truncate font-code text-[0.7rem] text-muted-foreground">
                      @{person.username} · {isProjectOwner ? 'owner' : 'member'}
                    </p>
                  </div>
                  {canRemove && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === person.id}
                      onClick={() => remove(person)}
                      aria-label={isMe ? 'Leave project' : `Remove ${person.display_name || person.username}`}
                    >
                      {busyId === person.id ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
                      {isMe ? 'Leave' : 'Remove'}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
