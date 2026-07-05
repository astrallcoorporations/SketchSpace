import { supabase } from '@/lib/supabase'
import type { LessonWithStatus, PathProgress, UnitWithLessons } from './types'

export async function listPathsWithProgress(userId?: string): Promise<PathProgress[]> {
  const { data: paths, error } = await supabase
    .from('learning_paths')
    .select('*')
    .order('order_index')
  if (error) throw error

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, unit:units(path_id)')
  if (lessonsError) throw lessonsError

  const lessonsByPath = new Map<string, string[]>()
  for (const lesson of lessons ?? []) {
    const pathId = (lesson.unit as { path_id: string } | null)?.path_id
    if (!pathId) continue
    lessonsByPath.set(pathId, [...(lessonsByPath.get(pathId) ?? []), lesson.id])
  }

  let completedIds = new Set<string>()
  if (userId) {
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('status', 'completed')
    completedIds = new Set((progress ?? []).map((p) => p.lesson_id))
  }

  return (paths ?? []).map((path) => {
    const lessonIds = lessonsByPath.get(path.id) ?? []
    const completedLessons = lessonIds.filter((id) => completedIds.has(id)).length
    return { ...path, totalLessons: lessonIds.length, completedLessons }
  })
}

export async function getPathDetail(slug: string, userId?: string) {
  const { data: path, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw error

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('*, lessons(*)')
    .eq('path_id', path.id)
    .order('order_index')
  if (unitsError) throw unitsError

  let completedIds = new Set<string>()
  if (userId) {
    const allLessonIds = (units ?? []).flatMap((u) => (u.lessons ?? []).map((l) => l.id))
    if (allLessonIds.length) {
      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .in('lesson_id', allLessonIds)
      completedIds = new Set((progress ?? []).map((p) => p.lesson_id))
    }
  }

  // Linear progression: a lesson unlocks once every lesson before it (across
  // all units, in order) is completed. The first incomplete lesson is "current".
  let unlocked = true
  const unitsWithStatus: UnitWithLessons[] = (units ?? []).map((unit) => {
    const sortedLessons = [...(unit.lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
    const lessonsWithStatus: LessonWithStatus[] = sortedLessons.map((lesson) => {
      const isCompleted = completedIds.has(lesson.id)
      let status: LessonWithStatus['status']
      if (isCompleted) status = 'completed'
      else if (unlocked) {
        status = 'current'
        unlocked = false // only the first incomplete lesson is "current"; rest stay locked
      } else status = 'locked'
      return { ...lesson, status }
    })
    return { ...unit, lessons: lessonsWithStatus }
  })

  return { path, units: unitsWithStatus }
}

export async function getLessonDetail(lessonId: string) {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*, unit:units(*, path:learning_paths(*))')
    .eq('id', lessonId)
    .single()
  if (error) throw error
  return lesson
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const { data } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()
  return data
}

export async function completeLesson(lessonId: string) {
  const { error } = await supabase.rpc('complete_lesson', { p_lesson_id: lessonId })
  if (error) throw error
}

export async function getStreak(userId: string) {
  const { data } = await supabase
    .from('learning_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

/** First not-yet-completed lesson across all paths, in curriculum order — the
 *  "continue learning" / recommended-next-lesson target for the dashboard. */
export async function getContinueLearningTarget(userId: string) {
  const paths = await listPathsWithProgress(userId)
  const nextPath = paths.find((p) => p.completedLessons < p.totalLessons)
  if (!nextPath) return null

  const { units } = await getPathDetail(nextPath.slug, userId)
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.status !== 'completed')
    if (lesson) return { path: nextPath, unit, lesson }
  }
  return null
}
