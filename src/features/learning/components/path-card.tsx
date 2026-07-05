import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PathIcon } from './path-icon'
import type { PathProgress } from '@/features/learning/types'

export function PathCard({ path }: { path: PathProgress }) {
  const pct = path.totalLessons > 0 ? Math.round((path.completedLessons / path.totalLessons) * 100) : 0
  const isComplete = path.totalLessons > 0 && path.completedLessons === path.totalLessons

  return (
    <Link to={`/app/learning/${path.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
      >
        <div className="flex size-11 items-center justify-center rounded-xl bg-brand-muted text-brand-muted-foreground">
          <PathIcon name={path.icon} className="size-5" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 font-medium">{path.title}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{path.description}</p>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-brand'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {path.completedLessons}/{path.totalLessons} lessons
          </p>
        </div>
      </motion.div>
    </Link>
  )
}
