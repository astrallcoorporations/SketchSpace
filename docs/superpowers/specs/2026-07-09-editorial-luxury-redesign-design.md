# Editorial Luxury Redesign — Design Spec

## Purpose

SketchSpace's current design (ink & paper neutrals + violet brand accent, shader hero,
Framer/GSAP motion) is functional but reads as generic/templated, with thin
motion/interaction and loose visual hierarchy. This spec replaces the visual language
across the entire site — marketing pages and the authenticated app shell — with an
**editorial luxury** direction: warm cream/ink palette, a restrained brass/amber accent,
oversized Fraunces display type, hairline dividers instead of card shadows, and
slower/more considered motion. Existing functionality (auth, data fetching, routing,
Supabase integration) is untouched — this is a visual/motion layer change only.

## Non-goals

- No changes to routing, data-fetching logic, Supabase schema/queries, or auth flows.
- No new pages or features. Every existing route keeps its current purpose and content
  structure; only look, type, spacing, and motion change.
- Not rebuilding the shadcn component primitives from scratch — restyling them via tokens
  and targeted overrides.

## Design tokens

**Palette** (`src/index.css`, replacing the current OKLCH neutrals + violet brand):

- Light: paper `#f7f2e7` (warm cream) / ink `#1a1613` (warm near-black), warm-gray
  hairline borders (desaturated brown-gray, not pure gray)
- Dark: `#141110` (warm near-black) background / `#f2ead9` (warm cream) foreground
- Accent (`--brand`): brass/amber — `#a8763a` light, `#d4a656` dark. Used sparingly: links,
  active nav states, one hero focal moment, CTA buttons. Not smeared across every card/icon
  the way violet currently is.
- Shadows are largely replaced by 1px hairline borders (`--border` at higher contrast than
  today) for cards/panels; shadow tokens kept only for true overlays (dropdowns, dialogs,
  toasts).

**Typography**:

- Display (`--font-display`, Fraunces Variable) scales up materially — hero clamps toward
  ~8rem on desktop — and leans on the variable font's optical-size and italic axes for
  emphasis words within headlines, not just static bold.
- UI/body stays on Geist Variable (`--font-sans`) — legibility for dashboards, forms, nav
  is unchanged.
- New editorial devices, implemented as reusable pieces (not one-off per page): numbered
  section labels (`01`, `02`, ...), small-caps eyebrow text above headings, pull-quote
  style for testimonial/callout copy.

**Layout**:

- Marketing section vertical padding increases roughly 1.5x current.
- Marketing sections move off strict centered-column layouts toward asymmetric grids
  (e.g. offset headline + right-aligned supporting copy) where it doesn't hurt readability.
- App-shell pages (studio, portfolio, growth, etc.) keep their functional grid layouts —
  asymmetry is a marketing-page device, not applied to data-dense dashboard screens.

**Motion**:

- Existing GSAP/Framer motion primitives (`src/lib/motion-tokens.ts`,
  `src/components/motion/`) are retuned: slower durations, luxury easing
  (`cubic-bezier(0.16, 1, 0.3, 1)`, already used in `card-hover` — extend its use), no new
  animation library.
- Text reveal on scroll upgraded from block-level fade/rise to line/word-level stagger for
  marketing headlines.
- Image/media reveal uses a mask-wipe rather than a plain fade where feasible (portfolio
  previews, hero imagery).
- The existing shader hero (`ink-shader-material.ts`) and particle field are re-tinted to
  the new palette (ink/paper/brass ramp instead of ink/paper/violet) — geometry and
  interaction logic unchanged.
- All motion continues to respect `prefers-reduced-motion` (existing pattern in
  `reveal.tsx`/`magnetic.tsx` is preserved, not re-litigated).

## Execution order

1. **Foundation** — `src/index.css` tokens (palette, shadows→hairlines), shared components
   (`button.tsx`, `card.tsx`, and other frequently-reused `components/ui/*` restyled via
   tokens/class overrides — not rewritten from scratch), site nav/header, footer, app
   sidebar/topbar. Everything downstream inherits from this layer.
2. **Bespoke marketing pass** — landing page (hero re-tint + section-by-section treatment),
   `features-page`, `pricing-page`, `marketing-community-page`, auth pages
   (login/signup/forgot/reset). These get the fullest editorial treatment since they're
   what a visitor judges first.
3. **App-shell sweep** — studio, portfolio, projects, community, quests, notifications,
   settings, growth, artwork-detail, public-profile, learning pages. Consistency pass onto
   the new foundation components rather than full bespoke redesign — these are
   functional/data screens, not sales surfaces.
4. **Verification** — run dev server, visually check light + dark mode on a representative
   page from each of the three tiers above, confirm no regressions (build/typecheck/lint
   clean), then commit and push.

## Risks / trade-offs

- Re-tinting the WebGL shader (`ink-shader-material.ts`) touches GLSL uniforms — lower risk
  than component work but needs a visual check since `tsc` can't catch shader-only bugs
  (existing ARCHITECTURE.md caveat already flags this class of risk).
- Scope is large (~40 routes). The three-tier execution order bounds effort by giving full
  bespoke work only to marketing pages and reusing the foundation everywhere else — this is
  the intentional trade-off approved in brainstorming (foundation + bespoke marketing + app
  sweep, over full-bespoke-everything).
