import { useCallback, useEffect, useState } from 'react'
import { FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal, StaggerGroup } from '@/components/motion/reveal'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { listProjects } from '@/features/projects/api'
import { ProjectCard } from '@/features/projects/components/project-card'
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog'
import type { Project } from '@/features/projects/types'

type ProjectWithMembers = Project & {
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null }
  project_members: { id: string; user_id: string; role: string; joined_at: string }[]
}

export function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectWithMembers[] | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const data = await listProjects(user.id)
      setProjects(data)
    } catch {
      toast.error('Failed to load projects.')
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Collaborate on creative projects with your team.
            </p>
          </div>
          <Button variant="brand" onClick={() => setCreateOpen(true)}>
            New project
          </Button>
        </div>
      </Reveal>

      {projects === null ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="size-6" />}
          title="Create your first project"
          description="Recruit a team, plan the work, and ship something together."
          action={
            <Button variant="brand" onClick={() => setCreateOpen(true)}>
              New project
            </Button>
          }
        />
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </StaggerGroup>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />
    </div>
  )
}
