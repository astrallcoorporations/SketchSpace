import {
  Palette,
  GraduationCap,
  TrendingUp,
  GalleryVertical,
  FolderKanban,
  Users2,
  Flame,
  Bell,
  Settings,
  FileUp,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Studio', href: '/', icon: Palette },
  { label: 'Homepage', href: '/homepage', icon: Users2 },
  { label: 'Learning', href: '/learning', icon: GraduationCap },
  { label: 'Portfolio', href: '/portfolio', icon: GalleryVertical },
  { label: 'Growth', href: '/growth', icon: TrendingUp },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Shared Files', href: '/shared-files', icon: FileUp },
  { label: 'Quests', href: '/quests', icon: Flame },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
]
