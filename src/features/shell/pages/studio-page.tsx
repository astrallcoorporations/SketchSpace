import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Sparkles, UploadCloud } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { sanitizeImageUrl } from '@/lib/image-url'
import { useAuth } from '@/hooks/use-auth'
import { useOwnProfile } from '@/features/profile/hooks/use-own-profile'
import { listArtworks } from '@/features/artwork/api'
import { ArtworkCard } from '@/features/artwork/components/artwork-card'
import { UploadDialog } from '@/features/artwork/components/upload-dialog'
import { getContinueLearningTarget, getStreak } from '@/features/learning/api'
import type { ArtworkWithOwner } from '@/features/artwork/types'
import type { LearningStreak } from '@/features/learning/types'

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function StudioPage() {
  const { user } = useAuth()
  const { profile } = useOwnProfile()
  const [artworks, setArtworks] = useState<ArtworkWithOwner[]>([])
  const [streak, setStreak] = useState<LearningStreak | null>(null)
  const [continueTarget, setContinueTarget] = useState<Awaited<
    ReturnType<typeof getContinueLearningTarget>
  > | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)

  const loadWidgets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [{ items }, streakData, target] = await Promise.all([
      listArtworks({ ownerId: user.id, page: 0 }),
      getStreak(user.id),
      getContinueLearningTarget(user.id),
    ])
    setArtworks(items.slice(0, 7))
    setStreak(streakData)
    setContinueTarget(target)
    setLoading(false)
  }, [user])

  useEffect(() => {
    void loadWidgets()
  }, [loadWidgets])

  const level = Math.floor((profile?.xp ?? 0) / 100) + 1
  const xpIntoLevel = (profile?.xp ?? 0) % 100
  const [hero, ...rest] = artworks
  const heroSrc = hero ? sanitizeImageUrl(hero.cover_image_url) : null

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
            </h1>
            <p className="mt-1 text-muted-foreground">Here's where your practice stands today.</p>
          </div>

          {/* Status stays compact and always visible, never a wall of stat cards. */}
          {!loading && (
            <div className="flex items-center gap-4 rounded-full border-2 border-border bg-pass-v4 py-2 pr-5 pl-3">
              <span className="flex items-center gap-1.5 text-sm">
                <Flame className={streak && streak.current_streak > 0 ? 'size-4 text-ink-pink-light' : 'size-4 text-muted-foreground'} />
                <span className="font-code tabular-nums">{streak?.current_streak ?? 0}</span>
              </span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-ink-violet-light" />
                <span className="text-muted-foreground">Lvl</span>
                <span className="font-code tabular-nums">{level}</span>
                <span className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
                  <motion.span
                    className="block h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpIntoLevel}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
              </span>
            </div>
          )}
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-96 rounded-md" />
          <Skeleton className="h-96 rounded-md" />
        </div>
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* The work is the hero, not the stats: the studio's reason to exist is the art. */}
          <motion.div variants={staggerItem}>
            {hero ? (
              <Link
                to={`/artwork/${hero.id}`}
                className="group block overflow-hidden rounded-md border-2 border-border bg-pass-v4 p-5 transition-colors duration-300 hover:border-ink-violet-light/50"
              >
                <p className="text-sm text-muted-foreground">Your latest piece</p>
                <div className="sheet mt-3 p-2">
                  <div className="relative overflow-hidden bg-paper-rule">
                    {heroSrc ? (
                      <img
                        src={heroSrc}
                        alt={hero.title}
                        crossOrigin="anonymous"
                        className="max-h-[22rem] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t-[1.5px] border-dashed border-paper-ink/40 px-0.5 pt-1.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{hero.title}</p>
                      {hero.medium && <p className="truncate text-xs text-paper-ink/75">{hero.medium}</p>}
                    </div>
                    <p className="shrink-0 font-code text-[0.65rem] text-paper-ink/60">
                      {monthYear.format(new Date(hero.created_at))}
                    </p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-20 text-center">
                <UploadCloud className="size-6 text-muted-foreground" />
                <p className="max-w-xs text-sm text-muted-foreground">
                  Your studio is where every piece starts. Upload something to begin.
                </p>
                <Button variant="brand" onClick={() => setUploadOpen(true)}>
                  Upload artwork
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2 }}
            className="group rounded-md border-2 border-border bg-pass-v4 p-5 transition-colors duration-300 hover:border-ink-violet-light/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground">
                <Sparkles className="size-4" />
              </div>
              <span className="text-sm text-muted-foreground">Continue learning</span>
            </div>
            {continueTarget ? (
              <>
                <p className="mt-3 truncate font-medium">{continueTarget.lesson.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {continueTarget.path.title} · {continueTarget.unit.title}
                </p>
                <Button asChild variant="brand" size="sm" className="mt-3">
                  <Link to={`/learning/lesson/${continueTarget.lesson.id}`}>Continue</Link>
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">All caught up on lessons.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/learning">Browse paths</Link>
                </Button>
              </>
            )}

            <div className="mt-6 border-t-2 border-border pt-5">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5" onClick={() => setUploadOpen(true)}>
                <UploadCloud className="size-3.5" /> Upload artwork
              </Button>
            </div>
          </motion.div>
        </StaggerGroup>
      )}

      {(loading || rest.length > 0) && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground">More from your studio</h2>

          {loading ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {rest.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={loadWidgets} />
    </div>
  )
}
