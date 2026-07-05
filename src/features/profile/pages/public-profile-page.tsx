import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RouteLoader } from '@/components/layout/route-loader'
import { Reveal } from '@/components/motion/reveal'
import { useAuth } from '@/hooks/use-auth'
import {
  followUser,
  getFollowCounts,
  getProfileByUsername,
  isFollowing,
  unfollowUser,
} from '@/features/profile/api'
import { useInfiniteArtworks } from '@/features/artwork/hooks/use-infinite-artworks'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'
import { MasonryGrid, MasonryItem } from '@/features/artwork/components/masonry-grid'
import { ArtworkCard, ArtworkCardSkeleton } from '@/features/artwork/components/artwork-card'
import type { Profile, SocialLink } from '@/features/profile/types'

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is SocialLink =>
      typeof item === 'object' && item !== null && 'label' in item && 'url' in item,
  )
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  const load = useCallback(async () => {
    if (!username) return
    setLoading(true)
    try {
      const data = await getProfileByUsername(username)
      setProfile(data)
      const [followCounts, viewerFollows] = await Promise.all([
        getFollowCounts(data.id),
        user ? isFollowing(user.id, data.id) : Promise.resolve(false),
      ])
      setCounts(followCounts)
      setFollowing(viewerFollows)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [username, user])

  useEffect(() => {
    void load()
  }, [load])

  const { items, hasMore, loading: artworksLoading, loadMore } = useInfiniteArtworks({
    ownerId: profile?.id,
    visibility: 'public',
  })
  const sentinelRef = useIntersectionObserver(loadMore, hasMore && !artworksLoading)

  if (loading) return <RouteLoader />
  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-muted-foreground">No artist found at @{username}.</p>
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.id
  const socialLinks = parseSocialLinks(profile.social_links)

  async function handleFollowToggle() {
    if (!user || isOwnProfile) return
    setFollowBusy(true)
    try {
      if (following) {
        await unfollowUser(user.id, profile!.id)
        setCounts((c) => ({ ...c, followers: c.followers - 1 }))
      } else {
        await followUser(user.id, profile!.id)
        setCounts((c) => ({ ...c, followers: c.followers + 1 }))
      }
      setFollowing((f) => !f)
    } catch {
      toast.error('Could not update follow status.')
    } finally {
      setFollowBusy(false)
    }
  }

  return (
    <div
      className="mx-auto w-full max-w-4xl px-6 py-10"
      style={profile.accent_color ? ({ '--brand': profile.accent_color } as React.CSSProperties) : undefined}
    >
      <Reveal>
        <div className="h-40 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-muted via-background to-background sm:h-52">
          {profile.banner_url && (
            <img src={profile.banner_url} alt="" className="size-full object-cover" />
          )}
        </div>

        <div className="-mt-14 ml-2 flex items-end gap-4">
          <div className="size-24 shrink-0 overflow-hidden rounded-full border-4 border-background bg-brand-muted shadow-[var(--shadow-md)]">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-display text-3xl text-brand-muted-foreground">
                {profile.username[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {isOwnProfile ? (
            <Button asChild variant="outline" size="sm">
              <Link to="/app/settings">Edit profile</Link>
            </Button>
          ) : (
            user && (
              <Button
                variant={following ? 'outline' : 'brand'}
                size="sm"
                disabled={followBusy}
                onClick={handleFollowToggle}
              >
                {following ? 'Following' : 'Follow'}
              </Button>
            )
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{counts.followers}</span> followers
          </span>
          <span>
            <span className="font-medium text-foreground">{counts.following}</span> following
          </span>
          <span>
            <span className="font-medium text-foreground">{profile.xp}</span> XP
          </span>
        </div>

        {profile.bio && <p className="mt-4 max-w-2xl text-sm">{profile.bio}</p>}

        {(profile.favorite_mediums.length > 0 || profile.skills.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.favorite_mediums.map((m) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))}
            {profile.skills.map((s) => (
              <Badge key={s} variant="outline">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-brand hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-border pt-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Portfolio</h2>
          {items.length === 0 && !artworksLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No public artwork yet.
            </p>
          ) : (
            <MasonryGrid>
              {items.map((artwork) => (
                <MasonryItem key={artwork.id}>
                  <ArtworkCard artwork={artwork} />
                </MasonryItem>
              ))}
              {artworksLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <MasonryItem key={`s-${i}`}>
                    <ArtworkCardSkeleton />
                  </MasonryItem>
                ))}
            </MasonryGrid>
          )}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </Reveal>
    </div>
  )
}
