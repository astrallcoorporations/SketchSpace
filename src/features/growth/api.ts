import { supabase } from '@/lib/supabase'
import type { GrowthData } from './types'

const ARTWORK_FIELDS = 'id, title, medium, tags, cover_image_url, created_at, visibility'
const VERSION_FIELDS = 'id, artwork_id, image_url, version_number, note, created_at'

/** Everything needed to render the growth timeline for one owner — capped at a
 *  generous personal-history size, not paginated (this is a dashboard, not a feed). */
export async function getGrowthData(ownerId: string): Promise<GrowthData> {
  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select(ARTWORK_FIELDS)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true })
    .limit(1000)
  if (artworksError) throw artworksError

  const artworkIds = (artworks ?? []).map((a) => a.id)
  if (artworkIds.length === 0) return { artworks: [], versions: [] }

  const { data: versions, error: versionsError } = await supabase
    .from('artwork_versions')
    .select(VERSION_FIELDS)
    .in('artwork_id', artworkIds)
    .order('created_at', { ascending: true })
  if (versionsError) throw versionsError

  return { artworks: artworks ?? [], versions: versions ?? [] }
}
