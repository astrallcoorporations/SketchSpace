import { useCallback, useEffect, useState } from 'react'
import { FileText, ExternalLink, Trash2, Copy, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { listSharedFiles, deleteSharedFile, type SharedFile } from '@/features/file-sharing/api'
import { FileUploadZone } from '@/features/file-sharing/components/file-upload-zone'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileRow({ file, onDelete }: { file: SharedFile; onDelete: (path: string) => void }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(file.url).then(() => {
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(file.size)} · {file.type.split('/')[1]?.toUpperCase() ?? file.type}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" onClick={copyLink} aria-label="Copy link">
          {copied ? <CheckCircle className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">
            <ExternalLink className="size-4" />
          </a>
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onDelete(file.path)} aria-label="Delete">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

export function SharedFilesPage() {
  const { user } = useAuth()
  const [files, setFiles] = useState<SharedFile[] | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    try {
      const data = await listSharedFiles(user.id)
      setFiles(data)
    } catch {
      toast.error('Failed to load shared files.')
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(path: string) {
    try {
      await deleteSharedFile(path)
      setFiles((prev) => (prev ?? []).filter((f) => f.path !== path))
      toast.success('File deleted.')
    } catch {
      toast.error('Failed to delete file.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium">Shared Files</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload and share files with public links.
            </p>
          </div>
          <Button variant="brand" onClick={() => setUploadOpen(!uploadOpen)}>
            {uploadOpen ? 'Close' : 'Upload file'}
          </Button>
        </div>
      </Reveal>

      {uploadOpen && (
        <div className="mt-6">
          <FileUploadZone onUploaded={load} />
        </div>
      )}

      {files === null ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No shared files"
          description="Upload a file to get a shareable link."
          action={
            <Button variant="brand" onClick={() => setUploadOpen(true)}>
              Upload file
            </Button>
          }
        />
      ) : (
        <div className="mt-8 space-y-3">
          {files.map((file) => (
            <FileRow key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
