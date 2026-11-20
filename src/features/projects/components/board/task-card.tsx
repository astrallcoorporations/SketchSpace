import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { MemberProfile, Task } from '@/features/projects/types'

function initials(m: MemberProfile) {
  return (m.display_name || m.username).slice(0, 2).toUpperCase()
}

type CardViewProps = {
  task: Task
  assignee: MemberProfile | undefined
  pending?: boolean
  overlay?: boolean
  dragging?: boolean
}

/** Pure presentation, shared by the in-column card and the drag overlay. */
export const TaskCardView = memo(function TaskCardView({ task, assignee, pending, overlay, dragging }: CardViewProps) {
  return (
    <div
      className={cn(
        'flex min-h-[4.5rem] items-start gap-2 rounded-md border-2 border-border bg-pass-v3 p-3 text-left transition-[border-color,opacity,background-color] duration-150',
        'hover:border-ink-violet-light',
        pending && 'opacity-60',
        dragging && 'opacity-30',
        overlay && 'cursor-grabbing border-ink-magenta shadow-lg',
      )}
    >
      <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words text-sm font-medium">{task.title}</p>
        {task.description && (
          <p className="mt-1 line-clamp-2 break-words text-xs text-muted-foreground">{task.description}</p>
        )}
      </div>
      {assignee && (
        <Avatar size="sm" title={assignee.display_name || assignee.username}>
          {assignee.avatar_url && <AvatarImage src={assignee.avatar_url} alt="" />}
          <AvatarFallback className="text-[10px]">{initials(assignee)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
})

type SortableProps = {
  task: Task
  assignee: MemberProfile | undefined
  pending: boolean
  onOpen: (task: Task) => void
}

export const SortableTaskCard = memo(function SortableTaskCard({ task, assignee, pending, onOpen }: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="list-none touch-manipulation"
    >
      {/* The whole card is the drag handle; Enter / click opens the editor. */}
      <div
        {...attributes}
        {...listeners}
        role="button"
        aria-roledescription="sortable task"
        aria-label={`${task.title}. Press space to pick up, arrow keys to move, space to drop. Press Enter to edit.`}
        onClick={() => onOpen(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onOpen(task)
            return
          }
          listeners?.onKeyDown?.(e)
        }}
        className="cursor-grab rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
      >
        <TaskCardView task={task} assignee={assignee} pending={pending} dragging={isDragging} />
      </div>
    </li>
  )
})
