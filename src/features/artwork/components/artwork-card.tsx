import { Link } from 'react-router-dom'
import { Lock, EyeOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArtworkWithOwner } from '@/features/artwork/types'
import { sanitizeImageUrl } from '@/lib/image-url'

const visibilityIcon = {
  public: null,
  unlisted: EyeOff,
  private: Lock,
} as const

const visibilityLabel = { unlisted: 'Unlisted', private: 'Private' } as const

/** A piece mounted on a paper sheet, its label sewn on underneath. */
export function ArtworkCard({
  artwork,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  artwork: ArtworkWithOwner
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: () => void
}) {
  const VisibilityIcon = visibilityIcon[artwork.visibility as keyof typeof visibilityIcon]
  const src = sanitizeImageUrl(artwork.cover_image_url)

  const inner = (
    <div className="sheet p-2">
      <div className="relative overflow-hidden bg-paper-rule">
        {src ? (
          <img
            src={src}
            alt={artwork.title}
            loading="lazy"
            crossOrigin="anonymous"
            className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="aspect-square w-full" />
        )}
        {VisibilityIcon && (
          <span
            className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-paper-ink px-2 py-0.5 text-[0.7rem] font-medium text-paper"
            title={visibilityLabel[artwork.visibility as keyof typeof visibilityLabel]}
          >
            <VisibilityIcon className="size-3" aria-hidden="true" />
            {visibilityLabel[artwork.visibility as keyof typeof visibilityLabel]}
          </span>
        )}
        {selectable && (
          <span
            aria-hidden="true"
            className={cn(
              'absolute top-2 left-2 flex size-6 items-center justify-center rounded-full border-2 border-paper transition-colors duration-200',
              selected ? 'bg-ink-magenta' : 'bg-paper-ink/60',
            )}
          >
            {selected && <Check className="size-3.5 text-white" />}
          </span>
        )}
      </div>
      <div className="mt-2 border-t-[1.5px] border-dashed border-paper-ink/40 px-0.5 pt-1.5">
        <p className="truncate text-sm font-semibold">{artwork.title}</p>
        {artwork.medium && <p className="truncate text-xs text-paper-ink/75">{artwork.medium}</p>}
      </div>
    </div>
  )

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onToggleSelect}
        aria-pressed={selected}
        aria-label={selected ? `Deselect ${artwork.title}` : `Select ${artwork.title}`}
        className={cn(
          'group block w-full rounded-md text-left outline-offset-2 transition-shadow duration-200',
          selected && 'ring-2 ring-ink-magenta-light ring-offset-2 ring-offset-background',
        )}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link to={`/artwork/${artwork.id}`} className="group block rounded-md">
      {inner}
    </Link>
  )
}

export function ArtworkCardSkeleton({ heightClass = 'h-64' }: { heightClass?: string }) {
  return <div className={`mb-4 animate-skeleton rounded-md ${heightClass}`} />
}
