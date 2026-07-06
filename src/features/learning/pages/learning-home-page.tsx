import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, GraduationCap, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StaggerGroup, staggerItem, Reveal } from '@/components/motion/reveal'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { listPathsWithProgress, getStreak, getContinueLearningTarget } from '@/features/learning/api'
import { PathCard } from '@/features/learning/components/path-card'
import type { PathProgress, LearningStreak } from '@/features/learning/types'

export function LearningHomePage() {
  const { user } = useAuth()
  const [paths, setPaths] = useState<PathProgress[]>([])
  const [streak, setStreak] = useState<LearningStreak | null>(null)
  const [continueTarget, setContinueTarget] = useState<Awaited<
    ReturnType<typeof getContinueLearningTarget>
  > | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    void Promise.all([
      listPathsWithProgress(user.id),
      getStreak(user.id),
      getContinueLearningTarget(user.id),
    ]).then(([p, s, c]) => {
      if (cancelled) return
      setPaths(p)
      setStreak(s)
      setContinueTarget(c)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-medium">Learning</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className={streak && streak.current_streak > 0 ? 'size-4 text-amber-500' : 'size-4'} />
            <span className="font-medium text-foreground">{streak?.current_streak ?? 0}</span> day streak
          </span>
        </div>
      </div>

      {continueTarget && (
        <Reveal>
          <motion.div
            whileHover={{ y: -2 }}
            className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand-muted p-6"
          >
            <div>
              <p className="text-xs font-medium tracking-wide text-brand uppercase">
                Continue learning
              </p>
              <p className="mt-1 font-display text-lg font-medium">{continueTarget.lesson.title}</p>
              <p className="text-sm text-muted-foreground">
                {continueTarget.path.title} · {continueTarget.unit.title}
              </p>
            </div>
            <Button asChild variant="brand" className="shrink-0 gap-1.5">
              <Link to={`/app/learning/lesson/${continueTarget.lesson.id}`}>
                <Sparkles className="size-4" /> Continue
              </Link>
            </Button>
          </motion.div>
        </Reveal>
      )}

      {paths.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-6" />}
          title="Learning paths are on their way"
          description="Structured, Duolingo-style paths for every medium are being seeded in. Check back shortly."
        />
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paths.map((path) => (
            <motion.div key={path.id} variants={staggerItem}>
              <PathCard path={path} />
            </motion.div>
          ))}
        </StaggerGroup>
      )}
    </div>
  )
}
