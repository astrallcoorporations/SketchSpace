import { motion } from 'framer-motion'
import { getPasswordStrength } from '@/lib/password-strength'
import { cn } from '@/lib/utils'

const barColor = ['bg-destructive', 'bg-destructive', 'bg-amber-500', 'bg-brand', 'bg-emerald-500']

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label } = getPasswordStrength(password)

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((bar) => (
          <div key={bar} className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn('h-full rounded-full', barColor[score])}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: bar < score ? 1 : 0 }}
              style={{ transformOrigin: 'left' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
