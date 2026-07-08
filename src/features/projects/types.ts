import type { Database } from '@/types/database'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectMember = Database['public']['Tables']['project_members']['Row']
