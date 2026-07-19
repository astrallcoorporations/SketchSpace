import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CheckCheck, Heart, MessageCircle, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import {
  artworkIdOf,
  deleteNotification,
  listNotifications,
  markAllRead,
  markRead,
  type NotificationWithActor,
} from '@/features/notifications/api'

const TYPE_ICONS: Record<string, typeof Bell> = {
  comment: MessageCircle,
  like: Heart,
  follow: UserPlus,
}

const TYPE_LABELS: Record<string, string> = {
  comment: 'commented on your artwork',
  like: 'liked your artwork',
  follow: 'started following you',
}

function relativeTime(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    try {
      setNotifications(await listNotifications(user.id))
    } catch {
      toast.error('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const unreadCount = notifications.filter((n) => !n.read_at).length

  async function handleMarkAllRead() {
    if (!user) return
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })))
    try {
      await markAllRead(user.id)
    } catch {
      toast.error('Failed to mark all read.')
      void load()
    }
  }

  async function handleOpen(notification: NotificationWithActor) {
    if (!notification.read_at) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
      )
      markRead(notification.id).catch(() => undefined)
    }
  }

  async function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await deleteNotification(id)
    } catch {
      toast.error('Failed to delete notification.')
      void load()
    }
  }

  if (!loading && notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="size-6" />}
        title="You're all caught up"
        description="Comments, likes, and new followers will show up here."
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAllRead}>
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          )}
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="mt-8 space-y-2">
          {notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] ?? Bell
            const label = TYPE_LABELS[notification.type] ?? notification.type
            const artworkId = artworkIdOf(notification)
            const actorName =
              notification.actor?.display_name ?? notification.actor?.username ?? 'Someone'
            const href = artworkId
              ? `/artwork/${artworkId}`
              : notification.actor
                ? `/u/${notification.actor.username}`
                : '/notifications'

            return (
              <li key={notification.id}>
                <div
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    notification.read_at
                      ? 'border-border bg-card'
                      : 'border-brand/30 bg-brand-muted/40'
                  }`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <Link
                    to={href}
                    onClick={() => handleOpen(notification)}
                    className="min-w-0 flex-1"
                  >
                    <p className="truncate text-sm">
                      <span className="font-medium">{actorName}</span>{' '}
                      <span className="text-muted-foreground">{label}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {relativeTime(notification.created_at)}
                    </p>
                  </Link>
                  {!notification.read_at && (
                    <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete notification"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    onClick={() => handleDelete(notification.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
