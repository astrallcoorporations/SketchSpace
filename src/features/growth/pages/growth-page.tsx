import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, TrendingUp, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RouteLoader } from '@/components/layout/route-loader'
import { Reveal, StaggerGroup, staggerItem } from '@/components/motion/reveal'
import { EmptyState } from '@/features/shell/components/empty-state'
import { useAuth } from '@/hooks/use-auth'
import { getGrowthData } from '@/features/growth/api'
import { ContributionHeatmap } from '@/features/growth/components/contribution-heatmap'
import { BeforeAfterSlider } from '@/features/growth/components/before-after-slider'
import { MilestoneBadges } from '@/features/growth/components/milestone-badges'
import {
  buildActivityCounts,
  buildBeforeAfterCandidates,
  buildHeatmapWeeks,
  computeMilestones,
  computeMonthlyRecaps,
  computeStreak,
  computeYearOptions,
  computeYearlyRecap,
} from '@/features/growth/computations'
import type { GrowthData } from '@/features/growth/types'

function StatTile({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <motion.div variants={staggerItem} className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-medium">{value}</p>
    </motion.div>
  )
}

export function GrowthPage() {
  const { user } = useAuth()
  const [data, setData] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [medium, setMedium] = useState<string>('all')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const result = await getGrowthData(user.id)
    setData(result)
    setYear(computeYearOptions(result.artworks)[0] ?? new Date().getFullYear())
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const mediums = useMemo(() => {
    if (!data) return []
    return [...new Set(data.artworks.map((a) => a.medium).filter((m): m is string => Boolean(m)))].sort()
  }, [data])

  const filteredArtworks = useMemo(() => {
    if (!data) return []
    return medium === 'all' ? data.artworks : data.artworks.filter((a) => a.medium === medium)
  }, [data, medium])

  const activityCounts = useMemo(
    () => (data ? buildActivityCounts(data.artworks, data.versions) : new Map<string, number>()),
    [data],
  )
  const heatmapWeeks = useMemo(() => buildHeatmapWeeks(activityCounts), [activityCounts])
  const streak = useMemo(() => computeStreak(new Set(activityCounts.keys())), [activityCounts])
  const yearOptions = useMemo(() => (data ? computeYearOptions(data.artworks) : []), [data])
  const yearlyRecap = useMemo(
    () => (data ? computeYearlyRecap(data.artworks, data.versions, year) : null),
    [data, year],
  )
  const monthlyRecaps = useMemo(
    () => (data ? computeMonthlyRecaps(data.artworks, data.versions).filter((m) => m.key.startsWith(String(year))) : []),
    [data, year],
  )
  const milestones = useMemo(
    () => (data ? computeMilestones(data.artworks, data.versions, streak.longest) : []),
    [data, streak.longest],
  )
  const beforeAfter = useMemo(
    () => (data ? buildBeforeAfterCandidates(data.artworks, data.versions).slice(0, 4) : []),
    [data],
  )

  if (loading || !data) return <RouteLoader />

  if (data.artworks.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col px-6 py-10">
        <EmptyState
          icon={<TrendingUp className="size-6" />}
          title="Your growth timeline starts with one upload"
          description="Every artwork you add becomes a point on your timeline — versions, monthly progress, streaks. Upload your first piece from the Studio to begin it."
          action={
            <Button asChild variant="brand">
              <Link to="/app/portfolio">Upload artwork</Link>
            </Button>
          }
        />
      </div>
    )
  }

  const maxMonthlyUploads = Math.max(1, ...monthlyRecaps.map((m) => m.uploads))

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">Growth Timeline</h1>
          <p className="mt-1 text-muted-foreground">Your artistic journey, documented in real progress.</p>
        </div>
        <div className="flex items-center gap-2">
          {mediums.length > 0 && (
            <Select value={medium} onValueChange={setMedium}>
              <SelectTrigger size="sm" className="w-36">
                <SelectValue placeholder="Medium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All mediums</SelectItem>
                {mediums.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {yearOptions.length > 0 && (
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger size="sm" className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <StaggerGroup className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Current streak"
          value={`${streak.current}d`}
          icon={<Flame className={streak.current > 0 ? 'size-4 text-amber-500' : 'size-4'} />}
        />
        <StatTile label="Longest streak" value={`${streak.longest}d`} icon={<Flame className="size-4" />} />
        <StatTile label="Artworks" value={data.artworks.length} icon={<UploadCloud className="size-4" />} />
        <StatTile
          label="Revisions"
          value={data.versions.filter((v) => v.version_number > 1).length}
          icon={<TrendingUp className="size-4" />}
        />
      </StaggerGroup>

      <Reveal className="mt-8 rounded-2xl border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Activity</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Less</span>
            <span className="size-[10px] rounded-[2px] bg-muted" />
            <span className="size-[10px] rounded-[2px] bg-brand/25" />
            <span className="size-[10px] rounded-[2px] bg-brand/45" />
            <span className="size-[10px] rounded-[2px] bg-brand/70" />
            <span className="size-[10px] rounded-[2px] bg-brand" />
            <span>More</span>
          </div>
        </div>
        <div className="mt-4">
          <ContributionHeatmap weeks={heatmapWeeks} />
        </div>
      </Reveal>

      {yearlyRecap && (
        <Reveal className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand/30 bg-brand-muted p-6">
            <p className="text-xs font-medium tracking-wide text-brand uppercase">{year} recap</p>
            <p className="mt-2 font-display text-xl font-medium">
              {yearlyRecap.uploads} upload{yearlyRecap.uploads === 1 ? '' : 's'}, {yearlyRecap.revisions} revision
              {yearlyRecap.revisions === 1 ? '' : 's'}
            </p>
            {yearlyRecap.busiestMonth && (
              <p className="mt-1 text-sm text-brand-muted-foreground">
                Busiest month: {yearlyRecap.busiestMonth}
              </p>
            )}
            {yearlyRecap.topMediums.length > 0 && (
              <p className="mt-1 text-sm text-brand-muted-foreground">
                Favorite mediums: {yearlyRecap.topMediums.join(', ')}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <p className="text-sm font-medium text-muted-foreground">Monthly uploads</p>
            <div className="mt-3 space-y-2">
              {monthlyRecaps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity in {year} yet.</p>
              ) : (
                monthlyRecaps.map((m) => (
                  <div key={m.key} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-xs text-muted-foreground">{m.label.split(' ')[0].slice(0, 3)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(m.uploads / maxMonthlyUploads) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">{m.uploads}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Reveal>
      )}

      {beforeAfter.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-medium text-muted-foreground">Before & after</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {beforeAfter.map((candidate) => (
              <BeforeAfterSlider key={candidate.artwork.id} candidate={candidate} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">Milestones</h2>
        <div className="mt-4">
          <MilestoneBadges milestones={milestones} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium text-muted-foreground">Timeline</h2>
        <div className="mt-4 space-y-6">
          {[...filteredArtworks]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((artwork) => (
              <Link
                key={artwork.id}
                to={`/app/artwork/${artwork.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-background p-3 transition-colors hover:border-brand/40"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {artwork.cover_image_url && (
                    <img src={artwork.cover_image_url} alt={artwork.title} className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-brand">{artwork.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(artwork.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {artwork.medium ? ` · ${artwork.medium}` : ''}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
