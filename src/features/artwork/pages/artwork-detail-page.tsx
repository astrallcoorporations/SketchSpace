import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, EyeOff, Pencil, Trash2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Reveal } from '@/components/motion/reveal'
import { RouteLoader } from '@/components/layout/route-loader'
import { useAuth } from '@/hooks/use-auth'
import {
  addArtworkVersion,
  deleteArtwork,
  getArtwork,
  getArtworkVersions,
  uploadArtworkImage,
} from '@/features/artwork/api'
import { EditArtworkDialog } from '@/features/artwork/components/edit-artwork-dialog'
import type { Artwork, ArtworkWithOwner } from '@/features/artwork/types'
import type { Tables } from '@/types/database'

const visibilityMeta = {
  public: null,
  unlisted: { icon: EyeOff, label: 'Unlisted' },
  private: { icon: Lock, label: 'Private' },
} as const

export function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [artwork, setArtwork] = useState<ArtworkWithOwner | null>(null)
  const [versions, setVersions] = useState<Tables<'artwork_versions'>[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [addingVersion, setAddingVersion] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [artworkData, versionData] = await Promise.all([getArtwork(id), getArtworkVersions(id)])
      setArtwork(artworkData)
      setVersions(versionData)
    } catch {
      toast.error('Could not load this artwork.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <RouteLoader />
  if (!artwork) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="text-muted-foreground">This artwork doesn't exist or isn't visible to you.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/app/portfolio')}>
          Back to portfolio
        </Button>
      </div>
    )
  }

  const isOwner = user?.id === artwork.owner_id
  const visibility = visibilityMeta[artwork.visibility as keyof typeof visibilityMeta]

  async function handleDelete() {
    if (!user || !artwork) return
    setDeleting(true)
    try {
      await deleteArtwork(artwork.id, user.id)
      toast('Artwork deleted.')
      navigate('/app/portfolio')
    } catch {
      toast.error('Could not delete this artwork. Try again.')
      setDeleting(false)
    }
  }

  async function handleAddVersion(file: File) {
    if (!user || !artwork) return
    setAddingVersion(true)
    try {
      const upload = uploadArtworkImage(user.id, file, () => {})
      const { publicUrl } = await upload.done
      await addArtworkVersion(artwork.id, publicUrl)
      toast.success('New version added.')
      await load()
    } catch {
      toast.error('Could not add that version.')
    } finally {
      setAddingVersion(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <Link
        to="/app/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Portfolio
      </Link>

      <Reveal className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-muted">
          {artwork.cover_image_url && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full cursor-zoom-in"
              aria-label="Open full image"
            >
              <img src={artwork.cover_image_url} alt={artwork.title} className="w-full" />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-medium">{artwork.title}</h1>
              {visibility && (
                <Badge variant="secondary" className="gap-1">
                  <visibility.icon className="size-3" /> {visibility.label}
                </Badge>
              )}
            </div>
            {artwork.profiles && (
              <Link
                to={`/app/u/${artwork.profiles.username}`}
                className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground"
              >
                by {artwork.profiles.display_name || artwork.profiles.username}
              </Link>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>

        {artwork.description && (
          <p className="mt-4 max-w-2xl text-muted-foreground">{artwork.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {artwork.medium && <Badge variant="outline">{artwork.medium}</Badge>}
          {artwork.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Version history ({versions.length})
            </h2>
            {isOwner && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void handleAddVersion(file)
                    e.target.value = ''
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  disabled={addingVersion}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="size-3.5" /> {addingVersion ? 'Uploading…' : 'Add version'}
                </Button>
              </>
            )}
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {versions.map((version) => (
              <div key={version.id} className="w-28 shrink-0">
                <img
                  src={version.image_url}
                  alt={`Version ${version.version_number}`}
                  className="aspect-square w-full rounded-lg border border-border object-cover"
                />
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  v{version.version_number}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <EditArtworkDialog
        artwork={artwork}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated: Artwork) => setArtwork((prev) => (prev ? { ...prev, ...updated } : prev))}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this artwork?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{artwork.title}" and all its versions. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {lightboxOpen && artwork.cover_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="size-6" />
            </button>
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              src={artwork.cover_image_url}
              alt={artwork.title}
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
