import type { Tables } from '@/types/database'

export type CommentRow = Tables<'comments'>

export type CommentWithAuthor = CommentRow & {
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
}

/** A top-level comment with its replies nested, the shape the panel renders. */
export type CommentThread = CommentWithAuthor & {
  replies: CommentWithAuthor[]
}
