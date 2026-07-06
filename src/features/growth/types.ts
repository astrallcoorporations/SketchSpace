import type { Tables } from '@/types/database'

export type GrowthArtwork = Pick<
  Tables<'artworks'>,
  'id' | 'title' | 'medium' | 'tags' | 'cover_image_url' | 'created_at' | 'visibility'
>

export type GrowthVersion = Pick<
  Tables<'artwork_versions'>,
  'id' | 'artwork_id' | 'image_url' | 'version_number' | 'note' | 'created_at'
>

export type GrowthData = {
  artworks: GrowthArtwork[]
  versions: GrowthVersion[]
}

export type TimelineEntry = {
  date: string
  type: 'upload' | 'version'
  artwork: GrowthArtwork
  version?: GrowthVersion
}

export type Milestone = {
  id: string
  title: string
  description: string
  achieved: boolean
  achievedAt: string | null
}

export type MonthlyRecap = {
  key: string
  label: string
  uploads: number
  versions: number
  topMedium: string | null
}
