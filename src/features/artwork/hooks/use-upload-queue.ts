import { useCallback, useRef, useState } from 'react'
import { uploadArtworkImage, createArtwork } from '@/features/artwork/api'
import type { ArtworkVisibility } from '@/features/artwork/types'

export type QueueItemStatus = 'pending' | 'uploading' | 'done' | 'error' | 'cancelled'

export type QueueItem = {
  id: string
  file: File
  progress: number
  status: QueueItemStatus
  error?: string
}

type SharedMetadata = {
  medium?: string
  tags: string[]
  visibility: ArtworkVisibility
}

function filenameToTitle(name: string) {
  return name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Untitled'
}

/** Manages a queue of files being uploaded as individual artworks, with
 *  real per-file progress, retry, and cancel — no simulated/fake progress. */
export function useUploadQueue() {
  const [items, setItems] = useState<QueueItem[]>([])
  const cancelFns = useRef(new Map<string, () => void>())

  const addFiles = useCallback((files: File[]) => {
    const newItems: QueueItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending',
    }))
    setItems((prev) => [...prev, ...newItems])
  }, [])

  const removeItem = useCallback((id: string) => {
    cancelFns.current.get(id)?.()
    cancelFns.current.delete(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const uploadOne = useCallback(
    async (item: QueueItem, ownerId: string, metadata: SharedMetadata) => {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 0, error: undefined } : i)),
      )
      try {
        const upload = uploadArtworkImage(ownerId, item.file, (percent) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress: percent } : i)))
        })
        cancelFns.current.set(item.id, upload.cancel)
        const { publicUrl } = await upload.done

        await createArtwork({
          ownerId,
          title: filenameToTitle(item.file.name),
          description: null,
          medium: metadata.medium ?? null,
          tags: metadata.tags,
          visibility: metadata.visibility,
          imagePublicUrl: publicUrl,
        })

        cancelFns.current.delete(item.id)
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'done', progress: 100 } : i)))
      } catch (error) {
        const isCancelled = error instanceof DOMException && error.name === 'AbortError'
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: isCancelled ? 'cancelled' : 'error',
                  error: isCancelled ? undefined : (error as Error).message,
                }
              : i,
          ),
        )
      }
    },
    [],
  )

  const uploadAll = useCallback(
    async (ownerId: string, metadata: SharedMetadata) => {
      const pending = items.filter((i) => i.status === 'pending' || i.status === 'error')
      await Promise.all(pending.map((item) => uploadOne(item, ownerId, metadata)))
    },
    [items, uploadOne],
  )

  const retry = useCallback(
    (id: string, ownerId: string, metadata: SharedMetadata) => {
      const item = items.find((i) => i.id === id)
      if (item) void uploadOne(item, ownerId, metadata)
    },
    [items, uploadOne],
  )

  const cancel = useCallback((id: string) => {
    cancelFns.current.get(id)?.()
  }, [])

  const reset = useCallback(() => {
    cancelFns.current.forEach((fn) => fn())
    cancelFns.current.clear()
    setItems([])
  }, [])

  return { items, addFiles, removeItem, uploadAll, retry, cancel, reset }
}
