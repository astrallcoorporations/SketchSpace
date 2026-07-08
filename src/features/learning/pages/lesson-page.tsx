import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, PartyPopper } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { useAuth } from '@/hooks/use-auth'
import { completeLesson, getLessonDetail, getLessonProgress } from '@/features/learning/api'

const difficultyLabel = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<Awaited<ReturnType<typeof getLessonDetail>> | null>(null)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  useEffect(() => {
    if (!lessonId || !user) return
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    void Promise.all([getLessonDetail(lessonId), getLessonProgress(user.id, lessonId)])
      .then(([lessonData, progress]) => {
        if (cancelled) return
        setLesson(lessonData)
        setAlreadyCompleted(progress?.status === 'completed')
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setNotFound(true)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonId, user])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Skeleton className="h-4 w-24" />
        <div className="mt-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-72" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        <Skeleton className="mt-8 h-10 w-full rounded-lg" />
      </div>
    )
  }

  if (notFound || !lesson) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted-foreground">This lesson doesn't exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/learning')}>
          Back to learning
        </Button>
      </div>
    )
  }

  const unit = lesson.unit as { title: string; path: { slug: string; title: string } } | null

  async function handleComplete() {
    if (!lessonId) return
    setCompleting(true)
    try {
      await completeLesson(lessonId)
      setJustCompleted(true)
      setAlreadyCompleted(true)
    } catch {
      toast.error('Could not save your progress. Try again.')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        to={unit ? `/learning/${unit.path.slug}` : '/learning'}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {unit?.path.title ?? 'Learning'}
      </Link>

      <AnimatePresence mode="wait">
        {justCompleted ? (
          <motion.div
            key="celebration"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-brand/30 bg-brand-muted py-16 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="flex size-16 items-center justify-center rounded-full bg-brand text-brand-foreground"
            >
              <PartyPopper className="size-8" />
            </motion.div>
            <h2 className="font-display text-2xl font-medium">Lesson complete!</h2>
            <p className="text-brand-muted-foreground">+{lesson.xp_reward} XP earned</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(`/learning/${unit?.path.slug}`)}>
                Back to path
              </Button>
              <Button variant="brand" onClick={() => navigate('/learning')}>
                Keep learning
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Reveal className="mt-6">
              <p className="text-sm text-muted-foreground">{unit?.title}</p>
              <h1 className="mt-1 font-display text-2xl font-medium">{lesson.title}</h1>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary">
                  {difficultyLabel[lesson.difficulty as keyof typeof difficultyLabel]}
                </Badge>
                <Badge variant="outline">{lesson.xp_reward} XP</Badge>
                {alreadyCompleted && (
                  <Badge variant="secondary" className="gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" /> Completed
                  </Badge>
                )}
              </div>

              {lesson.description && (
                <p className="mt-6 text-lg text-muted-foreground">{lesson.description}</p>
              )}

              {lesson.content && (
                <div className="mt-6 rounded-xl border border-border bg-muted/40 p-6">
                  <p className="leading-relaxed whitespace-pre-line">{lesson.content}</p>
                </div>
              )}

              <Button
                variant="brand"
                className="mt-8 w-full"
                disabled={completing}
                onClick={handleComplete}
              >
                {alreadyCompleted ? 'Redo this lesson' : completing ? 'Saving…' : 'Mark lesson complete'}
              </Button>
            </Reveal>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
