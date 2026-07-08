import { useId, useRef, useState, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadDropzone({ onFilesAdded }: { onFilesAdded: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  function acceptFiles(fileList: FileList | null) {
    if (!fileList) return
    const valid: File[] = []
    for (const f of Array.from(fileList)) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast.error(`${f.name}: unsupported format. Use PNG, JPEG, or WebP.`)
        continue
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name}: too large (${formatSize(f.size)}). Max is 10 MB.`)
        continue
      }
      valid.push(f)
    }
    if (valid.length) onFilesAdded(valid)
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    acceptFiles(event.dataTransfer.files)
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50',
        isDragging ? 'border-brand bg-brand-muted' : 'border-border hover:border-brand/50',
      )}
    >
      <UploadCloud className={cn('size-8', isDragging ? 'text-brand' : 'text-muted-foreground')} />
      <div>
        <span className="font-medium text-brand hover:underline">Choose files</span>
        <span className="text-muted-foreground"> or drag and drop — PNG, JPEG, WebP, max 10 MB</span>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        className="sr-only"
        onChange={(e) => {
          acceptFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </label>
  )
}
