import {
  Layers,
  GitBranch,
  MessageCircle,
  Trophy,
  Sparkles,
  Users,
} from 'lucide-react'

export const features = [
  {
    icon: Layers,
    title: 'Timeline & version history',
    description:
      'Every piece keeps its full history — watch your own hand improve, stroke by stroke, month over month.',
  },
  {
    icon: GitBranch,
    title: 'Collaborative projects',
    description:
      'Recruit a team, assign tasks on a real kanban board, and ship creative work together — not just talk about it.',
  },
  {
    icon: Trophy,
    title: 'Community quests',
    description:
      'Structured challenges with XP, badges, and leaderboards that reward showing up, not just going viral.',
  },
  {
    icon: MessageCircle,
    title: 'Critique that counts',
    description:
      'Threaded, artwork-anchored feedback — comments point at the exact stroke, not a wall of vague reactions.',
  },
  {
    icon: Sparkles,
    title: 'Portfolio builder',
    description:
      'A living portfolio that assembles itself from your best work and your growth curve — no template wrangling.',
  },
  {
    icon: Users,
    title: 'Real-time collaboration',
    description:
      'See teammates working live inside a shared project — presence, comments, and tasks in one canvas.',
  },
] as const

// Early-access numbers — honest, not inflated. Update as the community grows.
export const growthStats = [
  { label: 'Artworks uploaded in beta', value: 340, suffix: '+' },
  { label: 'Avg. skill increase / year', value: 34, suffix: '%' },
  { label: 'Founding creative teams', value: 12, suffix: '' },
] as const

export const collaborationShowcase = [
  {
    title: 'Recruit a team',
    description: 'Post an open role, review portfolios, invite in one click.',
  },
  {
    title: 'Plan the work',
    description: 'A real kanban board scoped to the project — not a side channel.',
  },
  {
    title: 'Ship together',
    description: 'Shared canvas, live presence, version-controlled assets.',
  },
  {
    title: 'Show the result',
    description: 'The finished project becomes a portfolio piece for every collaborator.',
  },
] as const

export const testimonials = [
  {
    quote:
      "I've used four different portfolio sites and two Discords for this. SketchSpace replaced all of them in a week.",
    name: 'Mira Solstad',
    role: 'Character artist',
  },
  {
    quote:
      'The timeline feature alone justified switching — seeing six months of a piece evolving is better than any tutorial.',
    name: 'Deshawn Ortiz',
    role: 'Concept artist',
  },
  {
    quote: 'Found my current studio through a community quest. Did not expect that.',
    name: 'Yuki Tanaka',
    role: 'Illustrator',
  },
  {
    quote: 'First platform where critique feels constructive instead of a popularity contest.',
    name: 'Priya Nair',
    role: '3D generalist',
  },
] as const

export const pricingTiers = [
  {
    name: 'Studio',
    monthly: 0,
    yearly: 0,
    description: 'Everything you need to start improving in public.',
    features: [
      'Unlimited artwork uploads',
      'Full timeline & version history',
      'Join community quests',
      '1 active project',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    monthly: 200,
    yearly: 150,
    description: 'For artists building a serious portfolio and team practice.',
    features: [
      'Everything in Studio',
      'Unlimited projects & teams',
      'Advanced skill analytics',
      'Priority critique queue',
    ],
    featured: true,
  },
  {
    name: 'Collective',
    monthly: 1000,
    yearly: 750,
    description: 'For studios and creative collectives running real production.',
    features: [
      'Everything in Pro',
      'Shared team workspace',
      'Admin & role management',
      'Dedicated support',
    ],
    featured: false,
  },
] as const

export const faqs = [
  {
    question: 'Is SketchSpace a social network?',
    answer:
      'No. There is no algorithmic feed to chase. Discovery is built around growth, projects, and quests — not engagement metrics.',
  },
  {
    question: 'Can I import my existing portfolio?',
    answer:
      'Yes — bulk-upload existing artwork and SketchSpace reconstructs a timeline from file metadata where available, no manual re-entry needed.',
  },
  {
    question: 'How do creative teams work?',
    answer:
      'A project gets its own workspace: kanban board, shared files, real-time presence, and a version history scoped to that project.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'You keep full export access to every artwork, comment, and project file at any time — there is no lock-in.',
  },
] as const
