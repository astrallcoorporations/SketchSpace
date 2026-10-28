import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  getCommunityShowcase,
  getPublicArtworkShowcase,
  type ShowcaseArtist,
  type ShowcaseArtwork,
} from '@/features/marketing/api'
import { ArtistRow, MountedPiece, withTimeout } from '@/features/marketing/components/showcase'

/**
 * The artists lead: real public work and the people who made it, straight
 * from the community. Nothing here is placeholder; empty means empty.
 */
export function ArtistsSection() {
  const [pieces, setPieces] = useState<ShowcaseArtwork[] | null>(null)
  const [artists, setArtists] = useState<ShowcaseArtist[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setPieces(null)
    void withTimeout(getPublicArtworkShowcase(7))
      .then((d) => !cancelled && setPieces(d))
      .catch(() => !cancelled && setFailed(true))
    void withTimeout(getCommunityShowcase(5))
      .then((d) => !cancelled && setArtists(d))
      .catch(() => !cancelled && setArtists([]))
    return () => {
      cancelled = true
    }
  }, [attempt])

  const [lead, ...rest] = pieces ?? []

  return (
    <section aria-labelledby="artists-title" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="artists-title" className="max-w-4xl font-display text-5xl leading-[0.9] uppercase sm:text-7xl">
            Made here, by the people here.
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Real pieces from the community, newest first. Every artist gets a portfolio that builds itself from their
            best work while they keep making it.
          </p>
        </div>

        {failed ? (
          <div className="mt-14 flex flex-col items-start gap-4 rounded-md border-2 border-input p-10">
            <h3 className="font-display text-3xl uppercase">Couldn't load the community's work</h3>
            <p className="max-w-md text-muted-foreground">
              The gallery didn't answer in time. Check your connection and try again.
            </p>
            <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : pieces === null ? (
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-square animate-skeleton rounded-md" />
            ))}
          </div>
        ) : pieces.length === 0 ? (
          <div className="mt-14 flex flex-col items-start gap-4 rounded-md border-2 border-dashed border-input p-10">
            <h3 className="font-display text-3xl uppercase">The first public piece is still to come</h3>
            <p className="max-w-md text-muted-foreground">Public work shows up here the moment an artist publishes it.</p>
            <Button asChild variant="brand">
              <Link to="/signup">Publish yours</Link>
            </Button>
          </div>
        ) : pieces.length <= 4 ? (
          // too few to feature one: an even row, every piece the same size
          <ul className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {pieces.map((piece) => (
              <li key={piece.id}>
                <MountedPiece piece={piece} tall />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {lead && <MountedPiece piece={lead} tall />}
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {rest.map((piece) => (
                <li key={piece.id}>
                  <MountedPiece piece={piece} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {artists && artists.length > 0 && (
          <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
            <div>
              <h3 className="font-display text-4xl leading-[0.9] uppercase">Artists working here now</h3>
              <p className="mt-4 max-w-sm text-muted-foreground">
                The most recently active public artists, with their real piece and follower counts.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/community">Meet the community</Link>
              </Button>
            </div>
            <ul className={`grid gap-3 ${artists.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {artists.map((a) => (
                <li key={a.id}>
                  <ArtistRow artist={a} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
