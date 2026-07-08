import {
  GalleryVertical,
  GraduationCap,
  TrendingUp,
  Users2,
  FolderKanban,
  Flame,
} from 'lucide-react'

export type FeatureDetail = {
  icon: typeof GalleryVertical
  eyebrow: string
  title: string
  description: string
  points: string[]
  status: 'live' | 'in-progress'
}

/** What's actually shipped today vs. what's next — kept honest on purpose. */
export const featureDetails: FeatureDetail[] = [
  {
    icon: GalleryVertical,
    eyebrow: 'Artwork',
    title: 'A portfolio that works like real Storage, not a gallery template',
    description:
      'Every upload goes through real progress, retry, and cancel — not a spinner that lies to you. Multi-file drag & drop, automatic image optimization, and full version history on every piece.',
    points: [
      'Real upload progress, retry, and cancel per file',
      'Collections, tags, and visibility (public / unlisted / private)',
      'Version history with a before/after comparison view',
      'Bulk actions — visibility, delete, add to collection',
    ],
    status: 'live',
  },
  {
    icon: GraduationCap,
    eyebrow: 'Learning',
    title: 'Structured paths, not another pile of tutorial links',
    description:
      'Duolingo-style paths with units and lessons that unlock in order, real XP, streaks, and a skill tree you actually move through — not a bookmarks folder you never revisit.',
    points: [
      '9 starter paths across mediums and disciplines',
      'XP and streaks secured server-side — not client-editable',
      'Locked/current/completed lesson states with a clear next step',
      'A dashboard widget that always knows what to learn next',
    ],
    status: 'live',
  },
  {
    icon: TrendingUp,
    eyebrow: 'Growth Timeline',
    title: 'Your entire artistic history, laid out like a real timeline',
    description:
      "SketchSpace's signature view: a GitHub-style contribution heatmap, upload streaks, monthly and yearly recaps, and a draggable before/after slider built from your own version history.",
    points: [
      'Contribution heatmap built from real upload/revision activity',
      'Monthly and yearly recaps — busiest month, favorite mediums',
      'Before/after sliders generated from real artwork versions',
      'Milestones that unlock as you actually hit them',
    ],
    status: 'live',
  },
  {
    icon: Users2,
    eyebrow: 'Profile & community',
    title: 'A profile that is actually yours',
    description:
      'Avatar, banner, bio, favorite mediums, skills, social links, and a scoped accent color that re-themes your public page without touching the rest of the product. Follow other artists and build a real graph, not a follower count for show.',
    points: [
      'Avatar/banner upload with real image optimization',
      'Per-profile accent color, scoped to your public page only',
      'Public profile with real follower/following counts',
      'Portfolio layout selection (rolling out)',
    ],
    status: 'live',
  },
  {
    icon: FolderKanban,
    eyebrow: 'Projects',
    title: 'Collaborative projects with a real kanban board',
    description: 'Recruit a team, plan the work, ship something together — scoped to a shared project workspace.',
    points: ['Team membership and roles', 'Kanban board scoped per project', 'Shared version history for collaborators'],
    status: 'in-progress',
  },
  {
    icon: Flame,
    eyebrow: 'Studios',
    title: 'Creative spaces built for artists, not a forum with an art skin',
    description:
      'Purpose-built spaces per discipline — worldbuilding, character design, pixel art, and more — for critique, challenges, resources, and mentorship.',
    points: ['Artwork-anchored critique threads', 'Challenges and resources per Studio', 'Mentor spaces and moderation'],
    status: 'in-progress',
  },
]

export type PricingTier = {
  name: string
  monthly: number
  yearly: number
  description: string
  features: string[]
  cta: string
  ctaTarget: 'signup' | 'contact'
  featured: boolean
}

export const marketingPricingTiers: PricingTier[] = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    description: 'Everything you need to start improving in public.',
    features: [
      'Unlimited artwork uploads with real Storage',
      'Full version history & Growth Timeline',
      'All 9 learning paths, XP, and streaks',
      'Public profile with follow/following',
    ],
    cta: 'Start free',
    ctaTarget: 'signup',
    featured: false,
  },
  {
    name: 'Pro',
    monthly: 200,
    yearly: 150,
    description: 'For artists building a serious portfolio and daily practice.',
    features: [
      'Everything in Free',
      'Custom portfolio layouts & themes',
      'Advanced growth analytics',
      'Priority feature access',
    ],
    cta: 'Start free trial',
    ctaTarget: 'signup',
    featured: true,
  },
  {
    name: 'Teams',
    monthly: 1000,
    yearly: 750,
    description: 'For studios and creative collectives running real production.',
    features: [
      'Everything in Pro',
      'Shared team workspace & projects',
      'Admin & role management',
      'Dedicated support',
    ],
    cta: 'Talk to us',
    ctaTarget: 'contact',
    featured: false,
  },
]

export const pricingFaqs = [
  {
    question: 'Do I need a card to start?',
    answer: 'No. The Free tier is free indefinitely — no card required, no trial clock running in the background.',
  },
  {
    question: 'What happens to my data if I downgrade?',
    answer: 'Nothing gets deleted. You keep every artwork, version, and profile setting — some Pro-only features just go read-only.',
  },
  {
    question: 'Is Teams available yet?',
    answer: "Teams billing is rolling out alongside collaborative Projects. Reach out and we'll set your studio up directly.",
  },
] as const
