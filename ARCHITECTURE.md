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

## App shell + onboarding (Phase 5, step 1)

`src/features/shell/`:
- `nav-items.ts` — single source of truth for the 8 sidebar destinations (Studio, Growth,
  Portfolio, Projects, Community, Quests, Notifications, Settings), consumed by both the
  desktop sidebar and the mobile drawer so they can't drift out of sync.
- `components/sidebar.tsx` — `SidebarNav` (the actual nav markup, active-state via
  `NavLink`, user email + sign-out footer) is a separate export from `Sidebar` (the
  persistent desktop `<aside>`) so the exact same nav renders inside the mobile `Sheet`
  drawer in `topbar.tsx` with zero duplication.
- `components/topbar.tsx` — search input (real state, no fake results since there's no
  data yet), Quick Upload, notifications bell, account dropdown (shadcn `DropdownMenu`).
- `components/app-shell.tsx` — layout route wrapper (`Outlet`) composing sidebar + topbar.
- `components/empty-state.tsx` — the one shared "nothing here yet" component; every nav
  destination except Studio/Settings is currently just this with different copy. No fake
  data anywhere — actions that aren't built yet (upload, new project, quests) call
  `sonner`'s `toast()` with an honest "coming soon" instead of doing nothing or faking
  success.
- `/app` is now a real nested layout route (`app/router.tsx`): `index` → Studio
  (onboarding), then `growth` / `portfolio` / `projects` / `community` / `quests` /
  `notifications` / `settings`. Replaces the Phase 4a temporary stub (deleted).

## Database (Phase 4b)

Applied directly to the linked Supabase project via migrations (`create_profiles`,
`create_artworks`, `create_projects`, `create_quests`, `create_social`, `harden_functions`).
RLS enabled on every table, no exceptions:

- **profiles** — one row per `auth.users` row, auto-provisioned by a
  `handle_new_user()` trigger (derives a unique username from the email, revoked from the
  public RPC surface so it's only reachable via the trigger). Public read, owner-only
  write.
- **artworks** / **artwork_versions** — visibility (`public`/`unlisted`/`private`) gates
  reads; only the owner can write. Versions inherit the parent artwork's visibility.
- **projects** / **project_members** / **tasks** — membership-gated throughout: reads
  require public visibility or membership, writes require ownership or membership.
- **quests** — public read-only catalog, no client write policy at all (curated
  server-side, not user-generated).
- **quest_progress** — user reads/writes only their own row.
- **comments** / **likes** — follow the parent artwork's visibility for reads; writes
  scoped to the authenticated user as author.
- **followers** — public read (follow graphs are public data), writes scoped to the
  follower's own edges.
- **notifications** / **activity_feed** — read-only from the client (own rows only); both
  are meant to be written by triggers/service role later, not by users directly.

`set_updated_at()` trigger function reused across every table with an `updated_at` column.
`src/types/database.ts` is now the real generated Supabase types (not the Phase 1
placeholder) — `lib/supabase.ts` uses `createClient<Database>(...)`.

Remaining, not code-fixable: Supabase's leaked-password-protection (HaveIBeenPwned check)
is off by default — flip it on in the dashboard under Authentication → Policies.

## Phases

1. **Architecture + scaffold** — done.
2. **Design system** — done.
3. **Landing page** — done.
4. **Auth** (4a) + **Database** (4b) — done.
5. **Core app** — app shell + onboarding done (step 1 above). Remaining: artwork upload,
   Growth Timeline, and the rest of the nested `/app` pages get real functionality instead
   of empty states.

Each phase ships polished before the next starts — no placeholder implementations left
behind once a phase is marked done.
