import type { Tables } from '@/types/database'

export type Profile = Tables<'profiles'>

export type SocialLink = { label: string; url: string }
