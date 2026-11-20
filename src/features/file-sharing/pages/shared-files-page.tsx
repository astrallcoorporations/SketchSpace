import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, ExternalLink, Trash2, Copy, Check, Globe, Link2, RefreshCw, Search, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Reveal } from '@/components/motion/reveal'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import {
  listSharedFiles,
  deleteSharedFile,
  setFileVisibility,
  type FileScope,
  type SharedFile,
} from '@/features/file-sharing/api'
import { FileUploadZone, formatSize } from '@/features/file-sharing/components/file-upload-zone'

const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

type Sort = 'newest' | 'name' | 'size'

function typeLabel(type: string) {
  return type.split('/')[1]?.toUpperCase() ?? type
}

function FileRow({
  file,
  mine,
  onDelete,
  onToggleVisibility,
}: {
  file: SharedFile
  mine: boolean
  onDelete: (file: SharedFile) => void
  onToggleVisibility: (file: SharedFile) => void
}) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(file.url)
      setCopied(true)
      toast.success('Link copied.')
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy. Open the file and copy the address from there.')
    }
  }

  const isImage = file.type.startsWith('image/')
  const ownerName = file.owner?.display_name || file.owner?.username

  return (
    <li className="group flex items-center gap-3 rounded-md border-2 border-pass-v1 bg-pass-v4 p-3 transition-colors duration-200 hover:border-ink-violet-light/60 sm:p-4">
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${file.name} in a new tab`}
        className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-pass-v3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink-magenta-light"
      >
        {isImage ? (
          <img src={file.url} alt="" loading="lazy" decoding="async" width={56} height={56} className="size-full object-cover" />
        ) : (
          <FileText className="size-5 text-muted-foreground" aria-hidden="true" />
        )}
      </a>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{file.name}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-code text-[0.7rem]">{typeLabel(file.type)}</span>
          <span className="font-code text-[0.7rem]">{formatSize(file.size)}</span>
          <span className="font-code text-[0.7rem]">{dateFormat.format(new Date(file.createdAt))}</span>
          {!mine && file.owner && (
            <Link to={`/u/${file.owner.username}`} className="underline underline-offset-2 hover:text-foreground">
              by {ownerName}
            </Link>
          )}
          {mine && (
            <span className="inline-flex items-center gap-1">
              {file.visibility === 'public' ? <Globe className="size-3" aria-hidden="true" /> : <Link2 className="size-3" aria-hidden="true" />}
              {file.visibility === 'public' ? 'Everyone can browse' : 'Link only'}
            </span>
          )}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button variant="ghost" size="icon" onClick={copyLink} aria-label={`Copy link to ${file.name}`}>
          {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
        </Button>
        <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
          <a href={file.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${file.name} in a new tab`}>
            <ExternalLink className="size-4" />
          </a>
        </Button>
        {mine && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleVisibility(file)}
              aria-label={file.visibility === 'public' ? `Make ${file.name} link only` : `Let everyone browse ${file.name}`}
              title={file.visibility === 'public' ? 'Make link only' : 'Let everyone browse'}
            >
              {file.visibility === 'public' ? <Globe className="size-4" /> : <Link2 className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(file)} aria-label={`Delete ${file.name}`}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

export function SharedFilesPage() {
  const { user } = useAuth()
  const [scope, setScope] = useState<FileScope>('mine')
  const [files, setFiles] = useState<SharedFile[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [incoming, setIncoming] = useState<File[] | undefined>()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const [dragging, setDragging] = useState(false)
  const dragDepth = useRef(0)

  const load = useCallback(async () => {
    if (!user) return
    setFailed(false)
    try {
      setFiles(await listSharedFiles(scope, user.id))
    } catch {
      setFailed(true)
    }
  }, [user, scope])

  useEffect(() => {
    setFiles(null)
    void load()
  }, [load])

  // Drop files anywhere on the page to upload them.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      dragDepth.current += 1
      setDragging(true)
    }
    const leave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      dragDepth.current = Math.max(0, dragDepth.current - 1)
      if (dragDepth.current === 0) setDragging(false)
    }
    const over = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault() }
    const drop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      dragDepth.current = 0
      setDragging(false)
      const dropped = Array.from(e.dataTransfer?.files ?? [])
      if (dropped.length === 0) return
      setScope('mine')
      setUploadOpen(true)
      setIncoming(dropped)
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragleave', leave)
    window.addEventListener('dragover', over)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', drop)
    }
  }, [])

  const visible = useMemo(() => {
    if (!files) return null
    const q = query.trim().toLowerCase()
    const filtered = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return b.size - a.size
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [files, query, sort])

  const totalSize = useMemo(() => (files ?? []).reduce((sum, f) => sum + f.size, 0), [files])

  async function handleDelete(file: SharedFile) {
    const previous = files
    setFiles((prev) => (prev ?? []).filter((f) => f.id !== file.id))
    try {
      await deleteSharedFile(file)
      toast.success('File deleted.')
    } catch {
      setFiles(previous)
      toast.error(`Could not delete ${file.name}. It is back in your list.`)
    }
  }

  async function handleToggleVisibility(file: SharedFile) {
    const next = file.visibility === 'public' ? 'unlisted' : 'public'
    setFiles((prev) => (prev ?? []).map((f) => (f.id === file.id ? { ...f, visibility: next } : f)))
    try {
      await setFileVisibility(file.id, next)
      toast.success(next === 'public' ? 'Everyone can now browse this file.' : 'Only people with the link can open this file.')
    } catch {
      setFiles((prev) => (prev ?? []).map((f) => (f.id === file.id ? { ...f, visibility: file.visibility } : f)))
      toast.error('Could not change who sees this file.')
    }
  }

  const mine = scope === 'mine'
  const showUploadPanel = uploadOpen || (mine && files !== null && files.length === 0 && !failed)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {dragging && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-pass-v6/85 p-6"
          role="presentation"
        >
          <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-md border-2 border-dashed border-ink-magenta-light bg-pass-v4 px-6 py-12 text-center">
            <UploadCloud className="size-8" aria-hidden="true" />
            <p className="font-display text-2xl">Drop to upload</p>
          </div>
        </div>
      )}

      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium">Shared files</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reference sheets, brushes, PDFs. Send a link, or let everyone browse.
            </p>
          </div>
          <Button variant="brand" onClick={() => { setScope('mine'); setUploadOpen((o) => !o) }}>
            {uploadOpen ? 'Close' : 'Upload files'}
          </Button>
        </div>
      </Reveal>

      {showUploadPanel && (
        <div className="mt-6">
          <FileUploadZone onUploaded={load} initialFiles={incoming} />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={scope} onValueChange={(v) => { setScope(v as FileScope); setQuery('') }}>
          <TabsList>
            <TabsTrigger value="mine">My files</TabsTrigger>
            <TabsTrigger value="everyone">Everyone's files</TabsTrigger>
          </TabsList>
        </Tabs>

        {files && files.length > 0 && (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
            <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                aria-label="Search files by name"
                className="pl-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <label className="sr-only" htmlFor="file-sort">Sort files</label>
            <select
              id="file-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-full border-2 border-input bg-transparent px-3 text-sm text-foreground outline-offset-2 focus-visible:border-ink-magenta-light focus-visible:outline-2 focus-visible:outline-ink-magenta-light"
            >
              <option value="newest" className="bg-popover">Newest</option>
              <option value="name" className="bg-popover">Name</option>
              <option value="size" className="bg-popover">Largest</option>
            </select>
          </div>
        )}
      </div>

      {files && files.length > 0 && (
        <p className="mt-3 font-code text-[0.7rem] text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'} · {formatSize(totalSize)}
        </p>
      )}

      <div className="mt-4" aria-live="polite">
        {failed ? (
          <EmptyState
            icon={<RefreshCw className="size-6" />}
            title="Files did not load"
            description="Check your connection and try again."
            action={
              <Button variant="brand" onClick={() => { setFiles(null); void load() }}>
                Try again
              </Button>
            }
          />
        ) : visible === null ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[86px] rounded-md" />
            ))}
          </div>
        ) : visible.length === 0 && files && files.length > 0 ? (
          <div className="rounded-md border-2 border-dashed border-pass-v1 px-6 py-12 text-center">
            <p className="font-medium">Nothing matches "{query}"</p>
            <Button variant="ghost" className="mt-2" onClick={() => setQuery('')}>
              Clear search
            </Button>
          </div>
        ) : visible.length === 0 ? (
          !mine && (
            <EmptyState
              icon={<FileText className="size-6" />}
              title="Nothing shared yet"
              description="Files that artists choose to share with everyone show up here. Yours are link-only until you switch them."
              action={
                <Button variant="outline" onClick={() => setScope('mine')}>
                  Go to my files
                </Button>
              }
            />
          )
        ) : (
          <ul className="space-y-3">
            {visible.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                mine={mine || file.owner?.id === user?.id}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
