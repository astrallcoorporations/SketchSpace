import { supabase } from '@/lib/supabase'
import type { QuestProgress, QuestWithProgress } from './types'

export async function listQuestsWithProgress(userId: string): Promise<QuestWithProgress[]> {
  const [questsRes, progressRes] = await Promise.all([
    supabase.from('quests').select('*').order('xp_reward', { ascending: true }),
    supabase.from('quest_progress').select('*').eq('user_id', userId),
  ])
  if (questsRes.error) throw questsRes.error
  if (progressRes.error) throw progressRes.error

  const progressByQuest = new Map(progressRes.data.map((p) => [p.quest_id, p]))
  return questsRes.data.map((quest) => ({
    ...quest,
    progress: progressByQuest.get(quest.id) ?? null,
  }))
}

export async function joinQuest(userId: string, questId: string): Promise<QuestProgress> {
  const { data, error } = await supabase
    .from('quest_progress')
    .insert({ user_id: userId, quest_id: questId, progress: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Log one unit of progress; stamps completed_at when the goal is reached. */
export async function logQuestProgress(
  entry: QuestProgress,
  goal: number,
): Promise<QuestProgress> {
  const next = Math.min(entry.progress + 1, goal)
  const { data, error } = await supabase
    .from('quest_progress')
    .update({
      progress: next,
      completed_at: next >= goal ? new Date().toISOString() : null,
    })
    .eq('id', entry.id)
    .select()
    .single()
  if (error) throw error
  return data
}
