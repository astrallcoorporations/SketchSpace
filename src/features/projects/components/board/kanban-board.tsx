import { useCallback, useMemo, useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { BoardColumn } from './board-column'
import { TaskCardView } from './task-card'
import { groupTasks, type Columns } from '@/features/projects/hooks/use-project-board'
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  type MemberProfile,
  type Task,
  type TaskStatus,
} from '@/features/projects/types'

type Props = {
  tasks: Task[]
  columns: Columns
  members: ReadonlyMap<string, MemberProfile>
  pending: ReadonlySet<string>
  onMove: (id: string, status: TaskStatus, index: number) => void
  onOpen: (task: Task) => void
  onAdd: (status: TaskStatus) => void
}

const COLUMN_PREFIX = 'col:'

function statusOfId(id: string, tasks: Task[]): TaskStatus | null {
  if (id.startsWith(COLUMN_PREFIX)) return id.slice(COLUMN_PREFIX.length) as TaskStatus
  return (tasks.find((t) => t.id === id)?.status as TaskStatus | undefined) ?? null
}

export function KanbanBoard({ tasks, columns, members, pending, onMove, onOpen, onAdd }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  // While a card is dragged over another column it previews there; nothing is saved until drop.
  const [previewStatus, setPreviewStatus] = useState<TaskStatus | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const activeTask = useMemo(() => tasks.find((t) => t.id === activeId) ?? null, [tasks, activeId])

  // Columns as shown during a drag: the active card sits at the end of the previewed column.
  const shown = useMemo<Columns>(() => {
    if (!activeTask || !previewStatus || previewStatus === activeTask.status) return columns
    return groupTasks(
      tasks.map((t) => (t.id === activeTask.id ? { ...t, status: previewStatus, position: Number.MAX_SAFE_INTEGER } : t)),
    )
  }, [columns, tasks, activeTask, previewStatus])

  const handleStart = useCallback((e: DragStartEvent) => {
    setActiveId(String(e.active.id))
  }, [])

  const handleOver = useCallback(
    (e: DragOverEvent) => {
      if (!e.over) return
      const status = statusOfId(String(e.over.id), tasks)
      if (status) setPreviewStatus(status)
    },
    [tasks],
  )

  const handleEnd = useCallback(
    (e: DragEndEvent) => {
      const id = String(e.active.id)
      const over = e.over ? String(e.over.id) : null
      setActiveId(null)
      setPreviewStatus(null)
      const task = tasks.find((t) => t.id === id)
      if (!task || !over || over === id) return
      const status = statusOfId(over, tasks)
      if (!status) return

      // Index in the destination column once the dragged card is out of the way.
      const dest = (status === task.status ? columns[status] : shown[status]).filter((t) => t.id !== id)
      let index = dest.length
      if (!over.startsWith(COLUMN_PREFIX)) {
        const overIndex = dest.findIndex((t) => t.id === over)
        if (overIndex !== -1) {
          if (status === task.status) {
            const from = columns[status].findIndex((t) => t.id === id)
            const to = columns[status].findIndex((t) => t.id === over)
            // Same result as arrayMove(from, to): moving down lands after the target.
            index = arrayMove(columns[status], from, to).findIndex((t) => t.id === id)
          } else {
            index = overIndex
          }
        }
      }
      if (status === task.status && index === columns[status].findIndex((t) => t.id === id)) return
      onMove(id, status, index)
    },
    [columns, shown, tasks, onMove],
  )

  const handleCancel = useCallback(() => {
    setActiveId(null)
    setPreviewStatus(null)
  }, [])

  const announcements = useMemo<Announcements>(() => {
    const title = (id: string | number) => tasks.find((t) => t.id === id)?.title ?? 'task'
    const where = (id: string | number | undefined) => {
      if (id === undefined) return 'nowhere'
      const s = statusOfId(String(id), tasks)
      return s ? TASK_STATUS_LABEL[s] : 'the board'
    }
    return {
      onDragStart: ({ active }) => `Picked up ${title(active.id)}.`,
      onDragOver: ({ active, over }) => `${title(active.id)} is over ${where(over?.id)}.`,
      onDragEnd: ({ active, over }) => `${title(active.id)} dropped in ${where(over?.id)}.`,
      onDragCancel: ({ active }) => `Cancelled. ${title(active.id)} stays where it was.`,
    }
  }, [tasks])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleStart}
      onDragOver={handleOver}
      onDragEnd={handleEnd}
      onDragCancel={handleCancel}
      accessibility={{ announcements }}
    >
      <div className="grid auto-cols-[17rem] grid-flow-col items-start gap-4 overflow-x-auto pb-4 sm:auto-cols-[minmax(17rem,1fr)]">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={shown[status]}
            members={members}
            pending={pending}
            activeId={activeId}
            onOpen={onOpen}
            onAdd={onAdd}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 160 }}>
        {activeTask ? (
          <TaskCardView
            task={activeTask}
            assignee={activeTask.assignee_id ? members.get(activeTask.assignee_id) : undefined}
            overlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
