import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload, FileIcon, X, Check, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { uploadSharedFile, type FileVisibility } from '@/features/file-sharing/api'
import { useAuth } from '@/hooks/use-auth'

export const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm',
  'application/zip',
  'text/plain', 'text/csv',
]

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB, matches the bucket limit

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type UploadItem = {
  id: string
  file: File
  visibility: FileVisibility
  progress: number
  status: 'uploading' | 'done' | 'error'
  error?: string
}

/**
 * Picking or dropping files starts the upload at once: no second "Upload" click.
 * Failed files stay in the list with a Retry; finished ones clear themselves.
 */
export function FileUploadZone({
  onUploaded,
  initialFiles,
}: {
  onUploaded: () => void
  /** Files dropped on the page before this panel was open. */
  initialFiles?: File[]
}) {
  const { user } = useAuth()
  const [visibility, setVisibility] = useState<FileVisibility>('unlisted')
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const cancelFns = useRef(new Map<string, () => void>())
  const consumedInitial = useRef<File[] | undefined>(undefined)

  const patch = useCallback((id: string, change: Partial<UploadItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...change } : i)))
  }, [])

  const run = useCallback(
    async (batch: UploadItem[]) => {
      if (!user) return
      let succeeded = 0
      await Promise.all(
        batch.map(async (item) => {
          patch(item.id, { status: 'uploading', progress: 0, error: undefined })
          try {
            const handle = uploadSharedFile(user.id, item.file, item.visibility, (pct) =>
              patch(item.id, { progress: pct }),
            )
            cancelFns.current.set(item.id, handle.cancel)
            await handle.done
            succeeded += 1
            patch(item.id, { status: 'done', progress: 100 })
            window.setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== item.id)), 1800)
          } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return
            patch(item.id, {
              status: 'error',
              error: err instanceof Error ? err.message.slice(0, 140) : 'Upload failed.',
            })
          } finally {
            cancelFns.current.delete(item.id)
          }
        }),
      )
      if (succeeded > 0) {
        toast.success(succeeded === 1 ? 'File uploaded.' : `${succeeded} files uploaded.`)
        onUploaded()
      }
    },
    [user, patch, onUploaded],
  )

  const addFiles = useCallback(
    (files: File[]) => {
      if (!user || files.length === 0) return
      const accepted: UploadItem[] = []
      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name} is not a supported type. Use images, PDF, video, zip or text.`)
        } else if (file.size > MAX_SIZE) {
          toast.error(`${file.name} is ${formatSize(file.size)}. The limit is 50 MB.`)
        } else {
          accepted.push({ id: crypto.randomUUID(), file, visibility, progress: 0, status: 'uploading' })
        }
      }
      if (accepted.length === 0) return
      setItems((prev) => [...prev, ...accepted])
      void run(accepted)
    },
    [user, visibility, run],
  )

  useEffect(() => {
    if (initialFiles && initialFiles !== consumedInitial.current) {
      consumedInitial.current = initialFiles
      addFiles(initialFiles)
    }
  }, [initialFiles, addFiles])

  function removeItem(id: string) {
    cancelFns.current.get(id)?.()
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function retry(item: UploadItem) {
    void run([item])
  }

  return (
    <div className="space-y-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm text-muted-foreground">Who can find new uploads</legend>
        {(
          [
            ['unlisted', 'Link only'],
            ['public', 'Everyone can browse'],
          ] as const
        ).map(([value, label]) => (
          <label
            key={value}
            className={cn(
              'cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-magenta-light',
              visibility === value
                ? 'border-ink-magenta-light bg-pass-v3 text-foreground'
                : 'border-pass-v1 text-muted-foreground hover:border-input hover:bg-pass-v2',
            )}
          >
            <input
              type="radio"
              name="file-visibility"
              value={value}
              checked={visibility === value}
              onChange={() => setVisibility(value)}
              className="sr-only"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <label
        htmlFor="file-upload-input"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)) }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-magenta-light',
          isDragging ? 'border-ink-magenta-light bg-pass-v3' : 'border-pass-v1 hover:border-input hover:bg-pass-v4',
        )}
      >
        <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
        <div className="text-sm">
          <span className="font-medium text-foreground underline underline-offset-4">Choose files</span>
          <span className="text-muted-foreground"> or drop them here</span>
        </div>
        <p className="font-code text-[0.7rem] text-muted-foreground">PNG JPG WEBP GIF PDF MP4 WEBM ZIP TXT CSV · 50 MB max</p>
        <input
          id="file-upload-input"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="sr-only"
          onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
        />
      </label>

      {items.length > 0 && (
        <ul className="space-y-2" aria-live="polite">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-md border-2 border-pass-v1 bg-pass-v4 p-3">
              <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <div
                  className="mt-1.5 h-1 overflow-hidden rounded-full bg-pass-v2"
                  role="progressbar"
                  aria-label={`Uploading ${item.file.name}`}
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={cn('h-full origin-left rounded-full transition-[width] duration-200', item.status === 'error' ? 'bg-destructive' : 'bg-ink-violet-light')}
                    style={{ width: `${item.status === 'error' ? 100 : item.progress}%` }}
                  />
                </div>
                {item.status === 'error' && <p className="mt-1 text-xs text-destructive">{item.error}</p>}
              </div>
              <span className="font-code text-[0.7rem] text-muted-foreground">{formatSize(item.file.size)}</span>
              {item.status === 'done' && <Check className="size-4 text-emerald-400" aria-label="Uploaded" />}
              {item.status === 'error' && (
                <Button variant="ghost" size="icon" onClick={() => retry(item)} aria-label={`Retry ${item.file.name}`}>
                  <RotateCcw className="size-4" />
                </Button>
              )}
              {item.status !== 'done' && (
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label={`${item.status === 'uploading' ? 'Cancel' : 'Remove'} ${item.file.name}`}>
                  <X className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
