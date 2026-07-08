import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Lock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonWithStatus } from '@/features/learning/types'

const difficultyLabel = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export function LessonNode({ lesson, offset }: { lesson: LessonWithStatus; offset: number }) {
  const isLocked = lesson.status === 'locked'
  const isCurrent = lesson.status === 'current'
  const isCompleted = lesson.status === 'completed'

  const node = (
    <motion.div
      whileHover={isLocked ? undefined : { scale: 1.06 }}
      whileTap={isLocked ? undefined : { scale: 0.96 }}
      className={cn(
        'relative flex size-16 shrink-0 items-center justify-center rounded-full border-4 shadow-[var(--shadow-sm)] transition-colors',
        isCompleted && 'border-emerald-500/30 bg-emerald-500 text-white',
        isCurrent && 'animate-pulse border-brand/30 bg-brand text-brand-foreground',
        isLocked && 'cursor-not-allowed border-border bg-muted text-muted-foreground',
      )}
    >
      {isCompleted ? (
        <Check className="size-6" />
      ) : isLocked ? (
        <Lock className="size-5" />
      ) : (
        <Star className="size-6" />
      )}
    </motion.div>
  )

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ marginLeft: `${offset}px`, marginRight: `${-offset}px` }}
    >
      {isLocked ? (
        <div
          role="img"
          aria-label={`${lesson.title} — locked`}
          className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:rounded-full"
          tabIndex={0}
        >
          {node}
        </div>
      ) : (
        <Link
          to={`/learning/lesson/${lesson.id}`}
          aria-label={lesson.title}
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {node}
        </Link>
      )}
      <div className="max-w-28 text-center">
        <p className="text-xs font-medium">{lesson.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {difficultyLabel[lesson.difficulty as keyof typeof difficultyLabel]} · {lesson.xp_reward} XP
        </p>
      </div>
    </div>
  )
}
