import { Users2 } from 'lucide-react'
import { EmptyState } from '@/features/shell/components/empty-state'

export function CommunityPage() {
  return (
    <EmptyState
      icon={<Users2 className="size-6" />}
      title="Community is warming up"
      description="Discover, follow, and critique other artists here. SketchSpace is early — this fills in as founding artists join."
    />
  )
}
