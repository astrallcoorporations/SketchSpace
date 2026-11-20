import { supabase } from '@/lib/supabase'
import { buildStoragePath, deleteFromStorage, getPublicUrl, uploadWithProgress } from '@/lib/storage'

const SHARED_BUCKET = 'shared-files'

export type FileVisibility = 'public' | 'unlisted'

export type SharedFileOwner = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type SharedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  visibility: FileVisibility
  createdAt: string
  owner: SharedFileOwner | null
}

export type FileScope = 'mine' | 'everyone'

/**
 * Uploads to storage, then registers the file in `shared_files` so other
 * people can find it. If registration fails the orphaned object is removed.
 */
export function uploadSharedFile(
  ownerId: string,
  file: File,
  visibility: FileVisibility,
  onProgress: (percent: number) => void,
): { done: Promise<SharedFile>; cancel: () => void } {
  const path = buildStoragePath(ownerId, file)
  const handle = uploadWithProgress(SHARED_BUCKET, path, file, onProgress)

  const done = handle.done.then(async () => {
    const { data, error } = await supabase
      .from('shared_files')
      .insert({
        owner_id: ownerId,
        path,
        name: file.name,
        size: file.size,
        mime_type: file.type || 'application/octet-stream',
        visibility,
      })
      .select('id, created_at')
      .single()

    if (error) {
      await deleteFromStorage(SHARED_BUCKET, [path]).catch(() => undefined)
      throw error
    }

    return {
      id: data.id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: getPublicUrl(SHARED_BUCKET, path),
      path,
      visibility,
      createdAt: data.created_at,
      owner: null,
    } satisfies SharedFile
  })

  return { done, cancel: handle.cancel }
}

type Row = {
  id: string
  name: string
  size: number
  mime_type: string
  path: string
  visibility: string
  created_at: string
  owner: SharedFileOwner | null
}

const COLUMNS =
  'id, name, size, mime_type, path, visibility, created_at, owner:profiles!shared_files_owner_id_fkey(id, username, display_name, avatar_url)'

export async function listSharedFiles(scope: FileScope, ownerId: string): Promise<SharedFile[]> {
  let query = supabase.from('shared_files').select(COLUMNS).order('created_at', { ascending: false }).limit(200)
  query = scope === 'mine' ? query.eq('owner_id', ownerId) : query.eq('visibility', 'public')

  const { data, error } = await query.returns<Row[]>()
  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    size: row.size,
    type: row.mime_type,
    url: getPublicUrl(SHARED_BUCKET, row.path),
    path: row.path,
    visibility: row.visibility === 'unlisted' ? 'unlisted' : 'public',
    createdAt: row.created_at,
    owner: row.owner,
  }))
}

export async function setFileVisibility(id: string, visibility: FileVisibility) {
  const { error } = await supabase.from('shared_files').update({ visibility }).eq('id', id)
  if (error) throw error
}

export async function deleteSharedFile(file: Pick<SharedFile, 'id' | 'path'>) {
  const { error: storageError } = await deleteFromStorage(SHARED_BUCKET, [file.path])
  if (storageError) throw storageError
  const { error } = await supabase.from('shared_files').delete().eq('id', file.id)
  if (error) throw error
}
