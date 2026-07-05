import { supabase } from '@/lib/supabase'
import { buildStoragePath, deleteFromStorage, getPublicUrl, uploadWithProgress } from '@/lib/storage'
import { optimizeImage } from '@/lib/image-optimize'
import type { TablesInsert, TablesUpdate } from '@/types/database'
import type { ArtworkWithOwner, ArtworkVisibility } from './types'

const ARTWORK_BUCKET = 'artworks'
const OWNER_SELECT = 'profiles!artworks_owner_id_fkey(id, username, display_name, avatar_url)'

export const PAGE_SIZE = 24

type ListArtworksParams = {
  ownerId?: string
  visibility?: ArtworkVisibility
  search?: string
  page: number
}

export async function listArtworks({ ownerId, visibility, search, page }: ListArtworksParams) {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('artworks')
    .select(`*, ${OWNER_SELECT}`)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (ownerId) query = query.eq('owner_id', ownerId)
  if (visibility) query = query.eq('visibility', visibility)
  if (search?.trim()) {
    const term = search.trim()
    query = query.or(`title.ilike.%${term}%,tags.cs.{${term}}`)
  }

  const { data, error } = await query
  if (error) throw error
  return { items: (data ?? []) as unknown as ArtworkWithOwner[], hasMore: (data?.length ?? 0) === PAGE_SIZE }
}

export async function getArtwork(id: string) {
  const { data, error } = await supabase
    .from('artworks')
    .select(`*, ${OWNER_SELECT}`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as unknown as ArtworkWithOwner
}

export async function getArtworkVersions(artworkId: string) {
  const { data, error } = await supabase
    .from('artwork_versions')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return data
}

/**
 * Optimizes, then uploads to Storage. Returns a handle immediately so the
 * caller can cancel during either the (fast, local) optimize step or the
 * in-flight network upload — cancel() is wired up before either has run.
 */
export function uploadArtworkImage(
  ownerId: string,
  file: File,
  onProgress: (percent: number) => void,
): { done: Promise<{ path: string; publicUrl: string }>; cancel: () => void } {
  let cancelled = false
  let cancelUpload: (() => void) | null = null

  const done = (async () => {
    const optimized = await optimizeImage(file)
    if (cancelled) throw new DOMException('Upload cancelled', 'AbortError')

    const path = buildStoragePath(ownerId, optimized)
    const handle = uploadWithProgress(ARTWORK_BUCKET, path, optimized, onProgress)
    cancelUpload = handle.cancel
    const resultPath = await handle.done
    return { path: resultPath, publicUrl: getPublicUrl(ARTWORK_BUCKET, resultPath) }
  })()

  return {
    done,
    cancel: () => {
      cancelled = true
      cancelUpload?.()
    },
  }
}

type CreateArtworkInput = Pick<
  TablesInsert<'artworks'>,
  'title' | 'description' | 'medium' | 'tags' | 'visibility'
> & {
  ownerId: string
  imagePublicUrl: string
}

export async function createArtwork(input: CreateArtworkInput) {
  const { data: artwork, error } = await supabase
    .from('artworks')
    .insert({
      owner_id: input.ownerId,
      title: input.title,
      description: input.description ?? null,
      medium: input.medium ?? null,
      tags: input.tags ?? [],
      visibility: input.visibility ?? 'private',
      cover_image_url: input.imagePublicUrl,
    })
    .select()
    .single()
  if (error) throw error

  const { error: versionError } = await supabase.from('artwork_versions').insert({
    artwork_id: artwork.id,
    image_url: input.imagePublicUrl,
    version_number: 1,
  })
  if (versionError) throw versionError

  return artwork
}

export async function addArtworkVersion(artworkId: string, imagePublicUrl: string, note?: string) {
  const { count } = await supabase
    .from('artwork_versions')
    .select('*', { count: 'exact', head: true })
    .eq('artwork_id', artworkId)

  const { error } = await supabase.from('artwork_versions').insert({
    artwork_id: artworkId,
    image_url: imagePublicUrl,
    version_number: (count ?? 0) + 1,
    note: note ?? null,
  })
  if (error) throw error

  await supabase.from('artworks').update({ cover_image_url: imagePublicUrl }).eq('id', artworkId)
}

export async function updateArtwork(id: string, patch: TablesUpdate<'artworks'>) {
  const { data, error } = await supabase.from('artworks').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteArtwork(id: string, ownerId: string) {
  const { data: versions } = await supabase
    .from('artwork_versions')
    .select('image_url')
    .eq('artwork_id', id)

  const { error } = await supabase.from('artworks').delete().eq('id', id)
  if (error) throw error

  // Best-effort cleanup — recover the storage path from the fixed
  // "/object/public/{bucket}/" prefix every Supabase public URL uses.
  const publicPrefix = `/object/public/${ARTWORK_BUCKET}/`
  const paths = (versions ?? [])
    .map((v) => {
      const index = v.image_url.indexOf(publicPrefix)
      return index === -1 ? null : v.image_url.slice(index + publicPrefix.length)
    })
    .filter((p): p is string => p !== null && p.startsWith(`${ownerId}/`))
  if (paths.length) await deleteFromStorage(ARTWORK_BUCKET, paths)
}
