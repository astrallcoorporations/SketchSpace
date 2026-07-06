import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckSquare, Search, UploadCloud, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { useInfiniteArtworks } from '@/features/artwork/hooks/use-infinite-artworks'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { MasonryGrid, MasonryItem } from '@/features/artwork/components/masonry-grid'
import { ArtworkCard, ArtworkCardSkeleton } from '@/features/artwork/components/artwork-card'
import { UploadDialog } from '@/features/artwork/components/upload-dialog'
import { BulkActionBar } from '@/features/artwork/components/bulk-action-bar'
import { FilterBar, type PortfolioFilters } from '@/features/artwork/components/filter-bar'
import { getOwnerFacets, listCollections } from '@/features/artwork/api'
import type { Collection } from '@/features/artwork/types'
import { StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { motion } from 'framer-motion'

export function PortfolioPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [filters, setFilters] = useState<PortfolioFilters>({
    visibility: 'all',
    medium: 'all',
    collectionId: 'all',
  })
  const [selecting, setSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [mediums, setMediums] = useState<string[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  const { items, hasMore, loading, loadMore, refresh } = useInfiniteArtworks({
    ownerId: user?.id,
    search: search || undefined,
    visibility: filters.visibility === 'all' ? undefined : filters.visibility,
    medium: filters.medium === 'all' ? undefined : filters.medium,
    collectionId: filters.collectionId === 'all' ? undefined : filters.collectionId,
  })

  const sentinelRef = useIntersectionObserver(loadMore, hasMore && !loading)
  const hasActiveFilters =
    !!search || filters.visibility !== 'all' || filters.medium !== 'all' || filters.collectionId !== 'all'
  const isEmpty = !loading && items.length === 0 && !hasActiveFilters

  const refreshCollections = useCallback(() => {
    if (!user) return Promise.resolve()
    return listCollections(user.id).then(setCollections)
  }, [user])

  useEffect(() => {
    if (!user) return
    void getOwnerFacets(user.id).then(({ mediums: m }) => setMediums(m))
    void refreshCollections()
  }, [user, refreshCollections])

  function handleSearchChange(value: string) {
    setSearch(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  function toggleSelecting() {
    setSelecting((prev) => !prev)
    setSelectedIds([])
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-medium">Portfolio</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search your artwork…"
              className="w-56 pl-9"
            />
          </div>
          <Button
            variant={selecting ? 'secondary' : 'outline'}
            size="icon"
            aria-label={selecting ? 'Exit selection mode' : 'Select artwork'}
            onClick={toggleSelecting}
          >
            {selecting ? <X className="size-4" /> : <CheckSquare className="size-4" />}
          </Button>
          <Button variant="brand" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <UploadCloud className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {!isEmpty && (
        <div className="mt-4">
          <FilterBar filters={filters} onChange={setFilters} mediums={mediums} collections={collections} />
        </div>
      )}

      <div className="mt-8">
        {isEmpty ? (
          <EmptyState
            icon={<UploadCloud className="size-6" />}
            title="Publish your first artwork"
            description="Your portfolio assembles itself from your best, most recent work — no template to fill in. Nothing published yet."
            action={
              <Button variant="brand" onClick={() => setUploadOpen(true)}>
                Upload artwork
              </Button>
            }
          />
        ) : items.length === 0 && !loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No artwork matches these filters.
          </p>
        ) : (
          <StaggerGroup>
            <MasonryGrid>
              {items.map((artwork) => (
                <MasonryItem key={artwork.id}>
                  <motion.div variants={staggerItem}>
                    <ArtworkCard
                      artwork={artwork}
                      selectable={selecting}
                      selected={selectedIds.includes(artwork.id)}
                      onToggleSelect={() => toggleSelect(artwork.id)}
                    />
                  </motion.div>
                </MasonryItem>
              ))}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <MasonryItem key={`skeleton-${i}`}>
                    <ArtworkCardSkeleton heightClass={i % 2 === 0 ? 'h-72' : 'h-52'} />
                  </MasonryItem>
                ))}
            </MasonryGrid>
          </StaggerGroup>
        )}
        <div ref={sentinelRef} className="h-1" />
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={refresh} />

      {user && (
        <BulkActionBar
          ownerId={user.id}
          selectedIds={selectedIds}
          onClear={() => setSelectedIds([])}
          onChanged={() => {
            refresh()
            void refreshCollections()
          }}
        />
      )}
    </div>
  )
}
