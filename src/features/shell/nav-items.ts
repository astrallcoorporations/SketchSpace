import {
  Palette,
  TrendingUp,
  GalleryVertical,
  FolderKanban,
  Users2,
  Flame,
  Bell,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Studio', href: '/app', icon: Palette },
  { label: 'Growth', href: '/app/growth', icon: TrendingUp },
  { label: 'Portfolio', href: '/app/portfolio', icon: GalleryVertical },
  { label: 'Projects', href: '/app/projects', icon: FolderKanban },
  { label: 'Community', href: '/app/community', icon: Users2 },
  { label: 'Quests', href: '/app/quests', icon: Flame },
  { label: 'Notifications', href: '/app/notifications', icon: Bell },
  { label: 'Settings', href: '/app/settings', icon: Settings },
]
