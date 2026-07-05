import type { Tables } from '@/types/database'

export type Artwork = Tables<'artworks'>
export type ArtworkVisibility = 'public' | 'unlisted' | 'private'
export type Collection = Tables<'collections'>

export type ArtworkWithOwner = Artwork & {
  profiles: Pick<Tables<'profiles'>, 'id' | 'username' | 'display_name' | 'avatar_url'> | null
}
