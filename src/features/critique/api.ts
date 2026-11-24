import { supabase } from '@/lib/supabase'
import type { CommentThread, CommentWithAuthor } from './types'

const AUTHOR_SELECT = 'profiles!comments_author_id_fkey(id, username, display_name, avatar_url)'

/** Every comment on a piece, newest top-level thread first, replies oldest-first within it. */
export async function listComments(artworkId: string): Promise<CommentThread[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, ${AUTHOR_SELECT}`)
    .eq('artwork_id', artworkId)
    .order('created_at', { ascending: true })
  if (error) throw error

  const rows = (data ?? []) as unknown as CommentWithAuthor[]
  const byId = new Map(rows.map((r) => [r.id, r]))
  const roots: CommentThread[] = []
  const repliesByParent = new Map<string, CommentWithAuthor[]>()

  for (const row of rows) {
    if (row.parent_id && byId.has(row.parent_id)) {
      const list = repliesByParent.get(row.parent_id) ?? []
      list.push(row)
      repliesByParent.set(row.parent_id, list)
    }
  }
  for (const row of rows) {
    if (!row.parent_id) roots.push({ ...row, replies: repliesByParent.get(row.id) ?? [] })
  }
  return roots.sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export type NewComment = {
  artworkId: string
  authorId: string
  body: string
  anchorX?: number | null
  anchorY?: number | null
  parentId?: string | null
}

export async function addComment(input: NewComment): Promise<CommentWithAuthor> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      artwork_id: input.artworkId,
      author_id: input.authorId,
      body: input.body,
      anchor_x: input.anchorX ?? null,
      anchor_y: input.anchorY ?? null,
      parent_id: input.parentId ?? null,
    })
    .select(`*, ${AUTHOR_SELECT}`)
    .single()
  if (error) throw error
  return data as unknown as CommentWithAuthor
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}
