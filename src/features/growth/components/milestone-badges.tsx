import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/features/growth/types'

export function MilestoneBadges({ milestones }: { milestones: Milestone[] }) {
  return (
    <StaggerGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {milestones.map((milestone) => (
        <motion.div
          key={milestone.id}
          variants={staggerItem}
          className={cn(
            'flex flex-col items-start gap-2 rounded-xl border p-4 transition-colors',
            milestone.achieved
              ? 'border-brand/30 bg-brand-muted'
              : 'border-border bg-muted/30 opacity-60',
          )}
        >
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-full',
              milestone.achieved ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {milestone.achieved ? <Check className="size-4" /> : <Lock className="size-3.5" />}
          </div>
          <div>
            <p className="text-sm font-medium">{milestone.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{milestone.description}</p>
          </div>
        </motion.div>
      ))}
    </StaggerGroup>
  )
}
