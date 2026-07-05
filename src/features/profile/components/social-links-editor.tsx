import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SocialLink } from '@/features/profile/types'

export function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[]
  onChange: (links: SocialLink[]) => void
}) {
  function update(index: number, patch: Partial<SocialLink>) {
    onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  return (
    <div className="space-y-2">
      {value.map((link, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={link.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Instagram"
            className="w-32 shrink-0"
          />
          <Input
            value={link.url}
            onChange={(e) => update(index, { url: e.target.value })}
            placeholder="https://…"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove link"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
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
