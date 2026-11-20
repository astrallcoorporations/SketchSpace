import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { getProject } from '@/features/projects/api'
import { createTask, deleteTask, listTasks, subscribeToTasks, updateTask } from '@/features/projects/tasks-api'
import { TASK_STATUSES, type MemberProfile, type Project, type Task, type TaskStatus } from '@/features/projects/types'

const GAP = 1024

export type BoardProject = Project & { members: MemberProfile[] }
export type TaskDraft = {
  title: string
  description: string | null
  status: TaskStatus
  assignee_id: string | null
}
export type Columns = Record<TaskStatus, Task[]>

type LoadState = { kind: 'loading' } | { kind: 'ready' } | { kind: 'missing' } | { kind: 'error' }

function byPosition(a: Task, b: Task) {
  return a.position - b.position || a.created_at.localeCompare(b.created_at)
}

export function groupTasks(tasks: Task[]): Columns {
  const cols: Columns = { todo: [], in_progress: [], review: [], done: [] }
  for (const t of tasks) (cols[t.status as TaskStatus] ?? cols.todo).push(t)
  for (const s of TASK_STATUSES) cols[s].sort(byPosition)
  return cols
}

/** Fractional position that lands `index` in `list` (the destination column without the moved task). */
export function positionAt(list: Task[], index: number) {
  const prev = list[index - 1]?.position
  const next = list[index]?.position
  if (prev !== undefined && next !== undefined) return (prev + next) / 2
  if (prev !== undefined) return prev + GAP
  if (next !== undefined) return next - GAP
  return GAP
}

export function useProjectBoard(projectId: string) {
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' })
  const [project, setProject] = useState<BoardProject | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  // Ids with a write in flight: a realtime echo of older data must not clobber the optimistic copy.
  const inFlight = useRef(new Map<string, number>())

  const markPending = useCallback((id: string, on: boolean) => {
    const n = (inFlight.current.get(id) ?? 0) + (on ? 1 : -1)
    if (n <= 0) inFlight.current.delete(id)
    else inFlight.current.set(id, n)
    setPending((prev) => {
      const next = new Set(prev)
      if (inFlight.current.has(id)) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoad({ kind: 'loading' })
    setTasks([])
    Promise.all([getProject(projectId), listTasks(projectId)])
      .then(([p, list]) => {
        if (cancelled) return
        const members = new Map<string, MemberProfile>()
        members.set(p.profiles.id, p.profiles)
        for (const m of p.project_members) if (m.profiles) members.set(m.user_id, m.profiles)
        setProject({ ...p, members: [...members.values()] })
        setTasks(list)
        setLoad({ kind: 'ready' })
      })
      .catch((e: { code?: string }) => {
        if (cancelled) return
        // PGRST116: no row visible (missing, or private and not yours).
        setLoad({ kind: e?.code === 'PGRST116' ? 'missing' : 'error' })
      })

    const unsubscribe = subscribeToTasks(projectId, {
      onUpsert: (task) => {
        if (inFlight.current.has(task.id)) return
        setTasks((prev) => {
          const i = prev.findIndex((t) => t.id === task.id)
          if (i === -1) return [...prev, task]
          if (prev[i].updated_at > task.updated_at) return prev
          const next = prev.slice()
          next[i] = task
          return next
        })
      },
      onDelete: (id) => {
        if (inFlight.current.has(id)) return
        setTasks((prev) => (prev.some((t) => t.id === id) ? prev.filter((t) => t.id !== id) : prev))
      },
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [projectId])

  const columns = useMemo(() => groupTasks(tasks), [tasks])
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  const add = useCallback(
    async (draft: TaskDraft) => {
      const col = columnsRef.current[draft.status]
      const now = new Date().toISOString()
      const task: Task = {
        id: crypto.randomUUID(),
        project_id: projectId,
        title: draft.title,
        description: draft.description,
        status: draft.status,
        assignee_id: draft.assignee_id,
        position: positionAt(col, col.length),
        created_at: now,
        updated_at: now,
      }
      setTasks((prev) => [...prev, task])
      markPending(task.id, true)
      try {
        const saved = await createTask({
          id: task.id,
          project_id: projectId,
          title: task.title,
          description: task.description,
          status: draft.status,
          assignee_id: task.assignee_id,
          position: task.position,
        })
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)))
      } catch (e) {
        setTasks((prev) => prev.filter((t) => t.id !== task.id))
        toast.error(e instanceof Error ? e.message : 'Could not add the task.')
      } finally {
        markPending(task.id, false)
      }
    },
    [projectId, markPending],
  )

  const patch = useCallback(
    async (id: string, changes: Partial<Pick<Task, 'title' | 'description' | 'status' | 'assignee_id' | 'position'>>) => {
      let before: Task | undefined
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t
          before = t
          return { ...t, ...changes }
        }),
      )
      markPending(id, true)
      try {
        const saved = await updateTask(id, changes)
        setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)))
      } catch (e) {
        const restore = before
        if (restore) setTasks((prev) => prev.map((t) => (t.id === id ? restore : t)))
        toast.error(e instanceof Error ? e.message : 'Could not save that change. It was put back.')
      } finally {
        markPending(id, false)
      }
    },
    [markPending],
  )

  /** Move to `status` so it sits at `index` among that column's other tasks. */
  const move = useCallback(
    (id: string, status: TaskStatus, index: number) => {
      const dest = columnsRef.current[status].filter((t) => t.id !== id)
      return patch(id, { status, position: positionAt(dest, Math.min(index, dest.length)) })
    },
    [patch],
  )

  const remove = useCallback(
    async (id: string) => {
      let before: Task | undefined
      setTasks((prev) => {
        before = prev.find((t) => t.id === id)
        return prev.filter((t) => t.id !== id)
      })
      markPending(id, true)
      try {
        await deleteTask(id)
      } catch (e) {
        const restore = before
        if (restore) setTasks((prev) => [...prev, restore])
        toast.error(e instanceof Error ? e.message : 'Could not delete the task. It was put back.')
      } finally {
        markPending(id, false)
      }
    },
    [markPending],
  )

  return { load, project, tasks, columns, pending, add, patch, move, remove }
}
