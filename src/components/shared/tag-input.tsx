import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

/** Chip-style tag input — Enter or comma commits a tag, backspace on empty removes the last. */
export function TagInput({ value, onChange, placeholder, maxTags = 12 }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commit(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || value.includes(tag) || value.length >= maxTags) return
    onChange([...value, tag])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
      setDraft('')
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input px-2 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded-full hover:bg-foreground/10"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commit(draft)
          setDraft('')
        }}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="h-6 min-w-24 flex-1 border-none p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
