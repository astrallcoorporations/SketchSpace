import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import { addArtworksToCollection, createCollection, listCollections } from '@/features/artwork/api'
import type { Collection } from '@/features/artwork/types'

export function CollectionPickerDialog({
  open,
  onOpenChange,
  ownerId,
  artworkIds,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerId: string
  artworkIds: string[]
  onAdded: () => void
}) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    void listCollections(ownerId)
      .then(setCollections)
      .finally(() => setLoading(false))
  }, [open, ownerId])

  async function handleAdd(collectionId: string) {
    setAddingId(collectionId)
    try {
      await addArtworksToCollection(artworkIds, collectionId)
      toast.success(`Added to collection.`)
      onAdded()
      onOpenChange(false)
    } catch {
      toast.error('Could not add to that collection.')
    } finally {
      setAddingId(null)
    }
  }

  async function handleCreateAndAdd() {
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const collection = await createCollection(ownerId, name)
      await addArtworksToCollection(artworkIds, collection.id)
      toast.success(`Created "${name}" and added.`)
      onAdded()
      onOpenChange(false)
    } catch {
      toast.error('Could not create that collection.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add to collection</DialogTitle>
          <DialogDescription>
            {artworkIds.length} artwork{artworkIds.length === 1 ? '' : 's'} selected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collections yet — create your first one below.</p>
          ) : (
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={addingId === collection.id}
                    onClick={() => handleAdd(collection.id)}
                  >
                    {addingId === collection.id ? 'Adding…' : collection.name}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2 border-t border-border pt-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New collection name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreateAndAdd()
              }}
            />
            <Button
              type="button"
              variant="brand"
              size="icon"
              aria-label="Create collection"
              disabled={!newName.trim() || creating}
              onClick={handleCreateAndAdd}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
