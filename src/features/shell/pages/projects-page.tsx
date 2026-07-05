import { FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/features/shell/components/empty-state'

export function ProjectsPage() {
  return (
    <EmptyState
      icon={<FolderKanban className="size-6" />}
      title="Create your first project"
      description="Recruit a team, plan the work on a real kanban board, and ship something together. You have no projects yet."
      action={
        <Button
          variant="brand"
          onClick={() => toast('Project creation is landing in the next update.')}
        >
          New project
        </Button>
      }
    />
  )
}
