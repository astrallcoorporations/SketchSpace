import { TrendingUp } from 'lucide-react'
import { EmptyState } from '@/features/shell/components/empty-state'

export function GrowthPage() {
  return (
    <EmptyState
      icon={<TrendingUp className="size-6" />}
      title="Your growth timeline starts with one upload"
      description="Every artwork you add becomes a point on your timeline — versions, monthly progress, streaks. Upload your first piece from the Studio to begin it."
    />
  )
}
