import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Flame, GraduationCap, Image, Pencil, TrendingUp, Users2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { useAuth } from '@/hooks/use-auth'
import { joinQuest, listQuestsWithProgress, logQuestProgress } from '@/features/quests/api'
import type { QuestWithProgress } from '@/features/quests/types'

const CATEGORY_ICONS: Record<string, typeof Flame> = {
  portfolio: Image,
  practice: Pencil,
  community: Users2,
  growth: TrendingUp,
  learning: GraduationCap,
}

export function QuestsPage() {
  const { user } = useAuth()
  const [quests, setQuests] = useState<QuestWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    try {
      setQuests(await listQuestsWithProgress(user.id))
    } catch {
      toast.error('Failed to load quests.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const earnedXp = useMemo(
    () => quests.reduce((sum, q) => (q.progress?.completed_at ? sum + q.xp_reward : sum), 0),
    [quests],
  )
  const completedCount = quests.filter((q) => q.progress?.completed_at).length

  async function handleJoin(quest: QuestWithProgress) {
    if (!user) return
    setBusyId(quest.id)
    try {
      const progress = await joinQuest(user.id, quest.id)
      setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, progress } : q)))
      toast.success(`Joined "${quest.title}"`)
    } catch {
      toast.error('Failed to join quest.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleLog(quest: QuestWithProgress) {
    if (!quest.progress) return
    setBusyId(quest.id)
    try {
      const progress = await logQuestProgress(quest.progress, quest.goal)
      setQuests((prev) => prev.map((q) => (q.id === quest.id ? { ...q, progress } : q)))
      if (progress.completed_at) {
        toast.success(`Quest complete — +${quest.xp_reward} XP`)
      }
    } catch {
      toast.error('Failed to log progress.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium">Quests</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Structured challenges that reward showing up.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
            <Flame className="size-4 text-brand" />
            <span className="text-sm font-medium tabular-nums">{earnedXp} XP</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {completedCount}/{quests.length} complete
            </span>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quests.map((quest) => {
            const Icon = CATEGORY_ICONS[quest.category] ?? Flame
            const joined = quest.progress !== null
            const done = Boolean(quest.progress?.completed_at)
            const current = quest.progress?.progress ?? 0
            const percent = Math.round((current / quest.goal) * 100)

            return (
              <Card key={quest.id} className={`card-hover card-hover-lift ${done ? 'border-brand/40' : ''}`}>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-brand-muted text-brand-muted-foreground">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="capitalize">{quest.category}</Badge>
                  </div>

                  <div className="flex-1">
                    <h2 className="font-medium">{quest.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{quest.description}</p>
                  </div>

                  {joined && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="tabular-nums">{current}/{quest.goal}</span>
                        <span>+{quest.xp_reward} XP</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={current}
                        aria-valuemin={0}
                        aria-valuemax={quest.goal}
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-from to-brand-to transition-[width] duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {done ? (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-brand">
                      <CheckCircle2 className="size-4" />
                      Completed
                    </div>
                  ) : joined ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === quest.id}
                      onClick={() => handleLog(quest)}
                    >
                      Log progress
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="brand"
                      disabled={busyId === quest.id}
                      onClick={() => handleJoin(quest)}
                    >
                      Join quest · {quest.xp_reward} XP
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
