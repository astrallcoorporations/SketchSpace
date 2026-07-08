import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, EyeOff, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ArtworkWithOwner } from '@/features/artwork/types'

const visibilityIcon = {
  public: null,
  unlisted: EyeOff,
  private: Lock,
} as const

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

  const inner = (
    <div className="relative overflow-hidden rounded-xl">
      {artwork.cover_image_url ? (
        <motion.img
          src={artwork.cover_image_url}
          alt={artwork.title}
          loading="lazy"
          className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          initial={false}
          whileHover={selectable ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : (
        <div className="aspect-square w-full bg-muted" />
      )}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-[-2px]">
        <p className="truncate text-sm font-medium text-white">{artwork.title}</p>
        {artwork.medium && <p className="truncate text-xs text-white/70">{artwork.medium}</p>}
      </div>
      {VisibilityIcon && (
        <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
          <VisibilityIcon className="size-3.5" />
        </div>
      )}
      {selectable && (
        <div
          className={cn(
            'absolute top-2 left-2 flex size-6 items-center justify-center rounded-full border-2 border-white/80 backdrop-blur-sm transition-all duration-200',
            selected ? 'bg-brand scale-110' : 'bg-black/30',
          )}
        >
          {selected && <Check className="size-3.5 text-brand-foreground" />}
        </div>
      )}
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
          'group block w-full overflow-hidden rounded-xl border bg-muted text-left transition-all duration-300',
          selected ? 'border-brand ring-2 ring-brand/40' : 'border-border hover:shadow-[var(--shadow-sm)]',
        )}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link
      to={`/artwork/${artwork.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-muted transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
    >
      {inner}
    </Link>
  )
}

export function ArtworkCardSkeleton({ heightClass = 'h-64' }: { heightClass?: string }) {
  return <div className={`mb-4 animate-skeleton rounded-xl ${heightClass}`} />
}
