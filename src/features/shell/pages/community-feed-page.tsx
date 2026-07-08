import { useCallback, useEffect, useState, useRef } from 'react'
import { Users2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { ArtworkCard } from '@/features/artwork/components/artwork-card'
import { listArtworks } from '@/features/artwork/api'
import type { ArtworkWithOwner } from '@/features/artwork/types'

export function CommunityFeedPage() {
  const [artworks, setArtworks] = useState<ArtworkWithOwner[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const pageRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const { items, hasMore: more } = await listArtworks({ visibility: 'public', page: 0 })
      setArtworks(items)
      setHasMore(more)
      pageRef.current = 0
    } catch {
      toast.error('Failed to load feed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  useEffect(() => {
    if (!hasMore || loading) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true)
          const nextPage = pageRef.current + 1
          listArtworks({ visibility: 'public', page: nextPage })
            .then(({ items, hasMore: more }) => {
              setArtworks((prev) => [...prev, ...items])
              setHasMore(more)
              pageRef.current = nextPage
            })
            .catch(() => toast.error('Failed to load more.'))
            .finally(() => setLoadingMore(false))
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore])

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Reveal>
        <div>
          <h1 className="font-display text-2xl font-medium">Community</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Discover artwork from artists around the world.
          </p>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mb-4 break-inside-avoid rounded-xl" style={{ height: `${200 + (i % 3) * 80}px` }} />
          ))}
        </div>
      ) : artworks.length === 0 ? (
        <Reveal className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
            <Users2 className="size-6" />
          </div>
          <h2 className="font-display text-xl font-medium">No artwork yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Be the first to share something with the community.
          </p>
        </Reveal>
      ) : (
        <>
          <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="mb-4 break-inside-avoid page-enter">
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-brand" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
