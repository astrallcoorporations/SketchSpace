# SketchSpace — Architecture

Phase 1 output. Read this before adding files.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn/ui (radix base, Nova preset) ·
Framer Motion · GSAP · Three.js · React Three Fiber · Lenis · React Router v7 · Supabase.

Tailwind v4 is config-free (`@tailwindcss/vite` plugin, tokens live in `src/index.css` via
`@theme inline`). There is no `tailwind.config.ts`.

## Folder structure

```
src/
  app/                  # Composition root: providers, router. Not a feature.
    providers.tsx        — global context providers (Tooltip, Toaster, later: Auth, Query)
    router.tsx            — route table, lazy-loaded per top-level page
  pages/                # Thin route-level wrappers. One file per route, re-exports
                          # a feature's page component. Keeps router.tsx's lazy()
                          # imports pointing at stable, tiny modules.
  features/<name>/      # Feature-first modules. Each owns its components, pages,
                          # hooks, and (later) api calls. Cross-feature imports are
                          # a smell — shared code goes in components/, hooks/, lib/.
    components/
    pages/
    sections/            # (landing only) scroll-story sections
  components/
    ui/                  # shadcn primitives — generated, don't hand-edit internals
    layout/              # app shell pieces (route loader, nav, footer)
    motion/              # reusable GSAP/Framer wrappers (Phase 2)
  hooks/                 # cross-feature hooks
  lib/                   # utils.ts (cn), supabase.ts client
  types/                 # shared TS types, database.ts (generated in Phase 4)
```

## Routing

`react-router-dom` `createBrowserRouter`, every page code-split via `lazy()`. Confirmed in
the Phase 1 build: `landing-page`, `login-page`, `signup-page`, `not-found-page` each ship
as separate chunks.

## Styling / design tokens

shadcn generated OKLCH tokens in `src/index.css` (`:root` light, `.dark` dark, mapped into
Tailwind via `@theme inline`). Brand direction: **ink & paper** — the neutral Nova
grayscale (near-white paper / near-black ink) is kept as-is since it already fit, plus a
dedicated violet brand accent layered on top so structural shadcn tokens (`--primary`,
`--accent`, etc.) stay untouched and mechanical:

- `--brand` / `--brand-foreground` / `--brand-muted` / `--brand-muted-foreground` — the
  one accent color, light + dark variants. Exposed as Tailwind's `brand` color family.
  Used via `<Button variant="brand">` and directly as `bg-brand` / `text-brand` etc.
- `--font-sans` — Geist Variable (already shipped by the shadcn Nova preset) for all UI:
  dashboards, nav, forms, kanban. Matches the Linear/Arc/Stripe reference brief.
- `--font-display` — Fraunces Variable, reserved for marketing/editorial headline moments
  (landing hero, section titles). Applied via the `font-display` utility class. Never used
  in app-chrome UI — that split is what keeps the app feeling functional while the landing
  page feels handcrafted.
- `--shadow-sm/md/lg` — elevation scale (light/dark tuned separately) for cards, popovers,
  modals, so shadow depth stays consistent instead of ad-hoc per component.
- `bg-noise` utility — inline SVG fractal-noise overlay for the "paper grain" texture
  called out in the visual direction. Applied as an absolutely-positioned overlay div, not
  baked into background-color, so it can be dropped on any section.

## Motion primitives

`src/lib/motion-tokens.ts` — shared duration/easing/spring/stagger constants for both
Framer Motion and GSAP, so animations across the app share one rhythm instead of per-component
magic numbers.

`src/components/motion/`:
- `reveal.tsx` — `<Reveal>` (fade/rise on scroll into view) and `<StaggerGroup>` +
  `staggerItem` for sequenced list/grid reveals. Both respect `prefers-reduced-motion`.
- `magnetic.tsx` — `<Magnetic>` wraps any interactive element with cursor-follow pull,
  disabled for touch and reduced-motion.

The landing placeholder page now exercises all of this (brand button, Fraunces `h1`,
`bg-noise`, `Reveal`, `Magnetic`) so Phase 2 is verifiably wired end to end, not just
declared in CSS.

## Supabase

`src/lib/supabase.ts` creates the client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
(see `.env.example`). Warns to console instead of throwing when env is missing, so the app
still boots before a project is linked. `src/types/database.ts` is a placeholder until
Phase 4 runs `supabase gen types typescript`.

## Path alias

`@/*` → `src/*`, configured in `vite.config.ts` (resolve.alias) and both `tsconfig.json` /
`tsconfig.app.json` (paths, no baseUrl — deprecated in this TS version).

## Landing page (Phase 3)

`src/features/landing/`:
- `hero/` — `ink-shader-material.ts` (custom GLSL domain-warped simplex noise, ink/paper/brand
  ramp), `particle-field.tsx` (R3F point cloud + precomputed nearest-neighbor connection
  lines, cursor repulsion, scroll-driven morph into a spiral), `shader-background.tsx`,
  `hero-scene.tsx` (Canvas wrapper, lazy-loaded — three/R3F/drei live in their own chunk,
  `hero-scene-*.js`, ~237kB gzip, separate from the ~108kB gzip landing chunk).
- `sections/` — one file per landing section, each with a distinct interaction: stagger
  grid (features), SVG path-draw + count-up stats (growth), GSAP-pinned horizontal scroll
  (collaboration), pointer-tilt cards (portfolio), animated progress rings (community quests),
  dual-direction CSS marquee (testimonials), animated price crossfade (pricing), accordion
  (FAQ).
- `content.ts` — copy/data kept out of components.

Global landing plumbing: `SmoothScrollProvider` (Lenis wired into GSAP's ticker +
`ScrollTrigger.update`, opt-out entirely under reduced-motion) and `SiteHeader` (transparent
over the hero, solidifies on scroll via `useScroll`).

**Not yet visually verified** — build and typecheck are clean and the dev server boots, but
no browser tool is available in this environment to confirm the shader/particle scene
actually renders and animates as intended, or to catch runtime-only errors custom R3F/GLSL
code can hide from `tsc`. Run `npm run dev` and look before treating Phase 3 as done.

## Auth (Phase 4a)

Supabase Auth only, no mock/fake auth path.

- `lib/auth.ts` — thin wrappers over `supabase.auth.*` (password sign-in/up, Google/GitHub
  OAuth, password reset request + update, sign out).
- `lib/supabase.ts` — client now takes a **remember-aware storage adapter**: unchecking
  "Remember me" (`setRememberMe(false)`) switches the session backing store from
  `localStorage` to `sessionStorage` per call, so it's a real behavior, not a decorative
  checkbox.
- `hooks/use-auth.tsx` — `AuthProvider` mounted once at the app root (`App.tsx`), calls
  `getSession()` then subscribes via `onAuthStateChange` — single source of truth for
  session persistence across reloads. `useAuth()` exposes `session`, `user`, `loading`,
  `isPasswordRecovery`.
- `components/layout/protected-route.tsx` — redirects to `/login` (preserving the attempted
  path in router state) while `loading`/no session; used to wrap `/app`.
- `features/auth/components/` — `auth-layout.tsx` (split-screen shell reusing the **landing
  hero's `HeroScene`** at a fixed 0.3 morph position instead of scroll-driven — same
  shader/particle code, no duplication; mobile drops the Canvas entirely for a `bg-noise` +
  gradient band, a real redesign rather than a squeeze), `password-input.tsx` (show/hide
  toggle), `password-strength-meter.tsx` (`lib/password-strength.ts` heuristic, no new dep),
  `oauth-buttons.tsx` + `provider-icons.tsx` (Google/GitHub marks — lucide-react v1 dropped
  brand icons, so these are small inline SVGs).
- Pages: `/login`, `/signup` (rewritten from Phase 1 placeholders), `/forgot-password`,
  `/reset-password` (new). Signup shows an animated "check your inbox" success state when
  Supabase requires email confirmation, or redirects straight to `/app` if a session comes
  back immediately. Reset-password checks for a live recovery session and shows an
  "invalid/expired link" state otherwise.
- `/app` is a **temporary stub** (`pages/app-page.tsx`) — proves protected-route + session +
  sign-out end to end. The real dashboard shell (sidebar/topbar/onboarding empty state) is
  its own later phase; don't extend this file, replace it.

Landing page: only the fabricated `growthStats` numbers in `content.ts` changed (deflated to
believable early-access figures per direct instruction). No other landing files touched.

**Not yet visually verified** — same caveat as Phase 3: build/typecheck clean, dev server
serves all six routes, but no browser tool available here to confirm the split-screen
layout, OAuth redirects, and form states actually look and behave right. OAuth also needs
Google/GitHub providers configured in the Supabase dashboard before they'll do anything but
error.

## Phases

1. **Architecture + scaffold** — this document. Done.
2. **Design system** — real typography/color tokens, spacing scale, motion primitives,
   restyled shadcn components.
3. **Landing page** — full scroll-storytelling build (hero w/ R3F scene, features, growth,
   collaboration, community, testimonials, pricing, FAQ, footer).
4. **Auth** — Supabase schema, RLS, storage buckets, real login/signup flows.
5. **Core app** — dashboard, profile, artwork/editor, timeline, projects/kanban, messages,
   notifications, discover, settings, admin.

Each phase ships polished before the next starts — no placeholder implementations left
behind once a phase is marked done.
