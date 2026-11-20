import {
  Box,
  Brush,
  Compass,
  Globe,
  Grid3x3,
  Mountain,
  Palette,
  Pencil,
  PersonStanding,
  UserRound,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'

// Named imports only: a namespace import would pull the whole icon set into the bundle.
const ICONS: Record<string, LucideIcon> = {
  Brush,
  PersonStanding,
  Box,
  Mountain,
  Grid3x3,
  Globe,
  Palette,
  UserRound,
  Pencil,
}

export function PathIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Compass
  return <Icon {...props} />
}
