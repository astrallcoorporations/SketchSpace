import { useCallback, useEffect, useRef, useState } from 'react'
import { listArtworks } from '@/features/artwork/api'
import type { ArtworkWithOwner, ArtworkVisibility } from '@/features/artwork/types'

type Params = {
  ownerId?: string
  visibility?: ArtworkVisibility
  search?: string
  medium?: string
  tag?: string
  collectionId?: string
}

export function useInfiniteArtworks({ ownerId, visibility, search, medium, tag, collectionId }: Params) {
  const [items, setItems] = useState<ArtworkWithOwner[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(
    async (nextPage: number, replace: boolean) => {
      const id = ++requestId.current
      setLoading(true)
      try {
        const { items: newItems, hasMore: more } = await listArtworks({
          ownerId,
          visibility,
          search,
          medium,
          tag,
          collectionId,
          page: nextPage,
        })
        if (id !== requestId.current) return // stale response — filters changed mid-flight
        setItems((prev) => (replace ? newItems : [...prev, ...newItems]))
        setHasMore(more)
        setPage(nextPage)
      } finally {
        if (id === requestId.current) setLoading(false)
      }
    },
    [ownerId, visibility, search, medium, tag, collectionId],
  )

  // Reset and reload whenever the filters change.
  useEffect(() => {
    void load(0, true)
  }, [load])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) void load(page + 1, false)
  }, [loading, hasMore, page, load])

  const refresh = useCallback(() => load(0, true), [load])

  return { items, hasMore, loading, loadMore, refresh }
}
