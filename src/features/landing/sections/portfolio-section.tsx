import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { TiltCard } from '@/components/motion/tilt-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { GalleryVertical } from 'lucide-react'
import { getPublicArtworkShowcase, type ShowcaseArtwork } from '@/features/marketing/api'

function PieceSkeleton() {
  return <div className="aspect-[4/5] animate-pulse rounded-2xl border border-border bg-muted" />
}

export function PortfolioSection() {
  const [pieces, setPieces] = useState<ShowcaseArtwork[] | null>(null)

  useEffect(() => {
    let cancelled = false
    void getPublicArtworkShowcase(3)
      .then((data) => {
        if (!cancelled) setPieces(data)
      })
      .catch(() => {
        if (!cancelled) setPieces([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-brand uppercase">
              Portfolio builder
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-medium text-balance sm:text-5xl">
              A portfolio that builds itself from your best work.
            </h2>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <p className="max-w-xs text-sm text-muted-foreground">
            No drag-and-drop template. SketchSpace assembles your strongest, most recent pieces
            automatically — you just keep making work.
          </p>
        </Reveal>
      </div>

      {pieces === null ? (
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <PieceSkeleton />
          <PieceSkeleton />
          <PieceSkeleton />
        </div>
      ) : pieces.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground">
              <GalleryVertical className="size-6" />
            </div>
            <h3 className="font-display text-xl font-medium">The first public piece is still to come</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Public portfolios show up here the moment an artist publishes one. Be the first.
            </p>
            <Button asChild variant="brand">
              <Link to="/signup">Publish yours</Link>
            </Button>
          </div>
        </Reveal>
      ) : (
        <StaggerGroup className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {pieces.map((piece) => (
            <motion.div key={piece.id} variants={staggerItem}>
              <Link to={`/app/artwork/${piece.id}`}>
                <TiltCard className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-muted">
                  {piece.cover_image_url && (
                    <img
                      src={piece.cover_image_url}
                      alt={piece.title}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-5">
                    <h3 className="text-sm font-medium">{piece.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {piece.medium ?? 'Artwork'}
                      {piece.profiles ? ` · by ${piece.profiles.display_name || piece.profiles.username}` : ''}
                    </p>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </section>
  )
}
