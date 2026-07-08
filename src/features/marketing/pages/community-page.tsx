import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Magnetic } from '@/components/motion/magnetic'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { MarketingLayout } from '@/features/marketing/components/marketing-layout'
import { Seo } from '@/components/shared/seo'
import { getCommunityShowcase, type ShowcaseArtist } from '@/features/marketing/api'

function ArtistCardSkeleton() {
  return <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted" />
}

export function CommunityPage() {
  const [artists, setArtists] = useState<ShowcaseArtist[] | null>(null)

  useEffect(() => {
    let cancelled = false
    void getCommunityShowcase(6)
      .then((data) => {
        if (!cancelled) setArtists(data)
      })
      .catch(() => {
        if (!cancelled) setArtists([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <MarketingLayout>
      <Seo
        title="Community"
        description="Discover real artists, real profiles, and real progress. Join SketchSpace and start building your following."
        canonical="/community"
      />
      <section className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
        <Reveal>
          <p className="text-sm font-medium tracking-wide text-brand uppercase">Community</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-3 text-balance font-display text-4xl font-medium sm:text-6xl">
            Real artists, real profiles, real progress.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
            This is what's live today — public profiles and a real follow graph. Studios
            (critique spaces, challenges, mentorship) are the next major system, in active design.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28">
        {artists === null ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArtistCardSkeleton key={i} />
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-24 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
              <UsersRound className="size-6" />
            </div>
            <h2 className="font-display text-xl font-medium">The community is just getting started</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              No public profiles yet — be one of the first artists to publish here.
            </p>
            <Button asChild variant="brand">
              <Link to="/signup">Create the first profile</Link>
            </Button>
          </div>
        ) : (
          <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <motion.div
                key={artist.id}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="flex flex-col rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-muted text-brand-muted-foreground">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="font-display text-lg">{artist.username[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{artist.display_name || artist.username}</p>
                    <p className="truncate text-xs text-muted-foreground">@{artist.username}</p>
                  </div>
                </div>

                {artist.bio && <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{artist.bio}</p>}

                {artist.favorite_mediums.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {artist.favorite_mediums.slice(0, 3).map((m) => (
                      <Badge key={m} variant="secondary">
                        {m}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">{artist.publicArtworkCount}</span> artworks
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{artist.followerCount}</span> followers
                  </span>
                </div>
              </motion.div>
            ))}
          </StaggerGroup>
        )}
      </section>

      <section className="border-t border-border bg-muted/30 px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-display text-3xl font-medium text-balance sm:text-4xl">
            Join, publish, and start building a real following.
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <Magnetic>
            <Button asChild variant="brand" size="lg" className="mt-8 h-11 gap-2 px-6 text-base">
              <Link to="/signup">
                Create your profile <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Magnetic>
        </Reveal>
      </section>
    </MarketingLayout>
  )
}
