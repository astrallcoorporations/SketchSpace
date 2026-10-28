import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SwatchLadder } from '@/components/swatch/swatch-ladder'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { ArtistRow, MountedPiece, withTimeout } from '@/features/marketing/components/showcase'
import { Seo } from '@/components/shared/seo'
import {
  getCommunityShowcase,
  getPublicArtworkShowcase,
  type ShowcaseArtist,
  type ShowcaseArtwork,
} from '@/features/marketing/api'

type Load<T> = { state: 'loading' } | { state: 'failed' } | { state: 'ready'; data: T }

export function CommunityPage() {
  const [artists, setArtists] = useState<Load<ShowcaseArtist[]>>({ state: 'loading' })
  const [pieces, setPieces] = useState<ShowcaseArtwork[]>([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setArtists({ state: 'loading' })
    void withTimeout(getCommunityShowcase(12))
      .then((data) => !cancelled && setArtists({ state: 'ready', data }))
      .catch(() => !cancelled && setArtists({ state: 'failed' }))
    void withTimeout(getPublicArtworkShowcase(3))
      .then((data) => !cancelled && setPieces(data))
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [attempt])

  return (
    <MarketingLayout>
      <Seo
        title="Community"
        description="Discover real artists, real profiles, and real progress. Join SketchSpace and start building your following."
        canonical="/community"
      />
      <section className="px-4 pt-16 pb-20 sm:px-8 sm:pt-24">
        <div className="mx-auto grid max-w-[88rem] items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <h1 className="font-display text-[clamp(3rem,6.4vw,5.6rem)] leading-[0.86] uppercase">
              Real artists, real profiles, real progress.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              This is what's live today — public profiles and a real follow graph. Studios (critique spaces,
              challenges, mentorship) are the next major system, in active design.
            </p>
          </div>
          {/* the newest real pieces lead; the swatch sheet stands in only when there are none */}
          {pieces.length > 0 ? (
            <ul className="grid grid-cols-3 gap-3">
              {pieces.map((p, i) => (
                <li key={p.id} className={i === 1 ? 'translate-y-6' : ''}>
                  <MountedPiece piece={p} tall />
                </li>
              ))}
            </ul>
          ) : (
            <SwatchLadder caption="Every artist starts on one pass" />
          )}
        </div>
      </section>

      <section aria-labelledby="artists-title" className="mx-auto max-w-[88rem] px-4 pb-28 sm:px-8">
        <h2 id="artists-title" className="font-display text-4xl leading-[0.9] uppercase sm:text-5xl">
          Recently active
        </h2>
        <div className="mt-8">
          {artists.state === 'loading' ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-[4.75rem] animate-skeleton rounded-md" />
              ))}
            </div>
          ) : artists.state === 'failed' ? (
            <div className="flex flex-col items-start gap-4 rounded-md border-2 border-input p-8">
              <h3 className="font-display text-3xl uppercase">Couldn't load the community</h3>
              <p className="max-w-md text-muted-foreground">
                The profiles didn't answer in time. Check your connection and try again.
              </p>
              <Button variant="outline" onClick={() => setAttempt((n) => n + 1)}>
                Try again
              </Button>
            </div>
          ) : artists.data.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-md border-2 border-dashed border-input p-8">
              <h3 className="font-display text-3xl uppercase">The community is just getting started</h3>
              <p className="max-w-md text-muted-foreground">
                No public profiles yet. Be one of the first artists to publish here.
              </p>
              <Button asChild variant="brand">
                <Link to="/signup">Create the first profile</Link>
              </Button>
            </div>
          ) : (
            <ul className={`grid gap-3 ${artists.data.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-md'}`}>
              {artists.data.map((artist) => (
                <li key={artist.id}>
                  <ArtistRow artist={artist} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </MarketingLayout>
  )
}
