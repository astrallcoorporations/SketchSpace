import type { Database } from '@/types/database'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']

export const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
}

export type MemberProfile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type ProjectQuota = {
  owned: number
  free_limit: number
  paid_slots: number
  allowed: number
  free_remaining: number
  slots_remaining: number
  can_create: boolean
  price_paise: number
  currency: 'INR'
}
