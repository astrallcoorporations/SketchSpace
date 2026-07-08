import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/reveal'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Reveal className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand-muted-foreground transition-transform duration-300 hover:scale-105">
        {icon}
      </div>
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </Reveal>
  )
}
