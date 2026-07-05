import type { Tables } from '@/types/database'

export type LearningPath = Tables<'learning_paths'>
export type Unit = Tables<'units'>
export type Lesson = Tables<'lessons'>
export type LessonProgress = Tables<'lesson_progress'>
export type LearningStreak = Tables<'learning_streaks'>

export type LessonStatus = 'completed' | 'current' | 'locked'

export type LessonWithStatus = Lesson & { status: LessonStatus }
export type UnitWithLessons = Unit & { lessons: LessonWithStatus[] }

export type PathProgress = LearningPath & {
  totalLessons: number
  completedLessons: number
}
