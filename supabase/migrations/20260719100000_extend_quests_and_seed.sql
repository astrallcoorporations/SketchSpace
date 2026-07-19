-- Quests were a bare catalog with no goal semantics and no rows.
-- Add a goal (target count) + category, then seed the launch catalog.

alter table public.quests
  add column if not exists goal integer not null default 1,
  add column if not exists category text not null default 'general';

insert into public.quests (slug, title, description, xp_reward, goal, category) values
  ('first-upload', 'First brushstroke', 'Share your first artwork with the community.', 50, 1, 'portfolio'),
  ('daily-sketch-7', 'Daily sketch week', 'Sketch and log your practice every day for seven days.', 150, 7, 'practice'),
  ('gallery-five', 'Open gallery', 'Publish five public artworks to your portfolio.', 120, 5, 'portfolio'),
  ('curator', 'Curator', 'Create your first collection and add artwork to it.', 40, 1, 'portfolio'),
  ('kind-critic', 'Kind critic', 'Leave thoughtful comments on five community artworks.', 80, 5, 'community'),
  ('new-friends', 'Find your people', 'Follow three artists whose work inspires you.', 30, 3, 'community'),
  ('glow-up', 'Glow up', 'Post a new version of an old artwork to show your growth.', 60, 1, 'growth'),
  ('scholar', 'Scholar', 'Complete ten lessons across any learning path.', 200, 10, 'learning')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  xp_reward = excluded.xp_reward,
  goal = excluded.goal,
  category = excluded.category;
