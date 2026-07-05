import { Flame } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/features/shell/components/empty-state'

export function QuestsPage() {
  return (
    <EmptyState
      icon={<Flame className="size-6" />}
      title="Start your first quest"
      description="Structured challenges that reward showing up — XP, badges, streaks. You haven't joined one yet."
      action={
        <Button variant="brand" onClick={() => toast('Quests are landing in the next update.')}>
          Browse quests
        </Button>
      }
    />
  )
}
