import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatInr } from '@/features/projects/billing'
import type { ProjectQuotaState } from '@/features/projects/hooks/use-project-quota'

/** Fixed-height status line: free slots left, or the price of the next one. Reserves its space
 *  while loading so the page does not jump. */
export function ProjectSlots({ state, compact = false }: { state: ProjectQuotaState; compact?: boolean }) {
  const { quota, config, error, buying, buySlot } = state

  if (error && !quota) {
    return <p className="text-sm text-muted-foreground">Could not check your project slots. Try again in a moment.</p>
  }
  if (!quota) return <Skeleton className="h-5 w-56" />

  const price = formatInr(quota.price_paise)
  const freeLeft = quota.free_remaining
  const paidLeft = quota.slots_remaining - quota.free_remaining

  if (quota.can_create) {
    return (
      <p className="text-sm text-muted-foreground">
        {freeLeft > 0 ? (
          <>
            <span className="font-code text-foreground">{freeLeft}</span> of {quota.free_limit} free project
            {freeLeft === 1 ? '' : 's'} left
            {!compact && <> · after that, {price} per project</>}
          </>
        ) : (
          <>
            <span className="font-code text-foreground">{paidLeft}</span> paid project slot{paidLeft === 1 ? '' : 's'} ready
          </>
        )}
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        You have used your {quota.free_limit} free projects. Each extra project costs{' '}
        <span className="font-code text-foreground">{price}</span>.
      </p>
      {config === null ? (
        <Skeleton className="h-9 w-40" />
      ) : config.enabled ? (
        <Button type="button" variant="brand" size="sm" onClick={() => void buySlot()} disabled={buying !== 'idle'}>
          {buying !== 'idle' && <Loader2 className="animate-spin" aria-hidden="true" />}
          {buying === 'starting' ? 'Opening payment…' : buying === 'confirming' ? 'Confirming payment…' : `Buy a slot for ${price}`}
        </Button>
      ) : (
        <p className="rounded-md border-2 border-border bg-pass-v5 px-3 py-2 text-sm text-muted-foreground">
          Payments are not set up yet, so extra projects cannot be bought right now.
        </p>
      )}
    </div>
  )
}
