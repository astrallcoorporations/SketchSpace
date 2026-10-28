---
name: SketchSpace
description: The home where artists improve together. A marker swatch ladder from blank paper to the deepest violet pass.
colors:
  paper: "#fbf8fd"
  paper-ink: "#1d1424"
  paper-rule: "#d9cfe3"
  pass-v6: "#160d1d"
  pass-v5: "#1a1022"
  pass-v4: "#221630"
  pass-v3: "#2a1b39"
  pass-v2: "#33214a"
  pass-v1: "#3d2a52"
  ink-pink: "#ec4899"
  ink-pink-light: "#f59ac8"
  ink-magenta: "#c026d3"
  ink-magenta-light: "#e27cec"
  ink-violet: "#8b5cf6"
  ink-violet-light: "#b49af9"
  foreground: "#f4ecfa"
  muted-foreground: "#ab98bf"
  input: "#4a3362"
  popover: "#261936"
  secondary: "#2c1d3c"
  sidebar-border: "#2e1f40"
  brand-muted: "#3a1846"
  brand-muted-foreground: "#f3c6f6"
  destructive: "#ff7088"
typography:
  display:
    fontFamily: "'Anybody Variable', 'Geist Variable', sans-serif"
    fontSize: "clamp(3.2rem, 7.4vw, 6rem)"
    fontWeight: 860
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "'Anybody Variable', 'Geist Variable', sans-serif"
    fontSize: "3rem"
    fontWeight: 860
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "'Anybody Variable', 'Geist Variable', sans-serif"
    fontSize: "1.875rem"
    fontWeight: 860
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  body:
    fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "'Geist Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
  code:
    fontFamily: "'Martian Mono Variable', ui-monospace, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
    fontFeature: "'tnum' 1"
rounded:
  sheet: "4px"
  md: "6.4px"
  lg: "8px"
  full: "9999px"
spacing:
  swatch-gap: "6px"
  rack-gap: "8px"
  sheet-pad: "16px"
  sheet-pad-lg: "24px"
  gutter: "16px"
  gutter-lg: "32px"
  section: "96px"
  section-lg: "128px"
components:
  button-brand:
    backgroundColor: "{colors.ink-magenta}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-brand-hover:
    backgroundColor: "color-mix(in oklch, #c026d3, black 14%)"
  button-brand-lg:
    backgroundColor: "{colors.ink-magenta}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "48px"
  button-primary:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.pass-v5}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.pass-v2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.pass-v2}"
  cap-link:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 16px 0 8px"
    height: "40px"
  cap-link-hover:
    backgroundColor: "{colors.pass-v2}"
  sidebar-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
  sidebar-link-active:
    backgroundColor: "{colors.pass-v3}"
    textColor: "{colors.foreground}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.sheet}"
    padding: "{spacing.sheet-pad}"
  panel:
    backgroundColor: "{colors.pass-v4}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "12px"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "0 10px 0 36px"
    height: "40px"
---

# Design System: SketchSpace

## Overview

**Creative North Star: "The Swatch Chart"**

SketchSpace shows growth the way artists test markers: the same swatch filled pass after pass until the colour goes deep. The whole palette is one ladder of a single violet marker, from blank paper at the light end to the deepest pass at the dark end, and that deepest pass is the ground everything stands on. Each surface above the ground is one pass lighter. Pink, magenta and violet are the pinned brand inks; they arrive as marker dye, multiplied and streaky, not as flat fills.

Two materials share the screen. The violet ground carries the interface: navigation, controls, panels, prose. Paper test sheets lie on that ground and carry the things that matter: canvas-drawn swatches and real artwork, each piece mounted with a sewn label naming its artist, version count and date. Controls are marker caps: full pills with a 2px ink rim, and where a control is a call to act, a coloured cap dot. Display lettering is the condensed heavy face printed on a marker barrel, always uppercase.

The system is loud on purpose (it must not feel quiet, minimal, childish or generated) but it has exactly one live edge. Magenta marks the active thing and the primary call to act; everything else is violet, paper and ink. The app ships dark only.

**Key Characteristics:**
- One swatch ladder: paper, then six violet passes, with the fifth pass as the page ground.
- Paper sheets carry swatches and real art; the violet ground carries UI.
- Marker-cap pills with 2px rims for every button and route.
- Condensed heavy uppercase display (Anybody), Geist for UI, Martian Mono only for codes, dates and counts.
- Swatches are drawn in canvas as multiplied marker passes and fill stroke by stroke on first view.
- One live magenta edge; nothing else wears the accent.
- Dark only. Sign-up and log-in are a sanctioned scoped exception that keeps the original light look.

## Colors

One violet marker family from paper to the deepest pass, with three pinned brand inks laid over it.

### Primary
- **Live Magenta** (ink-magenta): the brand ink. Fills the primary call to act ("Create free account", "Open Studio") as a white-dotted cap pill, and the notification count badge. Never decoration.
- **Live Edge Magenta** (ink-magenta-light): the active mark. Rim of the active route cap, dot beside the active sidebar item, rim of the active critique comment, the focus outline, the hover underline on nav links, the text caret and the emphasis colour that replaced gradient text.

### Secondary
- **Marker Pink** (ink-pink): first ink of the swatch rows and the Features route cap; the text selection background (with white text).
- **Pale Pink Ink** (ink-pink-light): text links on the violet ground, including the link button variant.

### Tertiary
- **Marker Violet** (ink-violet): third ink of the swatch rows and the Pricing route cap.
- **Pale Violet Ink** (ink-violet-light): the outline button's cap dot and hover rim, feature icons, hover rim on artist rows and avatar caps, and the Contact route cap.

### Neutral
- **Blank Paper** (paper): test sheets that carry swatches and artwork; the canvas base under every swatch.
- **Sheet Ink** (paper-ink): text, rules and the 1.5px swatch-cell borders on paper. Used at 70-80% for secondary text on sheets.
- **Sheet Rule** (paper-rule): the empty image well inside a mounted piece.
- **Deepest Pass** (pass-v6): the sidebar, the scrollbar track, and alternating full-bleed landing sections.
- **Ground Pass** (pass-v5): the page background and the hero shader's paper colour.
- **Panel Pass** (pass-v4): cards, artist rows, the mobile menu sheet, an active critique comment.
- **Raised Pass** (pass-v3): muted fills, avatar caps, the active sidebar item.
- **Hover Pass** (pass-v2): accent fill under hovered pills and ghost controls.
- **Rim Pass** (pass-v1): the default 2px border, the scrollbar thumb.
- **Pale Ink Text** (foreground): body and heading text on the ground; the fill of the default (light) button.
- **Faded Ink Text** (muted-foreground): secondary text, metadata, inactive sidebar labels.
- **Field Rim** (input): field borders and the hover rim on route caps and the outline button.
- **Popover Pass** (popover), **Secondary Pass** (secondary), **Sidebar Rule** (sidebar-border): the in-between passes for popovers, secondary buttons and sidebar dividers.
- **Brand Wash** (brand-muted) with **Brand Wash Ink** (brand-muted-foreground): tinted chip and icon-well fills.
- **Error Ink** (destructive): error text and a 15% wash behind destructive buttons.

### Named Rules
**The Swatch Ladder Rule.** Every violet surface is one rung of the ladder: ground at pass five, panels at four, raised fills at three, hover at two, rims at one, the sidebar at six. A new surface takes the next rung up; it never introduces an off-ladder neutral.

**The One Live Edge Rule.** Magenta marks the active thing (light magenta for rims, dots, focus and caret) and fills the primary call to act (brand magenta). Nothing else wears magenta: not hover glows, not icons, not section decoration.

**The Ink, Never Gradient Rule.** Emphasis is a single ink colour. Gradient text and gradient buttons are retired; gradients survive only as legibility scrims over the hero shader.

## Typography

**Display Font:** Anybody Variable (with Geist Variable, sans-serif)
**Body Font:** Geist Variable (with ui-sans-serif, system-ui)
**Label/Mono Font:** Martian Mono Variable (with ui-monospace)

**Character:** Anybody pulled to 62% width at weight 860 reads like the lettering on a marker barrel: tall, packed and loud. Geist does the plain work of UI and prose underneath it, and Martian Mono stamps the codes, dates and counts the way a swatch chart is hand-coded.

### Hierarchy
- **Display** (860, clamp(3.2rem, 7.4vw, 6rem), 0.86, uppercase): page headlines only, one per page. Marketing pages run the same clamp at 3-6.5rem.
- **Headline** (860, 3rem rising to 3.75-4.5rem at sm, 0.9, uppercase): section headings on landing and marketing pages.
- **Title** (860, 1.875-2.25rem, 1, uppercase): sub-section heads, empty and error state headings, sheet titles, big stat figures (1.875-2.25rem).
- **Body** (400, 1rem, 1.5): UI copy. **Body lead** (400, 1.125rem, 1.625, max 34rem or 60ch): the paragraph under a headline.
- **Label** (500, 0.875rem): buttons, route caps, sidebar items.
- **Code** (400, 0.6-0.75rem, tabular numerals): swatch codes (P-01, M3), month rows, dates, version counts, follower and piece counts, captions on test sheets.

### Named Rules
**The Barrel Lettering Rule.** The display face is always condensed, heavy and uppercase, and only for headings, the wordmark, avatar initials and big figures. It never sets a paragraph.

**The Data-Only Mono Rule.** Martian Mono is for codes, dates and counts. It never sets prose, buttons or headings.

**The Standalone Heading Rule.** A heading stands alone. No eyebrow or kicker label sits above it; the old eyebrow style is retired to nothing.

## Layout

Content sits in a centred container capped at 88rem with 16px side gutters (32px from sm). Landing and marketing sections breathe at 96px vertical padding, 128px from sm, and alternate between the ground pass and the deepest pass as full-bleed bands. The hero and feature rows split asymmetrically, 5 to 6 (copy left, sheet right), with 48-64px between columns, and collapse to one column below lg. Feature rows on the features page are divided by a 2px rule rather than boxed.

The site header is a fixed rack of cap pills (wordmark left, route caps, then Log in and the brand call to act) that is transparent at the top and fills with the ground and a 2px bottom rim once scrolled past 12px. Below lg the routes move into a right-hand sheet on the panel pass. The signed-in shell is a 256px sticky sidebar on the deepest pass beside a sticky topbar with a 2px bottom rim.

Inside sheets the swatch chart is a table: month codes in a narrow left column, swatch cells spaced 6px apart (8px from sm), 44-56px tall, with 2px paper-ink rules above and below the legend.

## Elevation & Depth

Depth is mostly tonal: a violet surface is "higher" because it is one pass lighter and carries a 2px rim. The only real lift belongs to paper. A test sheet lies on the ground with a hairline contact shadow and a long, deep violet-black falloff, so paper reads as an object on a dark desk. Shadows are tinted with the ground hue (hsl 270 60% 3%), never neutral grey.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 1px 0 hsl(270 60% 3% / 0.4), 0 28px 60px -28px hsl(270 60% 3% / 0.9)`): every paper test sheet and mounted piece.
- **Small** (`box-shadow: 0 1px 2px hsl(270 60% 3% / 0.5)`): small floating handles and nodes.
- **Medium** (`box-shadow: 0 6px 16px -6px hsl(270 60% 3% / 0.7)`): popovers and floating controls.
- **Large** (`box-shadow: 0 24px 48px -20px hsl(270 60% 3% / 0.85)`): the largest floating layers only.

### Named Rules
**The Paper Lifts Rule.** Only paper casts the deep shadow. Violet panels are flat and separate themselves by pass and rim, not by shadow.

## Shapes

Two silhouettes carry the system. Everything you press is a marker cap: a full pill (9999px) with a 2px rim, and icon controls are round caps. Everything you look at sits on a sheet: paper with barely softened 4px corners. Inside sheets, swatch cells are square-cornered with a 1.5px paper-ink border, and mounted art is cropped square or 4:5 inside a 10px paper margin, with a dashed 1.5px rule above its sewn label. Violet panels (artist rows, critique comments, cards) use gentle 6-8px corners and a 2px rim. Borders are 2px on the ground and 1.5px on paper.

The brand mark repeats the swatch idea: three overlapping rounded passes, pink over magenta over violet, tilted -6 degrees and screened together.

## Components

### Buttons
Every button is a capped marker: tactile, loud, and obvious about what it does.
- **Shape:** full pill (9999px) with a 2px rim; 40px tall by default, 28/32/48px for xs/sm/lg; icon sizes are round caps (28-44px) with no dot.
- **Brand (primary call to act):** brand magenta fill, white label, a rim of magenta lifted 18% toward white, and a white cap dot (10px) before the label. Hover darkens the fill 14% toward black.
- **Default:** pale ink fill with ground-pass text; hover tints it 14% toward violet.
- **Outline:** transparent with the field-rim border and a pale-violet cap dot; hover swaps the rim to pale violet and fills with the hover pass.
- **Ghost / Secondary:** no rim colour; hover fills with the hover pass. Secondary rests on the secondary pass.
- **Link:** pale pink text, no pill, underline on hover.
- **Destructive:** error ink on a 15% error wash.
- **Focus / Active:** a 2px light-magenta outline offset 2px; pressing nudges the cap down 1px. Transitions run 200ms on colour, border and transform.

### Chips
- **Status chip:** a small pill with a 2px field-rim border, 0.75rem medium muted text and an inline 14px icon ("In development").
- **Count badge:** a brand-magenta pill on the notification bell, 10px label.

### Cards / Containers
- **Paper sheet:** the signature container. Paper fill, sheet ink, 4px corners, sheet-lift shadow, 16-24px padding. Carries swatches, charts and artwork, never controls-only UI.
- **Violet panel:** panel pass, 2px rim, 6-8px corners, 12-16px padding; hover swaps the rim to pale violet. Carries UI: artist rows, comments, lists.
- **Shadow strategy:** see Elevation; panels are flat.

### Inputs / Fields
- **Search field:** a 40px pill with a leading 16px search icon at muted ink, 36px left padding, field-rim border.
- **Focus:** border shifts to light magenta (the focus is the active thing); keyboard focus also shows the 2px light-magenta outline.
- **Error / Disabled:** error-ink border with a faint error ring; disabled drops to 50% opacity.

### Navigation
- **Route caps (marketing rack):** 40px pills with a 2px rim pass border, a 20px cap dot in the route's own ink (Features pink, Community magenta, Pricing violet, Contact pale violet) ringed by the ground, and a 0.875rem medium label. Hover fills with the hover pass and raises the rim to field rim; the active route's rim turns light magenta.
- **Sidebar (signed-in shell):** pill items with an 18px line icon at 1.75 stroke, muted label, and a 10px trailing dot. Hover fills with the sidebar accent and shows a rim-pass dot; active fills with the raised pass, gains a sidebar-rule rim, brightens the label and turns the dot light magenta.
- **Mobile:** routes collapse into a side sheet; the same cap pills stack vertically with the brand call to act below.

### Marker Swatch (signature)
A canvas-drawn swatch on paper. Each pass is a set of overlapping chisel strokes in the ink diluted to 52% strength, multiplied over the paper and the passes below, so colour deepens with every pass. The nib is a fixed size (6-30px), so larger swatches take more strokes; alternate passes lean in opposite directions so the seams cross; stroke ends pool and stay ragged. Output is deterministic per seed. With animation on, the passes lay down at 70ms per stroke the first time the swatch is 40% in view; with reduced motion the swatch paints complete immediately.

### Marker Scribble (signature)
An overlay on test sheets that takes a marker stroke from the pointer: a chisel line 7-16px wide depending on direction, multiplied over the sheet, fading shortly after the pointer stops.

### Mounted Piece (signature)
Real artwork mounted on a paper sheet with a 10px margin, the image cropped square or 4:5, and a sewn label under a dashed rule: title in semibold, "by" artist on the left, version count and month-year in mono on the right. The image eases up 3% on hover.

### Swatch Ladder (signature)
The brand's own test sheet for marketing page headers: three rows (P, M, V) of one to six passes, each cell coded in mono, with a scribble overlay and a mono caption under a 1.5px rule.

### Ink Hero Field
The original WebGL ink shader and particle field, re-inked through a palette: on the landing page its paper is the ground pass with violet and pink inks and pale ink highlights. Scroll morphs the particle field; reduced motion stops it. A horizontal scrim keeps the copy column legible while the ink stays loud behind the chart.

### Classic Auth Screens (sanctioned scoped exception)
Sign-up, log-in and password screens deliberately keep the original look at the author's request, scoped under `.theme-classic`: white canvas, near-black ink, the original pink-purple accent, Fraunces display at weight 500, 1px-rimmed buttons at the old 6px radius with no cap dot, light shadows, and the original shader panel. This is not drift. Nothing outside the auth layout uses it, and nothing inside it should be converted to the swatch world.

## Do's and Don'ts

### Do:
- **Do** build every violet surface from the ladder: ground pass five, panels four, raised three, hover two, rims one, sidebar six.
- **Do** put swatches and real artwork on paper sheets (4px corners, sheet-lift shadow) and keep UI on the violet ground.
- **Do** make every button and route a full pill with a 2px rim; give the brand call to act its white cap dot and the outline button its pale-violet dot.
- **Do** reserve light magenta for the active thing: the active route rim, the active sidebar dot, the active comment rim, focus and caret.
- **Do** set headings in condensed heavy uppercase Anybody at 0.86-0.9 line height, and codes, dates and counts in Martian Mono with tabular numerals.
- **Do** draw swatches with the marker-ink model (multiplied passes, fixed chisel nib up to 30px, alternating lean) and paint them complete under reduced motion.
- **Do** label every mounted piece with its artist, version count and date.
- **Do** keep the sign-up and log-in screens in the classic scope exactly as they are.

### Don't:
- **Don't** add a light theme or a theme toggle; the app is dark only.
- **Don't** put magenta on anything that is not active or the primary call to act: no magenta hover glows, icons or decorative fills.
- **Don't** use gradient text or gradient buttons; emphasis is one ink colour.
- **Don't** place an eyebrow or kicker label above a heading.
- **Don't** use AI-generated imagery anywhere; visuals are drawn in code or are real artwork.
- **Don't** present any paid tier; pricing shows the free plan only.
- **Don't** give violet panels drop shadows or glass blur; they separate by pass and rim.
- **Don't** set prose, buttons or headings in Martian Mono, or paragraphs in the display face.
