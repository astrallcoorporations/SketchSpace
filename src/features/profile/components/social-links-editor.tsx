import { useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SocialLink } from '@/features/profile/types'

type Entry = SocialLink & { _key: string }

/**
 * Maps each SocialLink to a stable random key so React can track
 * additions / removals without using array indices.
 */
function useStableKeys(value: SocialLink[]): Entry[] {
  const keysRef = useRef<string[]>([])
  const keys = keysRef.current

  // Grow the key array when new items are appended
  while (keys.length < value.length) {
    keys.push(crypto.randomUUID())
  }

  return value.map((link, i) => ({ ...link, _key: keys[i] }))
}

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
}) {
  const entries = useStableKeys(value)

  function update(key: string, patch: Partial<SocialLink>) {
    onChange(entries.map((e) => (e._key === key ? { ...e, ...patch } : e)))
  }

  return (
    <div className="space-y-2">
      {entries.map((link) => (
        <div key={link._key} className="flex gap-2">
          <Input
            value={link.label}
            onChange={(e) => update(link._key, { label: e.target.value })}
            placeholder="Instagram"
            className="w-32 shrink-0"
          />
          <Input
            value={link.url}
            onChange={(e) => update(link._key, { url: e.target.value })}
            placeholder="https://…"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove link"
            onClick={() => onChange(entries.filter((e) => e._key !== link._key))}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...value, { label: '', url: '' }])}
      >
        <Plus className="size-3.5" /> Add link
      </Button>
    </div>
  )
}
