import type { Session } from '@supabase/supabase-js'
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/supabase'

export type UploadHandle = {
  /** Resolves with the storage path once the upload completes. */
  done: Promise<string>
  cancel: () => void
}

const TOKEN_REFRESH_WINDOW_MS = 60_000

async function getUploadSession(): Promise<Session> {
  const { data: cached, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  const session = cached.session
  if (!session) {
    throw new Error('Sign in again before uploading.')
  }

  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
  if (expiresAt && expiresAt - Date.now() > TOKEN_REFRESH_WINDOW_MS) {
    return session
  }

  const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) throw refreshError
  if (!refreshed.session) {
    throw new Error('Your sign-in expired. Sign in again before uploading.')
  }

  return refreshed.session
}

function encodeStoragePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function validateStorageOwner(path: string, session: Session) {
  const ownerId = path.split('/')[0]
  if (!ownerId || ownerId !== session.user.id) {
    throw new Error('This upload path does not match the signed-in user.')
  }
}

/**
 * Uploads a file to Supabase Storage with real byte-level progress via XHR.
 * supabase-js's own `.upload()` is a single opaque fetch with no progress
 * events, which would make a real progress bar impossible.
 */
export function uploadWithProgress(
  bucket: string,
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): UploadHandle {
  const xhr = new XMLHttpRequest()
  let cancelled = false

  const done = new Promise<string>((resolve, reject) => {
    getUploadSession().then(
      (session) => {
        try {
          if (cancelled) {
            reject(new DOMException('Upload cancelled', 'AbortError'))
            return
          }

          validateStorageOwner(path, session)

          xhr.open(
            'POST',
            `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(path)}`,
          )
          xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
          xhr.setRequestHeader('apikey', SUPABASE_PUBLISHABLE_KEY)
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
          xhr.setRequestHeader('x-upsert', 'true')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              onProgress(Math.round((event.loaded / event.total) * 100))
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(path)
            } else {
              reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`))
            }
          }

          xhr.onerror = () => reject(new Error('Upload failed - network error.'))
          xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

          xhr.send(file)
        } catch (error) {
          reject(error)
        }
      },
      reject,
    )
  })

  return {
    done,
    cancel: () => {
      cancelled = true
      xhr.abort()
    },
  }
}

export function getPublicUrl(bucket: string, path: string): string {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export function deleteFromStorage(bucket: string, paths: string[]) {
  return supabase.storage.from(bucket).remove(paths)
}

/** Storage paths are namespaced "{userId}/{timestamp}-{sanitized filename}". */
export function buildStoragePath(userId: string, file: File): string {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${Date.now()}-${safeName}`
}
