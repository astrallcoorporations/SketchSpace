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

export type NavGroup = {
  label: string | null
  items: NavItem[]
}

/** Grouped by job, not alphabetised: the flat ten-item list read as one undifferentiated
 *  wall, so each section now carries its own short reason to exist. */
export const navGroups: NavGroup[] = [
  { label: null, items: [{ label: 'Studio', href: '/', icon: Palette }] },
  {
    label: 'Make',
    items: [
      { label: 'Portfolio', href: '/portfolio', icon: GalleryVertical },
      { label: 'Projects', href: '/projects', icon: FolderKanban },
      { label: 'Shared Files', href: '/shared-files', icon: FileUp },
    ],
  },
  {
    label: 'Grow',
    items: [
      { label: 'Learning', href: '/learning', icon: GraduationCap },
      { label: 'Growth', href: '/growth', icon: TrendingUp },
      { label: 'Quests', href: '/quests', icon: Flame },
    ],
  },
  {
    label: 'Community',
    items: [{ label: 'Homepage', href: '/homepage', icon: Users2 }],
  },
]

export const accountItems: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
]

/** Flat list kept for callers that only need "is this path in the app shell". */
export const navItems: NavItem[] = [...navGroups.flatMap((g) => g.items), ...accountItems]
