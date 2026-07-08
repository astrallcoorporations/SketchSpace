import { supabase } from '@/lib/supabase'
import { buildStoragePath, deleteFromStorage, getPublicUrl, uploadWithProgress } from '@/lib/storage'

const SHARED_BUCKET = 'shared-files'

export type SharedFile = {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  createdAt: string
}

export function uploadSharedFile(
  ownerId: string,
  file: File,
  onProgress: (percent: number) => void,
): { done: Promise<SharedFile>; cancel: () => void } {
  const path = buildStoragePath(ownerId, file)
  const handle = uploadWithProgress(SHARED_BUCKET, path, file, onProgress)

  const done = handle.done.then(() => ({
    id: path,
    name: file.name,
    size: file.size,
    type: file.type,
    url: getPublicUrl(SHARED_BUCKET, path),
    path,
    createdAt: new Date().toISOString(),
  }))

  return { done, cancel: handle.cancel }
}

export async function listSharedFiles(ownerId: string): Promise<SharedFile[]> {
  const { data, error } = await supabase.storage.from(SHARED_BUCKET).list(ownerId, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) throw error

  return (data ?? []).map((file) => ({
    id: `${ownerId}/${file.name}`,
    name: file.name.replace(/^\d+-/, ''),
    size: file.metadata?.size ?? 0,
    type: file.metadata?.mimetype ?? 'application/octet-stream',
    url: getPublicUrl(SHARED_BUCKET, `${ownerId}/${file.name}`),
    path: `${ownerId}/${file.name}`,
    createdAt: file.created_at ?? new Date().toISOString(),
  }))
}

export async function deleteSharedFile(path: string) {
  await deleteFromStorage(SHARED_BUCKET, [path])
}

export function getSharedFileUrl(path: string): string {
  return getPublicUrl(SHARED_BUCKET, path)
}
