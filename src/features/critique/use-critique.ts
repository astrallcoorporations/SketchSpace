import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { addComment, deleteComment, listComments } from './api'
import type { CommentThread } from './types'

export function useCritique(artworkId: string) {
  const [threads, setThreads] = useState<CommentThread[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    listComments(artworkId)
      .then(setThreads)
      .catch(() => toast.error('Could not load critique.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId])

  async function post(input: { authorId: string; body: string; anchorX?: number; anchorY?: number; parentId?: string }) {
    await addComment({ artworkId, authorId: input.authorId, body: input.body, anchorX: input.anchorX, anchorY: input.anchorY, parentId: input.parentId })
    load()
  }

  async function remove(id: string) {
    await deleteComment(id)
    load()
  }

  const pinned = threads.filter((t) => t.anchor_x !== null && t.anchor_y !== null)
  const general = threads.filter((t) => t.anchor_x === null)

  return { threads, pinned, general, loading, post, remove, reload: load }
}

export type UseCritique = ReturnType<typeof useCritique>
