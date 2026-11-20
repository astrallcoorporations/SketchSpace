import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createSlotOrder,
  getPaymentsConfig,
  getProjectQuota,
  openCheckout,
  type PaymentsConfig,
} from '@/features/projects/billing'
import type { ProjectQuota } from '@/features/projects/types'

const POLL_MS = 1500
const POLL_TRIES = 20

export function useProjectQuota() {
  const [quota, setQuota] = useState<ProjectQuota | null>(null)
  const [config, setConfig] = useState<PaymentsConfig | null>(null)
  const [error, setError] = useState(false)
  const [buying, setBuying] = useState<'idle' | 'starting' | 'confirming'>('idle')
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = await getProjectQuota()
      if (mounted.current) {
        setQuota(next)
        setError(false)
      }
      return next
    } catch {
      if (mounted.current) setError(true)
      return null
    }
  }, [])

  useEffect(() => {
    void refresh()
    void getPaymentsConfig().then((c) => mounted.current && setConfig(c))
  }, [refresh])

  const buySlot = useCallback(async () => {
    if (!config?.enabled || !config.keyId || buying !== 'idle') return
    const before = quota?.paid_slots ?? 0
    setBuying('starting')
    try {
      const order = await createSlotOrder()
      const paid = await openCheckout(config.keyId, order)
      if (!paid) return
      // The slot is granted only by the signature-verified webhook; wait for it to land.
      setBuying('confirming')
      for (let i = 0; i < POLL_TRIES && mounted.current; i++) {
        const next = await refresh()
        if (next && next.paid_slots > before) {
          toast.success('Payment confirmed. You can create another project.')
          return
        }
        await new Promise((r) => setTimeout(r, POLL_MS))
      }
      toast.message('Payment received. Your slot appears here as soon as it is confirmed.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start the payment.')
    } finally {
      if (mounted.current) setBuying('idle')
    }
  }, [buying, config, quota?.paid_slots, refresh])

  return { quota, config, error, buying, refresh, buySlot }
}

export type ProjectQuotaState = ReturnType<typeof useProjectQuota>
