import { supabase } from '@/lib/supabase'

export type ShowcaseArtwork = {
  id: string
  title: string
  medium: string | null
  cover_image_url: string | null
  created_at: string
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null
}

/** Real public artwork for marketing surfaces (landing preview, /community) —
 *  never fabricated placeholder cards. */
export async function getPublicArtworkShowcase(limit = 8): Promise<ShowcaseArtwork[]> {
  const { data, error } = await supabase
    .from('artworks')
    .select(
      'id, title, medium, cover_image_url, created_at, profiles!artworks_owner_id_fkey(id, username, display_name, avatar_url)',
    )
    .eq('visibility', 'public')
    .not('cover_image_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as ShowcaseArtwork[]
}

export type ShowcaseArtist = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  favorite_mediums: string[]
  followerCount: number
  publicArtworkCount: number
}

/** The most recently active public artists, with real follower/artwork counts —
 *  built from the same profiles/followers/artworks tables the app itself uses. */
export async function getCommunityShowcase(limit = 6): Promise<ShowcaseArtist[]> {
  const { data: recentArtworks, error } = await supabase
    .from('artworks')
    .select('owner_id')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error

  const ownerIds = [...new Set((recentArtworks ?? []).map((a) => a.owner_id))].slice(0, limit)
  if (ownerIds.length === 0) return []

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, favorite_mediums')
    .in('id', ownerIds)
  if (profilesError) throw profilesError

  const [{ data: followerRows }, { data: artworkRows }] = await Promise.all([
    supabase.from('followers').select('following_id').in('following_id', ownerIds),
    supabase.from('artworks').select('owner_id').eq('visibility', 'public').in('owner_id', ownerIds),
  ])

  const followerCounts = new Map<string, number>()
  for (const row of followerRows ?? []) {
    followerCounts.set(row.following_id, (followerCounts.get(row.following_id) ?? 0) + 1)
  }
  const artworkCounts = new Map<string, number>()
  for (const row of artworkRows ?? []) {
    artworkCounts.set(row.owner_id, (artworkCounts.get(row.owner_id) ?? 0) + 1)
  }

  return (profiles ?? []).map((p) => ({
    ...p,
    followerCount: followerCounts.get(p.id) ?? 0,
    publicArtworkCount: artworkCounts.get(p.id) ?? 0,
  }))
}
