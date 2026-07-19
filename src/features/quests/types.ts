import type { Database } from '@/types/database'

export type Quest = Database['public']['Tables']['quests']['Row']
export type QuestProgress = Database['public']['Tables']['quest_progress']['Row']

export type QuestWithProgress = Quest & {
  progress: QuestProgress | null
}
