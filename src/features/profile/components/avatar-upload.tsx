import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AvatarUpload({
  avatarUrl,
  fallback,
  onUpload,
  size = 96,
}: {
  avatarUrl: string | null
  fallback: string
  onUpload: (file: File) => Promise<void>
  size?: number
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="group relative shrink-0 overflow-hidden rounded-full border-4 border-background bg-brand-muted shadow-[var(--shadow-md)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      style={{ width: size, height: size }}
      aria-label="Change avatar"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        <span
          className="flex size-full items-center justify-center font-display text-brand-muted-foreground"
          style={{ fontSize: size * 0.36 }}
        >
          {fallback}
        </span>
      )}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100',
          uploading && 'opacity-100',
        )}
      >
        {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          void handleChange(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </button>
  )
}
