# SketchSpace

The home where artists improve together — learning, growth, projects, portfolios, and
community in one place, built for the way artists actually get better.

Not another social feed. Not another static portfolio site.

## Tech stack

**Frontend**
- React 19 + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui (radix base, Nova preset)
- Framer Motion + GSAP (ScrollTrigger) + Lenis smooth scroll
- Three.js + React Three Fiber (custom shader + particle hero)
- React Router v7

**Backend**
- Supabase — Auth, Postgres, Storage, Realtime, Row Level Security

**Deployment**
- Vercel

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for folder structure, design tokens, and
phase-by-phase implementation notes.

## Installation

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Supabase project's values (Project Settings →
API in the Supabase dashboard):

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client-safe publishable key (formerly "anon key") |

For Google/GitHub sign-in to work, enable those providers under Authentication → Providers
in the Supabase dashboard, and add your site's URL to Authentication → URL Configuration
(redirect URLs) for both local dev and your production domain.

## Running locally

```bash
npm run dev
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Import this repository into Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in
   the Vercel project settings.
3. Vercel auto-detects the Vite build (`npm run build`, output directory `dist`).
4. Add your Vercel domain to Supabase's Authentication → URL Configuration redirect URLs.

## Project structure

```
src/
  app/                  # Composition root — providers, router
  pages/                # Thin route-level wrappers (one file per route)
  features/
    landing/            # Landing page: hero (shader + particle field), sections
    auth/                # Login/signup/forgot/reset-password + auth components
  components/
    ui/                  # shadcn primitives
    layout/              # App shell pieces (header, protected route, route loader)
    motion/               # Reusable GSAP/Framer motion primitives
  hooks/                 # Cross-feature hooks (auth, media queries)
  lib/                   # Supabase client, auth service, utils, design tokens
  types/                 # Shared TypeScript types
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck (`tsc -b`) and production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
