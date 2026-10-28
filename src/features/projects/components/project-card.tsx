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
      className="group flex h-full flex-col rounded-md border-2 border-border bg-pass-v4 p-5 transition-colors duration-200 hover:border-ink-violet-light"
    >
      <div className="flex items-start gap-3">
        <FolderKanban className="mt-0.5 size-5 shrink-0 text-ink-violet-light" strokeWidth={1.75} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{project.name}</h3>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-4 pt-4 font-code text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" aria-hidden="true" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="capitalize">{project.visibility}</span>
      </div>
    </Link>
  )
}
