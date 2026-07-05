import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TagInput } from '@/components/shared/tag-input'
import { updateArtwork } from '@/features/artwork/api'
import type { Artwork, ArtworkVisibility } from '@/features/artwork/types'

export function EditArtworkDialog({
  artwork,
  open,
  onOpenChange,
  onSaved,
}: {
  artwork: Artwork
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (updated: Artwork) => void
}) {
  const [title, setTitle] = useState(artwork.title)
  const [description, setDescription] = useState(artwork.description ?? '')
  const [medium, setMedium] = useState(artwork.medium ?? '')
  const [tags, setTags] = useState<string[]>(artwork.tags)
  const [visibility, setVisibility] = useState<ArtworkVisibility>(
    artwork.visibility as ArtworkVisibility,
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateArtwork(artwork.id, {
        title,
        description: description || null,
        medium: medium || null,
        tags,
        visibility,
      })
      onSaved(updated)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit artwork</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-medium">Medium</Label>
              <Input id="edit-medium" value={medium} onChange={(e) => setMedium(e.target.value)} />
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
            <TagInput value={tags} onChange={setTags} />
          </div>

          <Button variant="brand" className="w-full" disabled={saving || !title.trim()} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
