import { useState } from 'react'
import { AlertCircle, Check, RotateCw, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/shared/tag-input'
import { useUploadQueue } from '@/features/artwork/hooks/use-upload-queue'
import { UploadDropzone } from '@/features/artwork/components/upload-dropzone'
import type { ArtworkVisibility } from '@/features/artwork/types'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

export function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploaded: () => void
}) {
  const { user } = useAuth()
  const { items, addFiles, removeItem, uploadAll, retry, cancel, reset } = useUploadQueue()
  const [medium, setMedium] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<ArtworkVisibility>('public')
  const [submitting, setSubmitting] = useState(false)

  const allDone = items.length > 0 && items.every((i) => i.status === 'done')

  async function handleUpload() {
    if (!user) return
    setSubmitting(true)
    await uploadAll(user.id, { medium: medium || undefined, tags, visibility })
    setSubmitting(false)
  }

  function handleClose(next: boolean) {
    if (!next) {
      reset()
      setMedium('')
      setTags([])
      setVisibility('public')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload artwork</DialogTitle>
          <DialogDescription>
            Drop one or more images. Each becomes its own artwork — you can retitle and
            organize them afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <UploadDropzone onFilesAdded={addFiles} />

          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                >
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
                      <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="size-3" /> {item.error ?? 'Upload failed'}
                      </p>
                    )}
                  </div>

                  {item.status === 'done' ? (
                    <Check className="size-4 shrink-0 text-emerald-500" />
                  ) : item.status === 'uploading' ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Cancel upload"
                      onClick={() => cancel(item.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  ) : item.status === 'error' ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Retry upload"
                      onClick={() => user && retry(item.id, user.id, { medium: medium || undefined, tags, visibility })}
                    >
                      <RotateCw className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="upload-medium">Medium</Label>
              <Input
                id="upload-medium"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                placeholder="Digital painting"
              />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as ArtworkVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} placeholder="Add tags…" />
          </div>

          {allDone ? (
            <Button
              variant="brand"
              className="w-full"
              onClick={() => {
                onUploaded()
                handleClose(false)
              }}
            >
              Done — view in portfolio
            </Button>
          ) : (
            <Button
              variant="brand"
              className="w-full"
              disabled={items.length === 0 || submitting}
              onClick={handleUpload}
            >
              {submitting ? 'Uploading…' : `Upload ${items.length || ''} artwork${items.length === 1 ? '' : 's'}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
