import { supabase } from '@/lib/supabase'
import type { Project, ProjectInsert } from './types'

const OWNER_SELECT = 'profiles!projects_owner_id_fkey(id, username, display_name, avatar_url)'

export async function listProjects(ownerId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`*, ${OWNER_SELECT}, project_members(*)`)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as (Project & {
    profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null }
    project_members: { id: string; user_id: string; role: string; joined_at: string }[]
  })[]
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`*, ${OWNER_SELECT}, project_members(*, profiles!project_members_user_id_fkey(id, username, display_name, avatar_url))`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as Project & {
    profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null }
    project_members: { id: string; user_id: string; role: string; joined_at: string; profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } }[]
  }
}

export async function createProject(input: ProjectInsert) {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()
  if (error) throw error

  // Auto-add owner as member with 'owner' role
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({ project_id: data.id, user_id: input.owner_id, role: 'owner' })
  if (memberError) throw memberError

  return data as Project
}

export async function updateProject(id: string, patch: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}

export async function addProjectMember(projectId: string, userId: string, role = 'member') {
  const { error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId, role })
  if (error) throw error
}

export async function removeProjectMember(projectId: string, userId: string) {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)
  if (error) throw error
}
