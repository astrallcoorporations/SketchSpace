import { memo, useMemo, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SortableTaskCard } from './task-card'
import { TASK_STATUS_LABEL, type MemberProfile, type Task, type TaskStatus } from '@/features/projects/types'

// Long columns render a page at a time so a 1000-task board stays cheap to render and to drag in.
const PAGE = 40

type Props = {
  status: TaskStatus
  tasks: Task[]
  members: ReadonlyMap<string, MemberProfile>
  pending: ReadonlySet<string>
  activeId: string | null
  onOpen: (task: Task) => void
  onAdd: (status: TaskStatus) => void
}

export const BoardColumn = memo(function BoardColumn({ status, tasks, members, pending, activeId, onOpen, onAdd }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` })
  const [limit, setLimit] = useState(PAGE)

  const visible = useMemo(() => {
    const shown = tasks.slice(0, limit)
    // The card being dragged must stay mounted even if it sits past the current page.
    if (activeId && !shown.some((t) => t.id === activeId)) {
      const active = tasks.find((t) => t.id === activeId)
      if (active) shown.push(active)
    }
    return shown
  }, [tasks, limit, activeId])
  const hidden = tasks.length - visible.length
  const ids = useMemo(() => visible.map((t) => t.id), [visible])

  return (
    <section
      aria-label={`${TASK_STATUS_LABEL[status]}, ${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
      className={cn(
        'flex min-h-[18rem] min-w-[17rem] flex-col rounded-md border-2 bg-pass-v4 transition-colors duration-150',
        isOver ? 'border-ink-violet-light' : 'border-border',
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 pt-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {TASK_STATUS_LABEL[status]}
          <span className="font-code text-xs font-normal text-muted-foreground">{tasks.length}</span>
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Add a task to ${TASK_STATUS_LABEL[status]}`}
          onClick={() => onAdd(status)}
        >
          <Plus />
        </Button>
      </header>

      <div ref={setNodeRef} className="flex flex-1 flex-col p-3">
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {visible.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                assignee={task.assignee_id ? members.get(task.assignee_id) : undefined}
                pending={pending.has(task.id)}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </SortableContext>

        {hidden > 0 && (
          <Button type="button" variant="ghost" size="sm" className="mt-2 self-center" onClick={() => setLimit((l) => l + PAGE)}>
            Show {Math.min(hidden, PAGE)} more
          </Button>
        )}

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={() => onAdd(status)}
            className="flex flex-1 items-center justify-center rounded-md border-2 border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground transition-colors hover:border-ink-violet-light hover:text-foreground"
          >
            Nothing here yet. Add a task or drop one in.
          </button>
        )}
      </div>
    </section>
  )
})
