import { AlertCircle, ServerCrash, WifiOff } from 'lucide-react'
import type { AuthErrorDescription } from '@/lib/auth-errors'

const iconByKind: Record<AuthErrorDescription['kind'], typeof AlertCircle> = {
  config: ServerCrash,
  network: WifiOff,
  'weak-password': AlertCircle,
  supabase: AlertCircle,
  unknown: AlertCircle,
}

export function AuthErrorAlert({ error }: { error: AuthErrorDescription }) {
  const Icon = iconByKind[error.kind]
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{error.message}</span>
    </div>
  )
}
