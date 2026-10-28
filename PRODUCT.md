# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone who makes art and wants to get better at it, from beginners to working pros: people who draw for fun, students, and artists building toward a career or already in one. They come to improve, to show their progress, to get useful critique, and to find people to make things with.

## Product Purpose

SketchSpace is the home where artists improve together: learning, growth tracking, collaborative projects, portfolios, and community in one place. It replaces the stack of portfolio sites, Discords, and social feeds artists juggle today. Success is an artist who can see their own hand improving over time and has people to make work with.

## Positioning

Not another social feed and not another static portfolio. There is no algorithmic feed to chase: discovery is built around growth, projects, and quests, not engagement metrics. Every piece keeps its full version history, so improvement itself is visible.

## Operating Context

- Live web app with real users. Built with React 19, Vite, TypeScript, Tailwind v4, shadcn/ui, Framer Motion, GSAP, Lenis, Three.js/R3F; Supabase for auth, Postgres, storage, realtime and row-level security; deployed on Vercel.
- Public surfaces: landing (`/`), features, community, pricing, contact, login/signup/password reset, public profiles (`/u/:username`), artwork detail.
- Signed-in app: studio, growth, learning paths and lessons, quests, projects, portfolio, community feed, shared files, notifications, settings.

## Capabilities and Constraints

- Timeline and version history for every artwork.
- Collaborative projects: recruit a team, kanban tasks, shared assets, live presence.
- Community quests with XP, badges and leaderboards.
- Critique anchored to the exact spot on an artwork, threaded.
- Portfolio that assembles from the artist's work and growth.
- Learning paths and lessons; growth analytics.
- Redesign scope: the whole app (marketing and signed-in shell). Routing, data fetching, Supabase schema/queries and auth flows are not to change.
- Pricing: the app is free only today. The Pro and Collective tiers in the current code are not real plans and must not be presented as purchasable.

## Brand Commitments

- Name: SketchSpace.
- Line in use: "The home where artists improve together."
- Brand colours pinned by the author (2026-10-28): the pink→purple pair (pink `#ec4899` → violet `#8b5cf6`, magenta `#c026d3` between). Kept through the redesign.
- The author forbids AI-generated imagery on the site ("ai slop"); visuals are made in code or are real artwork.
- The redesign must not feel AI-generated, childish, or quiet/minimal.

## Evidence on Hand

- Testimonials in `src/features/landing/content.ts` are real (Mira Solstad, Deshawn Ortiz, Yuki Tanaka, Priya Nair) — confirmed by the author 2026-10-28.
- Beta stats in the same file are real: 340+ artworks uploaded in beta, 34% average skill increase per year, 12 founding creative teams.
- No press, awards, or customer logos exist; none may be invented.

## Product Principles

- Growth over engagement: every surface should make improvement visible, never chase attention.
- Making together: collaboration is a first-class act, not a side channel.
- The art is the hero: the artist's work outranks the interface.
- Honest by default: real numbers, real quotes, no invented plans or proof.
