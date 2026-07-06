import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { FolderPlus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CollectionPickerDialog } from '@/features/artwork/components/collection-picker-dialog'
import { bulkDeleteArtworks, bulkUpdateVisibility } from '@/features/artwork/api'
import type { ArtworkVisibility } from '@/features/artwork/types'

export function BulkActionBar({
  ownerId,
  selectedIds,
  onClear,
  onChanged,
}: {
  ownerId: string
  selectedIds: string[]
  onClear: () => void
  onChanged: () => void
}) {
  const [collectionOpen, setCollectionOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleVisibility(visibility: ArtworkVisibility) {
    setBusy(true)
    try {
      await bulkUpdateVisibility(selectedIds, visibility)
      toast.success(`Updated ${selectedIds.length} artwork${selectedIds.length === 1 ? '' : 's'}.`)
      onChanged()
      onClear()
    } catch {
      toast.error('Could not update visibility.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await bulkDeleteArtworks(selectedIds, ownerId)
      toast(`Deleted ${selectedIds.length} artwork${selectedIds.length === 1 ? '' : 's'}.`)
      onChanged()
      onClear()
    } catch {
      toast.error('Could not delete all selected artwork.')
    } finally {
      setBusy(false)
      setDeleteOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-6 z-40 mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur-sm"
        >
          <span className="mr-1 text-sm font-medium">
            {selectedIds.length} selected
          </span>

          <Select disabled={busy} onValueChange={(v) => handleVisibility(v as ArtworkVisibility)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() => setCollectionOpen(true)}
          >
            <FolderPlus className="size-3.5" /> Add to collection
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>

          <Button variant="ghost" size="icon-sm" aria-label="Clear selection" onClick={onClear}>
            <X className="size-4" />
          </Button>

          <CollectionPickerDialog
            open={collectionOpen}
            onOpenChange={setCollectionOpen}
            ownerId={ownerId}
            artworkIds={selectedIds}
            onAdded={() => {
              onChanged()
              onClear()
            }}
          />

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedIds.length} artwork{selectedIds.length === 1 ? '' : 's'}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the selected artwork and all versions. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={busy}
                  onClick={(e) => {
                    e.preventDefault()
                    void handleDelete()
                  }}
                >
                  {busy ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
