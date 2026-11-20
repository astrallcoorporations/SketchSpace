import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FolderKanban, Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/features/shell/components/empty-state'
import { Seo } from '@/components/shared/seo'
import { BoardSkeleton } from '@/features/projects/components/board/board-skeleton'
import { KanbanBoard } from '@/features/projects/components/board/kanban-board'
import { TaskDialog, type TaskDialogTarget } from '@/features/projects/components/board/task-dialog'
import { useProjectBoard, type TaskDraft } from '@/features/projects/hooks/use-project-board'
import type { Task, TaskStatus } from '@/features/projects/types'

export function ProjectBoardPage() {
  const { projectId = '' } = useParams()
  const board = useProjectBoard(projectId)
  const [dialog, setDialog] = useState<TaskDialogTarget | null>(null)
  const { add, patch, move, remove } = board

  const membersById = useMemo(
    () => new Map((board.project?.members ?? []).map((m) => [m.id, m])),
    [board.project],
  )

  const openTask = useCallback((task: Task) => setDialog({ mode: 'edit', task }), [])
  const addTo = useCallback((status: TaskStatus) => setDialog({ mode: 'create', status }), [])
  const closeDialog = useCallback(() => setDialog(null), [])
  const save = useCallback(
    (id: string, draft: TaskDraft) => {
      void patch(id, draft)
    },
    [patch],
  )
  const create = useCallback(
    (draft: TaskDraft) => {
      void add(draft)
    },
    [add],
  )
  const del = useCallback(
    (id: string) => {
      void remove(id)
    },
    [remove],
  )
  const moveTask = useCallback(
    (id: string, status: TaskStatus, index: number) => {
      void move(id, status, index)
    },
    [move],
  )

  if (board.load.kind === 'missing' || board.load.kind === 'error') {
    const missing = board.load.kind === 'missing'
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">
        <EmptyState
          icon={missing ? <SearchX className="size-6" /> : <FolderKanban className="size-6" />}
          title={missing ? 'Project not found' : 'Could not load this project'}
          description={
            missing
              ? 'It may have been deleted, or it is private to its members.'
              : 'Check your connection and reload the page.'
          }
          action={
            <Button asChild variant="outline">
              <Link to="/projects">Back to projects</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const project = board.project
  const ready = board.load.kind === 'ready' && project !== null

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6">
      <Seo title={project ? project.name : 'Project'} description="Project board" />
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Projects
      </Link>

      <div className="mt-3 flex min-h-14 flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {ready ? (
            <>
              <h1 className="truncate font-display text-2xl font-medium">{project.name}</h1>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                {project.description || 'No description yet.'}
              </p>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-80 max-w-full" />
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {ready && (
            <AvatarGroup aria-label={`${project.members.length} member${project.members.length === 1 ? '' : 's'}`}>
              {project.members.slice(0, 5).map((m) => (
                <Avatar key={m.id} size="sm" title={m.display_name || m.username}>
                  {m.avatar_url && <AvatarImage src={m.avatar_url} alt="" />}
                  <AvatarFallback className="text-[10px]">{(m.display_name || m.username).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>
          )}
          <Button variant="brand" disabled={!ready} onClick={() => addTo('todo')}>
            <Plus aria-hidden="true" />
            New task
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {!ready ? (
          <BoardSkeleton />
        ) : board.tasks.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-border px-6 py-14 text-center">
            <FolderKanban className="mx-auto size-6 text-ink-violet-light" aria-hidden="true" />
            <h2 className="mt-3 font-display text-xl font-medium">No tasks yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Break the project into tasks, assign them to members, and drag them across as work moves.
            </p>
            <Button variant="brand" className="mt-5" onClick={() => addTo('todo')}>
              Add the first task
            </Button>
          </div>
        ) : (
          <KanbanBoard
            tasks={board.tasks}
            columns={board.columns}
            members={membersById}
            pending={board.pending}
            onMove={moveTask}
            onOpen={openTask}
            onAdd={addTo}
          />
        )}
      </div>

      <TaskDialog
        target={dialog}
        members={project?.members ?? []}
        onClose={closeDialog}
        onCreate={create}
        onSave={save}
        onDelete={del}
      />
    </div>
  )
}
