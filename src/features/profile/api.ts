import { supabase } from '@/lib/supabase'
import { buildStoragePath, deleteFromStorage, getPublicUrl, uploadWithProgress } from '@/lib/storage'
import { optimizeImage } from '@/lib/image-optimize'
import type { TablesUpdate } from '@/types/database'

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, patch: TablesUpdate<'profiles'>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

async function uploadProfileImage(bucket: 'avatars' | 'banners', userId: string, file: File) {
  const optimized = await optimizeImage(file, { maxDimension: bucket === 'avatars' ? 512 : 1600 })
  const path = buildStoragePath(userId, optimized)
  const handle = uploadWithProgress(bucket, path, optimized, () => {})
  await handle.done
  return getPublicUrl(bucket, path)
}

export async function uploadAvatar(userId: string, file: File) {
  const url = await uploadProfileImage('avatars', userId, file)
  return updateProfile(userId, { avatar_url: url })
}

export async function uploadBanner(userId: string, file: File) {
  const url = await uploadProfileImage('banners', userId, file)
  return updateProfile(userId, { banner_url: url })
}

export async function removeAvatar(userId: string, currentUrl: string | null) {
  if (currentUrl) {
    const path = extractStoragePath('avatars', currentUrl, userId)
    if (path) await deleteFromStorage('avatars', [path])
  }
  return updateProfile(userId, { avatar_url: null })
}

function extractStoragePath(bucket: string, publicUrl: string, ownerId: string) {
  const prefix = `/object/public/${bucket}/`
  const index = publicUrl.indexOf(prefix)
  if (index === -1) return null
  const path = publicUrl.slice(index + prefix.length)
  return path.startsWith(`${ownerId}/`) ? path : null
}

export async function getFollowCounts(userId: string) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

export async function isFollowing(viewerId: string, targetId: string) {
  const { data } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('follower_id', viewerId)
    .eq('following_id', targetId)
    .maybeSingle()
  return Boolean(data)
}

export async function followUser(viewerId: string, targetId: string) {
  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: viewerId, following_id: targetId })
  if (error) throw error
}

export async function unfollowUser(viewerId: string, targetId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', viewerId)
    .eq('following_id', targetId)
  if (error) throw error
}
