import { Link } from 'react-router-dom'
import type { ShowcaseArtist, ShowcaseArtwork } from '@/features/marketing/api'
import { sanitizeImageUrl } from '@/lib/image-url'

const dateFmt = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })
const countFmt = new Intl.NumberFormat('en')

export const SHOWCASE_TIMEOUT_MS = 10_000

/** Give up on a request that never answers, so the page can say so instead of spinning. */
export function withTimeout<T>(p: Promise<T>, ms = SHOWCASE_TIMEOUT_MS): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])
}

export function nameOf(p: { display_name: string | null; username: string } | null | undefined) {
  return p ? p.display_name || p.username : null
}

/** One piece, mounted on a sheet with its maker's label sewn on: who, when, how many versions. */
export function MountedPiece({ piece, tall }: { piece: ShowcaseArtwork; tall?: boolean }) {
  const src = sanitizeImageUrl(piece.cover_image_url)
  const by = nameOf(piece.profiles)
  return (
    <Link to={`/artwork/${piece.id}`} className="group block rounded-md">
      <div className="sheet p-2.5">
        <div className={`${tall ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden bg-paper-rule`}>
          {src && (
            <img
              src={src}
              alt={by ? `${piece.title} by ${by}` : piece.title}
              loading="lazy"
              crossOrigin="anonymous"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="mt-2.5 border-t-[1.5px] border-dashed border-paper-ink/40 pt-2">
          <p className="truncate font-semibold">{piece.title}</p>
          <p className="mt-0.5 flex flex-wrap justify-between gap-x-2 text-xs text-paper-ink/75">
            <span className="min-w-0 break-words">{by ? `by ${by}` : (piece.medium ?? 'Artwork')}</span>
            <span className="shrink-0 font-code">
              {piece.versionCount > 1 ? `v${piece.versionCount} · ` : ''}
              {dateFmt.format(new Date(piece.created_at))}
            </span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ArtistRow({ artist }: { artist: ShowcaseArtist }) {
  const name = nameOf(artist)
  const avatar = sanitizeImageUrl(artist.avatar_url)
  return (
    <Link
      to={`/u/${artist.username}`}
      className="flex items-center gap-4 rounded-md border-2 border-border bg-pass-v4 p-3 transition-colors hover:border-ink-violet-light"
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pass-v2 font-display text-xl uppercase">
        {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : name?.[0]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{name}</span>
        <span className="block truncate text-sm text-muted-foreground">
          {artist.favorite_mediums.length ? artist.favorite_mediums.slice(0, 2).join(', ') : `@${artist.username}`}
        </span>
      </span>
      <span className="shrink-0 text-right font-code text-xs text-muted-foreground">
        {countFmt.format(artist.publicArtworkCount)} pieces
        <br />
        {countFmt.format(artist.followerCount)} followers
      </span>
    </Link>
  )
}
