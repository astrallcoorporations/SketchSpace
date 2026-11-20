import { useCallback, useEffect, useState } from 'react'

/** Counts down after a send so people cannot hammer "resend" (Supabase rate-limits email sends). */
export function useResendCooldown(seconds = 60) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return
    const id = window.setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => window.clearTimeout(id)
  }, [remaining])

  const start = useCallback(() => setRemaining(seconds), [seconds])
  return { remaining, start, cooling: remaining > 0 }
}
