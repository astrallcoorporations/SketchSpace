import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Notification = Database['public']['Tables']['notifications']['Row']

export type NotificationActor = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type NotificationWithActor = Notification & {
  actor: NotificationActor | null
}

function actorId(notification: Notification): string | null {
  const payload = notification.payload
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const id = (payload as Record<string, unknown>).actor_id
    if (typeof id === 'string') return id
  }
  return null
}

export function artworkIdOf(notification: Notification): string | null {
  const payload = notification.payload
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const id = (payload as Record<string, unknown>).artwork_id
    if (typeof id === 'string') return id
  }
  return null
}

export async function listNotifications(userId: string): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error

  const actorIds = [...new Set(data.map(actorId).filter((id): id is string => id !== null))]
  const actors = new Map<string, NotificationActor>()
  if (actorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', actorIds)
    if (profilesError) throw profilesError
    for (const profile of profiles) actors.set(profile.id, profile)
  }

  return data.map((notification) => ({
    ...notification,
    actor: actors.get(actorId(notification) ?? '') ?? null,
  }))
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null)
  if (error) throw error
  return count ?? 0
}

export async function markRead(id: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)
  if (error) throw error
}

export async function deleteNotification(id: string) {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}
