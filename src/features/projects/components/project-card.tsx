import { Link } from 'react-router-dom'
import { FolderKanban, Users } from 'lucide-react'
import type { Project } from '@/features/projects/types'

type ProjectCardProps = {
  project: Project & {
    profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null }
    project_members: { id: string; user_id: string; role: string; joined_at: string }[]
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const memberCount = project.project_members?.length ?? 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-2xl border border-border bg-background p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted text-brand-muted-foreground transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-[0_0_16px_-4px_var(--brand)]">
          <FolderKanban className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium transition-colors duration-200 group-hover:text-brand">{project.name}</h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
        <span className="capitalize">{project.visibility}</span>
      </div>
    </Link>
  )
}
