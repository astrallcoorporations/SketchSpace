import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus } from './types'

const TASK_COLUMNS = 'id, project_id, title, description, status, assignee_id, position, created_at, updated_at'

// A board holds the whole project in memory; this guards against a runaway project.
const MAX_TASKS = 1000

export async function listTasks(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .limit(MAX_TASKS)
  if (error) throw error
  return data as Task[]
}

export async function createTask(input: {
  id: string
  project_id: string
  title: string
  description: string | null
  status: TaskStatus
  assignee_id: string | null
  position: number
}): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select(TASK_COLUMNS).single()
  if (error) throw error
  return data as Task
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'description' | 'status' | 'assignee_id' | 'position'>>,
): Promise<Task> {
  const { data, error } = await supabase.from('tasks').update(patch).eq('id', id).select(TASK_COLUMNS).single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

/** Live task changes for one project. RLS decides which rows a member is sent. Returns an unsubscribe. */
export function subscribeToTasks(
  projectId: string,
  handlers: { onUpsert: (task: Task) => void; onDelete: (id: string) => void },
) {
  const channel = supabase
    .channel(`tasks:${projectId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id
          if (id) handlers.onDelete(id)
        } else {
          handlers.onUpsert(payload.new as Task)
        }
      },
    )
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}
