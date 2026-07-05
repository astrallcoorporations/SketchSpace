import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Sparkles, TrendingUp, UploadCloud } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { RouteLoader } from '@/components/layout/route-loader'
import { useAuth } from '@/hooks/use-auth'
import { useOwnProfile } from '@/features/profile/hooks/use-own-profile'
import { listArtworks } from '@/features/artwork/api'
import { ArtworkCard } from '@/features/artwork/components/artwork-card'
import { UploadDialog } from '@/features/artwork/components/upload-dialog'
import { getContinueLearningTarget, getStreak } from '@/features/learning/api'
import type { ArtworkWithOwner } from '@/features/artwork/types'
import type { LearningStreak } from '@/features/learning/types'

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
    setArtworks(items.slice(0, 4))
    setStreak(streakData)
    setContinueTarget(target)
    setLoading(false)
  }, [user])

  useEffect(() => {
    void loadWidgets()
  }, [loadWidgets])

  if (loading) return <RouteLoader />

  const level = Math.floor((profile?.xp ?? 0) / 100) + 1
  const xpIntoLevel = (profile?.xp ?? 0) % 100

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Reveal>
        <h1 className="font-display text-2xl font-medium">
          Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
        </h1>
        <p className="mt-1 text-muted-foreground">Here's where your practice stands today.</p>
      </Reveal>

      <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-background p-5"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className={streak && streak.current_streak > 0 ? 'size-4 text-amber-500' : 'size-4'} />
            <span className="text-sm">Streak</span>
          </div>
          <p className="mt-2 font-display text-3xl font-medium">{streak?.current_streak ?? 0}</p>
          <p className="text-xs text-muted-foreground">days in a row</p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-background p-5"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="size-4 text-brand" />
            <span className="text-sm">Level {level}</span>
          </div>
          <p className="mt-2 font-display text-3xl font-medium">{profile?.xp ?? 0} XP</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${xpIntoLevel}%` }} />
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-2xl border border-border bg-background p-5 sm:col-span-2"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-sm">Continue learning</span>
          </div>
          {continueTarget ? (
            <>
              <p className="mt-2 truncate font-medium">{continueTarget.lesson.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {continueTarget.path.title} · {continueTarget.unit.title}
              </p>
              <Button asChild variant="brand" size="sm" className="mt-3">
                <Link to={`/app/learning/lesson/${continueTarget.lesson.id}`}>Continue</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">All caught up on lessons.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/app/learning">Browse paths</Link>
              </Button>
            </>
          )}
        </motion.div>
      </StaggerGroup>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Recent artwork</h2>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
            <UploadCloud className="size-3.5" /> Upload
          </Button>
        </div>

        {artworks.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <UploadCloud className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your studio is where every piece starts. Upload something to begin.
            </p>
            <Button variant="brand" onClick={() => setUploadOpen(true)}>
              Upload artwork
            </Button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={loadWidgets} />
    </div>
  )
}
