import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'

export function BannerUpload({
  bannerUrl,
  onUpload,
}: {
  bannerUrl: string | null
  onUpload: (file: File) => Promise<void>
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
      aria-label="Change banner"
      className="group relative block h-40 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-muted via-background to-background sm:h-52"
    >
      {bannerUrl && <img src={bannerUrl} alt="" className="size-full object-cover" />}
      <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
        {uploading ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Change banner'}</span>
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
