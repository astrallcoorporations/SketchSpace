import { useCallback, useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RouteLoader } from '@/components/layout/route-loader'
import { Magnetic } from '@/components/motion/magnetic'
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
import { duration, easing, spring } from '@/lib/motion-tokens'

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is SocialLink =>
      typeof item === 'object' && item !== null && 'label' in item && 'url' in item,
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemUpVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: duration.slow, ease: easing.out },
  },
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  // Parallax for banner
  const { scrollY } = useScroll()
  const bannerY = useTransform(scrollY, [0, 500], [0, 150])
  const bannerScale = useTransform(scrollY, [0, 500], [1, 1.1])
  const bannerOpacity = useTransform(scrollY, [0, 300], [1, 0.4])

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

  // Use accent color or brand default for UI accents
  const cssVars = profile.accent_color
    ? ({ '--brand': profile.accent_color } as React.CSSProperties)
    : undefined

  return (
    <div
      ref={containerRef}
      className="relative min-h-svh w-full bg-background"
      style={cssVars}
    >
      {/* ── Subtle background noise and gradient ── */}
      <div className="bg-noise pointer-events-none fixed inset-0 z-0 opacity-[0.03]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,color-mix(in_oklch,var(--brand)_8%,transparent),transparent)]" />

      {/* ── Banner Section (Parallax) ── */}
      <div className="relative h-[40vh] w-full overflow-hidden sm:h-[50vh]">
        <motion.div
          style={{ y: bannerY, scale: bannerScale, opacity: bannerOpacity }}
          className="absolute inset-0 bg-brand-muted/30"
        >
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-tr from-brand-muted to-background" />
          )}
        </motion.div>
        {/* Soft fade into the content below */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ── Main Profile Content ── */}
      <motion.div
        className="relative z-10 mx-auto -mt-32 w-full max-w-5xl px-6 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            <motion.div
              variants={itemUpVariants}
              whileHover={{ scale: 1.05 }}
              transition={spring.bouncy}
              className="relative z-20 flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-background shadow-2xl sm:size-40"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="font-display text-5xl font-medium text-brand">
                  {profile.username[0]?.toUpperCase()}
                </span>
              )}
            </motion.div>

            {/* Name & Handle */}
            <motion.div
              variants={itemUpVariants}
              className="mt-4 text-center sm:mt-0 sm:pb-4 sm:text-left"
            >
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {profile.display_name || profile.username}
              </h1>
              <p className="mt-1 text-lg text-brand/80">@{profile.username}</p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div variants={itemUpVariants} className="mt-6 sm:mt-0 sm:pb-4">
            {isOwnProfile ? (
              <Magnetic strength={5}>
                <Button asChild variant="outline" size="lg" className="rounded-full shadow-sm">
                  <Link to="/app/settings">Edit Profile</Link>
                </Button>
              </Magnetic>
            ) : (
              user && (
                <Magnetic strength={5}>
                  <Button
                    variant={following ? 'outline' : 'brand'}
                    size="lg"
                    className="rounded-full shadow-sm"
                    disabled={followBusy}
                    onClick={handleFollowToggle}
                  >
                    {following ? 'Following' : 'Follow Artist'}
                  </Button>
                </Magnetic>
              )
            )}
          </motion.div>
        </div>

        {/* ── Stats & Bio Panel ── */}
        <motion.div
          variants={itemUpVariants}
          className="mt-10 flex flex-col gap-8 rounded-3xl border border-border/50 bg-card/40 p-8 shadow-xl backdrop-blur-md sm:flex-row sm:items-start sm:p-10"
        >
          {/* Left: Bio & Tags */}
          <div className="flex-1 space-y-6">
            {profile.bio ? (
              <p className="text-lg leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            ) : (
              <p className="italic text-muted-foreground/60">This canvas is blank.</p>
            )}

            {(profile.favorite_mediums.length > 0 || profile.skills.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {profile.favorite_mediums.map((m) => (
                  <Badge key={m} variant="secondary" className="px-3 py-1 text-sm">
                    {m}
                  </Badge>
                ))}
                {profile.skills.map((s) => (
                  <Badge key={s} variant="outline" className="px-3 py-1 text-sm border-brand/20">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-medium text-brand transition-colors hover:text-brand-muted-foreground hover:underline"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right: Stats */}
          <div className="flex shrink-0 gap-8 border-t border-border/50 pt-8 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0">
            <div className="flex flex-col gap-1">
              <span className="font-display text-3xl font-bold tracking-tight text-foreground">
                {counts.followers}
              </span>
              <span className="text-xs tracking-widest text-muted-foreground uppercase">Followers</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-3xl font-bold tracking-tight text-foreground">
                {counts.following}
              </span>
              <span className="text-xs tracking-widest text-muted-foreground uppercase">Following</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-3xl font-bold tracking-tight text-brand">
                {profile.xp}
              </span>
              <span className="text-xs tracking-widest text-brand/60 uppercase">XP</span>
            </div>
          </div>
        </motion.div>

        {/* ── Portfolio Grid ── */}
        <motion.div variants={itemUpVariants} className="mt-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-3xl font-medium tracking-tight">Gallery</h2>
            <div className="h-px flex-1 ml-6 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          {items.length === 0 && !artworksLoading ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 py-32">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl text-muted-foreground">🎨</span>
              </div>
              <p className="text-lg font-medium text-muted-foreground">No public artwork yet.</p>
            </div>
          ) : (
            <MasonryGrid>
              <AnimatePresence>
                {items.map((artwork, i) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.1, 1), ease: easing.out }}
                  >
                    <MasonryItem>
                      <ArtworkCard artwork={artwork} />
                    </MasonryItem>
                  </motion.div>
                ))}
              </AnimatePresence>
              {artworksLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <MasonryItem key={`s-${i}`}>
                    <ArtworkCardSkeleton />
                  </MasonryItem>
                ))}
            </MasonryGrid>
          )}
          <div ref={sentinelRef} className="h-10 w-full" />
        </motion.div>
      </motion.div>
    </div>
  )
}
