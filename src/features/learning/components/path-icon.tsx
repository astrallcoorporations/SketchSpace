import * as Icons from 'lucide-react'
import { Compass, type LucideProps } from 'lucide-react'

export function PathIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (Icons as unknown as Record<string, typeof Compass>)[name] ?? Compass
  return <Icon {...props} />
}
