import type { GrowthArtwork, GrowthVersion, Milestone, MonthlyRecap } from './types'

const DAY_MS = 24 * 60 * 60 * 1000
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export function toDateKey(iso: string): string {
  return iso.slice(0, 10)
}

/** Union of upload days + "added a new version" days — version_number 1 is skipped
 *  since it's created alongside the artwork itself and would double-count that day. */
export function buildActivityCounts(artworks: GrowthArtwork[], versions: GrowthVersion[]): Map<string, number> {
  const counts = new Map<string, number>()
  const bump = (key: string) => counts.set(key, (counts.get(key) ?? 0) + 1)
  for (const artwork of artworks) bump(toDateKey(artwork.created_at))
  for (const version of versions) {
    if (version.version_number > 1) bump(toDateKey(version.created_at))
  }
  return counts
}

export function computeStreak(activityDates: Set<string>) {
  if (activityDates.size === 0) return { current: 0, longest: 0 }

  const sorted = [...activityDates].sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1])
    const curr = new Date(sorted[i])
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / DAY_MS)
    run = diffDays === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  const todayKey = toDateKey(new Date().toISOString())
  const yesterdayKey = toDateKey(new Date(Date.now() - DAY_MS).toISOString())
  const lastActive = sorted[sorted.length - 1]

  let current = 0
  if (lastActive === todayKey || lastActive === yesterdayKey) {
    current = 1
    for (let i = sorted.length - 1; i > 0; i--) {
      const diffDays = Math.round(
        (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / DAY_MS,
      )
      if (diffDays === 1) current++
      else break
    }
  }

  return { current, longest }
}

export type HeatmapDay = { date: string; count: number; inRange: boolean }
export type HeatmapWeek = HeatmapDay[]

/** GitHub-style grid: weeks as columns, Sun–Sat as rows, ending on the most recent Saturday. */
export function buildHeatmapWeeks(activityCounts: Map<string, number>, weeksBack = 53): HeatmapWeek[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + (6 - end.getDay()))
  const start = new Date(end)
  start.setDate(start.getDate() - weeksBack * 7 + 1)

  const weeks: HeatmapWeek[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    const week: HeatmapDay[] = []
    for (let d = 0; d < 7; d++) {
      const key = toDateKey(cursor.toISOString())
      week.push({ date: key, count: activityCounts.get(key) ?? 0, inRange: cursor <= today })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

export function heatmapIntensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-muted'
  const ratio = max === 0 ? 0 : count / max
  if (ratio > 0.75) return 'bg-brand'
  if (ratio > 0.5) return 'bg-brand/70'
  if (ratio > 0.25) return 'bg-brand/45'
  return 'bg-brand/25'
}

export function computeMonthlyRecaps(artworks: GrowthArtwork[], versions: GrowthVersion[]): MonthlyRecap[] {
  const byMonth = new Map<string, { uploads: number; versions: number; mediums: Map<string, number> }>()

  function bucket(key: string) {
    if (!byMonth.has(key)) byMonth.set(key, { uploads: 0, versions: 0, mediums: new Map() })
    return byMonth.get(key)!
  }

  for (const artwork of artworks) {
    const key = artwork.created_at.slice(0, 7)
    const entry = bucket(key)
    entry.uploads++
    if (artwork.medium) entry.mediums.set(artwork.medium, (entry.mediums.get(artwork.medium) ?? 0) + 1)
  }
  for (const version of versions) {
    if (version.version_number === 1) continue
    bucket(version.created_at.slice(0, 7)).versions++
  }

  return [...byMonth.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, entry]) => {
      const topMedium = [...entry.mediums.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      const [year, month] = key.split('-').map(Number)
      return {
        key,
        label: monthFormatter.format(new Date(year, month - 1, 1)),
        uploads: entry.uploads,
        versions: entry.versions,
        topMedium,
      }
    })
}

export function computeYearOptions(artworks: GrowthArtwork[]): number[] {
  const years = new Set(artworks.map((a) => new Date(a.created_at).getFullYear()))
  years.add(new Date().getFullYear())
  return [...years].sort((a, b) => b - a)
}

export function computeYearlyRecap(artworks: GrowthArtwork[], versions: GrowthVersion[], year: number) {
  const yearArtworks = artworks.filter((a) => new Date(a.created_at).getFullYear() === year)
  const yearVersions = versions.filter(
    (v) => v.version_number > 1 && new Date(v.created_at).getFullYear() === year,
  )
  const monthCounts = new Map<number, number>()
  const mediumCounts = new Map<string, number>()
  for (const artwork of yearArtworks) {
    const month = new Date(artwork.created_at).getMonth()
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
    if (artwork.medium) mediumCounts.set(artwork.medium, (mediumCounts.get(artwork.medium) ?? 0) + 1)
  }
  const busiestMonthIndex = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const busiestMonth =
    busiestMonthIndex === null ? null : monthFormatter.format(new Date(year, busiestMonthIndex, 1)).split(' ')[0]
  const topMediums = [...mediumCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m)

  return {
    uploads: yearArtworks.length,
    revisions: yearVersions.length,
    busiestMonth,
    topMediums,
  }
}

export function computeMilestones(
  artworks: GrowthArtwork[],
  versions: GrowthVersion[],
  longestStreak: number,
): Milestone[] {
  const sorted = [...artworks].sort((a, b) => a.created_at.localeCompare(b.created_at))
  const revisionCount = versions.filter((v) => v.version_number > 1).length
  const uploadThresholds = [1, 5, 10, 25, 50, 100]
  const streakThresholds = [7, 30, 100]

  const milestones: Milestone[] = uploadThresholds.map((n) => ({
    id: `uploads-${n}`,
    title: n === 1 ? 'First upload' : `${n} artworks uploaded`,
    description: n === 1 ? 'Every timeline starts with one piece.' : `Reached ${n} pieces in your portfolio.`,
    achieved: sorted.length >= n,
    achievedAt: sorted.length >= n ? sorted[n - 1].created_at : null,
  }))

  milestones.push({
    id: 'first-revision',
    title: 'First revision',
    description: 'Came back to improve a piece instead of starting fresh.',
    achieved: revisionCount >= 1,
    achievedAt: null,
  })

  for (const n of streakThresholds) {
    milestones.push({
      id: `streak-${n}`,
      title: `${n}-day streak`,
      description: `Uploaded or revised something ${n} days in a row.`,
      achieved: longestStreak >= n,
      achievedAt: null,
    })
  }

  if (sorted.length > 0) {
    const daysSinceFirst = Math.floor((Date.now() - new Date(sorted[0].created_at).getTime()) / DAY_MS)
    milestones.push({
      id: 'one-year',
      title: 'One year of growth',
      description: 'A full year of documented progress on SketchSpace.',
      achieved: daysSinceFirst >= 365,
      achievedAt: null,
    })
  }

  return milestones
}

export type BeforeAfterCandidate = {
  artwork: GrowthArtwork
  before: GrowthVersion
  after: GrowthVersion
  daySpan: number
}

export function buildBeforeAfterCandidates(
  artworks: GrowthArtwork[],
  versions: GrowthVersion[],
): BeforeAfterCandidate[] {
  const versionsByArtwork = new Map<string, GrowthVersion[]>()
  for (const version of versions) {
    const list = versionsByArtwork.get(version.artwork_id) ?? []
    list.push(version)
    versionsByArtwork.set(version.artwork_id, list)
  }

  const candidates: BeforeAfterCandidate[] = []
  for (const artwork of artworks) {
    const artworkVersions = (versionsByArtwork.get(artwork.id) ?? []).sort(
      (a, b) => a.version_number - b.version_number,
    )
    if (artworkVersions.length < 2) continue
    const before = artworkVersions[0]
    const after = artworkVersions[artworkVersions.length - 1]
    const daySpan = Math.round((new Date(after.created_at).getTime() - new Date(before.created_at).getTime()) / DAY_MS)
    candidates.push({ artwork, before, after, daySpan })
  }

  return candidates.sort((a, b) => b.daySpan - a.daySpan)
}
