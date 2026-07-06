import { supabase } from '@/lib/supabase'
import { buildStoragePath, deleteFromStorage, getPublicUrl, uploadWithProgress } from '@/lib/storage'
import { optimizeImage } from '@/lib/image-optimize'
import type { TablesInsert, TablesUpdate } from '@/types/database'
import type { ArtworkWithOwner, ArtworkVisibility, Collection } from './types'

const ARTWORK_BUCKET = 'artworks'
const OWNER_SELECT = 'profiles!artworks_owner_id_fkey(id, username, display_name, avatar_url)'

export const PAGE_SIZE = 24

type ListArtworksParams = {
  ownerId?: string
  visibility?: ArtworkVisibility
  search?: string
  medium?: string
  tag?: string
  collectionId?: string
  page: number
}

export async function listArtworks({
  ownerId,
  visibility,
  search,
  medium,
  tag,
  collectionId,
  page,
}: ListArtworksParams) {
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const embed = collectionId
    ? `*, ${OWNER_SELECT}, artwork_collections!inner(collection_id)`
    : `*, ${OWNER_SELECT}`

  let query = supabase
    .from('artworks')
    .select(embed)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (ownerId) query = query.eq('owner_id', ownerId)
  if (visibility) query = query.eq('visibility', visibility)
  if (medium) query = query.eq('medium', medium)
  if (tag) query = query.contains('tags', [tag])
  if (collectionId) query = query.eq('artwork_collections.collection_id', collectionId)
  if (search?.trim()) {
    const term = search.trim()
    query = query.or(`title.ilike.%${term}%,tags.cs.{${term}}`)
  }

  const { data, error } = await query
  if (error) throw error
  return { items: (data ?? []) as unknown as ArtworkWithOwner[], hasMore: (data?.length ?? 0) === PAGE_SIZE }
}

/** Distinct mediums/tags across an owner's own artwork, for building real filter facets. */
export async function getOwnerFacets(ownerId: string) {
  const { data, error } = await supabase.from('artworks').select('medium, tags').eq('owner_id', ownerId)
  if (error) throw error
  const mediums = new Set<string>()
  const tags = new Set<string>()
  for (const row of data ?? []) {
    if (row.medium) mediums.add(row.medium)
    for (const tag of row.tags ?? []) tags.add(tag)
  }
  return { mediums: [...mediums].sort(), tags: [...tags].sort() }
}

export async function listCollections(ownerId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Collection[]
}

export async function createCollection(ownerId: string, name: string, description?: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert({ owner_id: ownerId, name, description: description || null })
    .select()
    .single()
  if (error) throw error
  return data as Collection
}

export async function deleteCollection(id: string) {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw error
}

export async function getArtworkCollectionIds(artworkId: string) {
  const { data, error } = await supabase
    .from('artwork_collections')
    .select('collection_id')
    .eq('artwork_id', artworkId)
  if (error) throw error
  return (data ?? []).map((r) => r.collection_id)
}

export async function addArtworksToCollection(artworkIds: string[], collectionId: string) {
  const rows = artworkIds.map((artwork_id) => ({ artwork_id, collection_id: collectionId }))
  const { error } = await supabase
    .from('artwork_collections')
    .upsert(rows, { onConflict: 'artwork_id,collection_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function setArtworkCollections(artworkId: string, collectionIds: string[]) {
  await supabase.from('artwork_collections').delete().eq('artwork_id', artworkId)
  if (collectionIds.length === 0) return
  const rows = collectionIds.map((collection_id) => ({ artwork_id: artworkId, collection_id }))
  const { error } = await supabase.from('artwork_collections').insert(rows)
  if (error) throw error
}

export async function bulkUpdateVisibility(ids: string[], visibility: ArtworkVisibility) {
  const { error } = await supabase.from('artworks').update({ visibility }).in('id', ids)
  if (error) throw error
}

export async function bulkDeleteArtworks(ids: string[], ownerId: string) {
  await Promise.all(ids.map((id) => deleteArtwork(id, ownerId)))
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
