import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { useAuth } from '@/hooks/use-auth'
import { getPathDetail } from '@/features/learning/api'
import { PathIcon } from '@/features/learning/components/path-icon'
import { LessonNode } from '@/features/learning/components/lesson-node'
import type { LearningPath, UnitWithLessons } from '@/features/learning/types'

const zigzagOffsets = [0, 40, 0, -40]

export function LearningPathPage() {
  const { pathSlug } = useParams<{ pathSlug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [path, setPath] = useState<LearningPath | null>(null)
  const [units, setUnits] = useState<UnitWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    if (!pathSlug) return
    setLoading(true)
    setNotFound(false)
    try {
      const result = await getPathDetail(pathSlug, user?.id)
      setPath(result.path)
      setUnits(result.units)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [pathSlug, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Skeleton className="h-4 w-20" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="size-14 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center gap-8">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="size-16 rounded-full" />
        </div>
      </div>
    )
  }

  if (notFound || !path) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted-foreground">This learning path doesn't exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/learning')}>
          Back to learning
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <Link
        to="/learning"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Learning
      </Link>

      <Reveal className="mt-6 flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-muted text-brand-muted-foreground">
          <PathIcon name={path.icon} className="size-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-medium">{path.title}</h1>
          <p className="text-sm text-muted-foreground">{path.description}</p>
        </div>
      </Reveal>

      <div className="mt-12 space-y-14">
        {units.map((unit) => (
          <div key={unit.id}>
            <h2 className="mb-8 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {unit.title}
            </h2>
            <div className="flex flex-col items-center gap-8">
              {unit.lessons.map((lesson, i) => (
                <LessonNode key={lesson.id} lesson={lesson} offset={zigzagOffsets[i % zigzagOffsets.length]} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
