import { supabase } from '@/lib/supabase'
import type { MemberProfile, Project, ProjectInsert } from './types'

const OWNER_SELECT = 'profiles!projects_owner_id_fkey(id, username, display_name, avatar_url)'

/** Projects I own or have been added to (the owner also has a member row, written by a trigger). */
export async function listProjects(userId: string) {
  const { data: memberships, error: memberError } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId)
  if (memberError) throw memberError

  const ids = memberships.map((m) => m.project_id)
  const scope = ids.length > 0 ? `owner_id.eq.${userId},id.in.(${ids.join(',')})` : `owner_id.eq.${userId}`

  const { data, error } = await supabase
    .from('projects')
    .select(`*, ${OWNER_SELECT}, project_members(*)`)
    .or(scope)
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

export class ProjectLimitError extends Error {
  constructor() {
    super('You have used all your project slots.')
    this.name = 'ProjectLimitError'
  }
}

/** The database trigger refuses a project beyond the free 3 + paid slots; the owner is added as a
 *  member by a trigger in the same transaction. */
export async function createProject(input: ProjectInsert) {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()
  if (error) {
    if (error.message.includes('PROJECT_LIMIT_REACHED')) throw new ProjectLimitError()
    throw error
  }
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

/** Find people to add by username or display name. Profiles are public, so this needs no special access. */
export async function searchProfiles(query: string, excludeIds: string[] = []) {
  // Strip characters that mean something inside a PostgREST filter or an ILIKE pattern.
  const q = query.trim().replace(/[%_,()*\\]/g, '')
  if (q.length < 2) return [] as MemberProfile[]
  let request = supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(8)
  if (excludeIds.length > 0) request = request.not('id', 'in', `(${excludeIds.join(',')})`)
  const { data, error } = await request
  if (error) throw error
  return data as MemberProfile[]
}
