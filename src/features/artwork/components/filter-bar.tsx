import { Lock, EyeOff, Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ArtworkVisibility } from '@/features/artwork/types'
import type { Collection } from '@/features/artwork/types'

export type PortfolioFilters = {
  visibility: ArtworkVisibility | 'all'
  medium: string | 'all'
  collectionId: string | 'all'
}

export function FilterBar({
  filters,
  onChange,
  mediums,
  collections,
}: {
  filters: PortfolioFilters
  onChange: (next: PortfolioFilters) => void
  mediums: string[]
  collections: Collection[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.visibility}
        onValueChange={(v) => onChange({ ...filters, visibility: v as PortfolioFilters['visibility'] })}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All visibility</SelectItem>
          <SelectItem value="public">
            <Globe className="size-3.5" /> Public
          </SelectItem>
          <SelectItem value="unlisted">
            <EyeOff className="size-3.5" /> Unlisted
          </SelectItem>
          <SelectItem value="private">
            <Lock className="size-3.5" /> Private
          </SelectItem>
        </SelectContent>
      </Select>

      {mediums.length > 0 && (
        <Select value={filters.medium} onValueChange={(v) => onChange({ ...filters, medium: v })}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Medium" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All mediums</SelectItem>
            {mediums.map((medium) => (
              <SelectItem key={medium} value={medium}>
                {medium}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {collections.length > 0 && (
        <Select
          value={filters.collectionId}
          onValueChange={(v) => onChange({ ...filters, collectionId: v })}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All collections</SelectItem>
            {collections.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
