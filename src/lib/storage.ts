import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/lib/supabase'

export type UploadHandle = {
  /** Resolves with the storage path once the upload completes. */
  done: Promise<string>
  cancel: () => void
}

/**
 * Uploads a file to Supabase Storage with real byte-level progress via XHR —
 * supabase-js's own `.upload()` is a single opaque fetch with no progress
 * events, which would make a "real" progress bar impossible.
 */
export function uploadWithProgress(
  bucket: string,
  path: string,
  file: File,
  onProgress: (percent: number) => void,
): UploadHandle {
  const xhr = new XMLHttpRequest()

  const done = new Promise<string>((resolve, reject) => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) {
        reject(new Error('Not signed in.'))
        return
      }

      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
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

      xhr.onerror = () => reject(new Error('Upload failed — network error.'))
      xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))

      xhr.send(file)
    }, reject)
  })

  return { done, cancel: () => xhr.abort() }
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
