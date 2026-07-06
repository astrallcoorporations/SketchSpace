import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const presets = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Fuchsia', value: '#d946ef' },
]

export function AccentColorPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (color: string) => void
}) {
  const isCustom = value !== null && !presets.some((preset) => preset.value === value)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((preset) => (
        <button
          key={preset.value}
          type="button"
          aria-label={preset.name}
          aria-pressed={value === preset.value}
          onClick={() => onChange(preset.value)}
          className={cn(
            'flex size-8 items-center justify-center rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-background outline-none transition-shadow focus-visible:ring-ring/50',
            value === preset.value && 'ring-foreground',
          )}
          style={{ backgroundColor: preset.value }}
        >
          {value === preset.value && <Check className="size-4 text-white" />}
        </button>
      ))}
      <label
        className={cn(
          'relative flex size-8 cursor-pointer items-center justify-center rounded-full border text-xs transition-shadow',
          isCustom
            ? 'border-transparent text-white ring-2 ring-foreground ring-offset-2 ring-offset-background'
            : 'border-dashed border-border text-muted-foreground',
        )}
        style={isCustom ? { backgroundColor: value } : undefined}
        aria-label="Custom accent color"
      >
        {isCustom ? <Check className="size-4" /> : '+'}
        <input
          type="color"
          value={value ?? '#8b5cf6'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
    </div>
  )
}
