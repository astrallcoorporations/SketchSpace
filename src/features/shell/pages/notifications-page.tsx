import { Bell } from 'lucide-react'
import { EmptyState } from '@/features/shell/components/empty-state'

export function NotificationsPage() {
  return (
    <EmptyState
      icon={<Bell className="size-6" />}
      title="You're all caught up"
      description="Comments, follows, and quest milestones will show up here."
    />
  )
}
