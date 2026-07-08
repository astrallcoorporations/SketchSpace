import { useState, useRef, useCallback } from 'react'
import { Upload, FileIcon, X, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { uploadSharedFile } from '@/features/file-sharing/api'
import { useAuth } from '@/hooks/use-auth'

const ACCEPTED_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'application/pdf',
  'video/mp4', 'video/webm',
  'application/zip',
  'text/plain', 'text/csv',
]

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type UploadItem = {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  url?: string
  error?: string
}

export function FileUploadZone({ onUploaded }: { onUploaded: () => void }) {
  const { user } = useAuth()
  const [items, setItems] = useState<UploadItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelFns = useRef(new Map<string, () => void>())

  function addFiles(fileList: FileList | null) {
    if (!fileList || !user) return
    const newItems: UploadItem[] = Array.from(fileList)
      .filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) {
          toast.error(`${f.name}: unsupported format.`)
          return false
        }
        if (f.size > MAX_SIZE) {
          toast.error(`${f.name}: too large (${formatSize(f.size)}). Max 50 MB.`)
          return false
        }
        return true
      })
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending' as const,
      }))
    setItems((prev) => [...prev, ...newItems])
  }

  const uploadAll = useCallback(async () => {
    if (!user) return
    const pending = items.filter((i) => i.status === 'pending')
    await Promise.all(
      pending.map(async (item) => {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading', progress: 0 } : i)),
        )
        try {
          const handle = uploadSharedFile(user.id, item.file, (pct) => {
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, progress: pct } : i)),
            )
          })
          cancelFns.current.set(item.id, handle.cancel)
          const result = await handle.done
          cancelFns.current.delete(item.id)
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'done', url: result.url } : i)),
          )
        } catch (err) {
          const isCancelled = err instanceof DOMException && err.name === 'AbortError'
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: isCancelled ? 'pending' : 'error', error: isCancelled ? undefined : (err as Error).message }
                : i,
            ),
          )
          cancelFns.current.delete(item.id)
        }
      }),
    )
    onUploaded()
  }, [user, items, onUploaded])

  function removeItem(id: string) {
    cancelFns.current.get(id)?.()
    cancelFns.current.delete(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const hasPending = items.some((i) => i.status === 'pending')

  return (
    <div className="space-y-4">
      <label
        htmlFor="file-upload-input"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files) }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-brand bg-brand-muted' : 'border-border hover:border-brand/50',
        )}
      >
        <Upload className={cn('size-8', isDragging ? 'text-brand' : 'text-muted-foreground')} />
        <div>
          <span className="font-medium text-brand hover:underline">Choose files</span>
          <span className="text-muted-foreground"> or drag and drop — max 50 MB</span>
        </div>
        <input
          ref={inputRef}
          id="file-upload-input"
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="sr-only"
          onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
        />
      </label>

      {items.length > 0 && (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.status === 'error' ? 'bg-destructive' : 'bg-brand',
                      )}
                      style={{ width: `${item.status === 'done' ? 100 : item.progress}%` }}
                    />
                  </div>
                  {item.status === 'error' && (
                    <p className="mt-1 text-xs text-destructive">{item.error ?? 'Upload failed'}</p>
                  )}
                  {item.status === 'done' && item.url && (
                    <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="size-3" /> Uploaded
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatSize(item.file.size)}</span>
                <Button variant="ghost" size="icon-sm" onClick={() => removeItem(item.id)}>
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button variant="brand" className="w-full" disabled={!hasPending} onClick={uploadAll}>
            Upload {items.filter((i) => i.status === 'pending').length} file{items.filter((i) => i.status === 'pending').length !== 1 ? 's' : ''}
          </Button>
        </>
      )}
    </div>
  )
}
