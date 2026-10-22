---
version: alpha
name: <Product name>
description: "<One sentence on who it's for and what they do with it. The look is decided by /front-end-design, not here.>"
colors:
  # 12-step scales (Radix roles): 1–2 backgrounds, 3–5 component fills (default, hover, pressed),
  # 6–8 borders (subtle, default, strong/focus), 9–10 solid fills, 11 muted text, 12 text.
  # Generate them with: node .agents/tools/design-palette.mjs --hue <0-360> --chroma <0-0.3>
  neutral-1: "oklch(0.993 0.002 260)"
  neutral-2: "oklch(0.982 0.003 260)"
  neutral-3: "oklch(0.958 0.004 260)"
  neutral-4: "oklch(0.934 0.005 260)"
  neutral-5: "oklch(0.910 0.006 260)"
  neutral-6: "oklch(0.884 0.007 260)"
  neutral-7: "oklch(0.846 0.008 260)"
  neutral-8: "oklch(0.775 0.010 260)"
  neutral-9: "oklch(0.640 0.012 260)"
  neutral-10: "oklch(0.600 0.012 260)"
  neutral-11: "oklch(0.500 0.012 260)"
  neutral-12: "oklch(0.220 0.010 260)"
  accent-1: "oklch(0.993 0.005 255)"
  accent-2: "oklch(0.978 0.013 255)"
  accent-3: "oklch(0.950 0.032 255)"
  accent-4: "oklch(0.920 0.052 255)"
  accent-5: "oklch(0.885 0.072 255)"
  accent-6: "oklch(0.840 0.090 255)"
  accent-7: "oklch(0.780 0.110 255)"
  accent-8: "oklch(0.700 0.140 255)"
  accent-9: "oklch(0.550 0.200 255)"
  accent-10: "oklch(0.510 0.200 255)"
  accent-11: "oklch(0.480 0.180 255)"
  accent-12: "oklch(0.300 0.100 255)"
  neutral-1-dark: "oklch(0.170 0.004 260)"
  neutral-2-dark: "oklch(0.200 0.005 260)"
  neutral-3-dark: "oklch(0.235 0.006 260)"
  neutral-4-dark: "oklch(0.260 0.007 260)"
  neutral-5-dark: "oklch(0.285 0.008 260)"
  neutral-6-dark: "oklch(0.315 0.009 260)"
  neutral-7-dark: "oklch(0.360 0.010 260)"
  neutral-8-dark: "oklch(0.440 0.012 260)"
  neutral-9-dark: "oklch(0.500 0.012 260)"
  neutral-10-dark: "oklch(0.560 0.012 260)"
  neutral-11-dark: "oklch(0.770 0.010 260)"
  neutral-12-dark: "oklch(0.950 0.004 260)"
  accent-1-dark: "oklch(0.180 0.020 255)"
  accent-2-dark: "oklch(0.210 0.030 255)"
  accent-3-dark: "oklch(0.270 0.060 255)"
  accent-4-dark: "oklch(0.310 0.085 255)"
  accent-5-dark: "oklch(0.350 0.100 255)"
  accent-6-dark: "oklch(0.400 0.110 255)"
  accent-7-dark: "oklch(0.460 0.130 255)"
  accent-8-dark: "oklch(0.530 0.160 255)"
  accent-9-dark: "oklch(0.550 0.200 255)"
  accent-10-dark: "oklch(0.600 0.190 255)"
  accent-11-dark: "oklch(0.780 0.120 255)"
  accent-12-dark: "oklch(0.930 0.040 255)"
  # Semantic aliases: components use these, never the steps directly.
  background: "{colors.neutral-1}"
  surface: "{colors.neutral-2}"
  surface-raised: "#ffffff"
  border: "{colors.neutral-6}"
  ink: "{colors.neutral-12}"
  ink-muted: "{colors.neutral-11}"
  primary: "{colors.accent-9}"
  primary-hover: "{colors.accent-10}"
  on-primary: "#ffffff"
  focus: "{colors.accent-9}"
  success: "oklch(0.520 0.140 150)"
  warning: "oklch(0.560 0.130 70)"
  error: "oklch(0.540 0.190 25)"
  background-dark: "{colors.neutral-1-dark}"
  surface-dark: "{colors.neutral-2-dark}"
  surface-raised-dark: "{colors.neutral-3-dark}"
  border-dark: "{colors.neutral-6-dark}"
  ink-dark: "{colors.neutral-12-dark}"
  ink-muted-dark: "{colors.neutral-11-dark}"
  primary-dark: "{colors.accent-9-dark}"
  primary-hover-dark: "{colors.accent-10-dark}"
  on-primary-dark: "#ffffff"
  focus-dark: "{colors.accent-9-dark}"
  success-dark: "oklch(0.720 0.150 150)"
  warning-dark: "oklch(0.800 0.140 80)"
  error-dark: "oklch(0.700 0.170 25)"
  # Charts: distinct in hue and lightness, each readable on background and background-dark.
  chart-1: "oklch(0.550 0.200 255)"
  chart-2: "oklch(0.650 0.150 180)"
  chart-3: "oklch(0.700 0.160 75)"
  chart-4: "oklch(0.580 0.200 25)"
  chart-5: "oklch(0.550 0.180 300)"
  chart-6: "oklch(0.600 0.020 260)"
typography:
  display:     { fontFamily: <Display font>, fontSize: 48px, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.03em }
  headline-lg: { fontFamily: <Display font>, fontSize: 32px, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.02em }
  headline-md: { fontFamily: <Text font>, fontSize: 24px, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.01em }
  headline-sm: { fontFamily: <Text font>, fontSize: 18px, fontWeight: 600, lineHeight: 1.3 }
  body-lg:     { fontFamily: <Text font>, fontSize: 17px, fontWeight: 400, lineHeight: 1.55 }
  body-md:     { fontFamily: <Text font>, fontSize: 15px, fontWeight: 400, lineHeight: 1.5 }
  body-sm:     { fontFamily: <Text font>, fontSize: 13px, fontWeight: 400, lineHeight: 1.45 }
  label-md:    { fontFamily: <Text font>, fontSize: 13px, fontWeight: 500, lineHeight: 1.2 }
  label-sm:    { fontFamily: <Text font>, fontSize: 12px, fontWeight: 500, lineHeight: 1.2, letterSpacing: 0.01em }
  numeric:     { fontFamily: <Text font>, fontSize: 15px, fontWeight: 500, lineHeight: 1.2, fontFeature: "'tnum' 1" }
  mono:        { fontFamily: <Mono font>, fontSize: 13px, fontWeight: 400, lineHeight: 1.5 }
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  section-y: 96px
  page-x-desktop: 32px
  page-x-mobile: 16px
  content-max: 1200px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
# Extra tokens (design.md lint warns on these keys; tools/design-tokens.mjs exports them to Tailwind).
motion:
  duration-instant: 100ms
  duration-fast: 150ms
  duration-base: 220ms
  duration-slow: 320ms
  duration-page: 400ms
  ease-out: "cubic-bezier(0.22, 1, 0.36, 1)"
  ease-in-out: "cubic-bezier(0.65, 0, 0.35, 1)"
  ease-in: "cubic-bezier(0.55, 0, 1, 0.45)"
  spring-snappy: "stiffness 500, damping 32"
  spring-gentle: "stiffness 260, damping 26"
  stagger: 40ms
zIndex:
  base: 0
  raised: 10
  sticky: 100
  overlay: 400
  dialog: 500
  popover: 600
  toast: 700
  tooltip: 800
breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
iconSize:
  sm: 16px
  md: 20px
  lg: 24px
components:
  button-primary:          { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", typography: "{typography.label-md}", rounded: "{rounded.md}", padding: 12px, height: 36px }
  button-primary-hover:    { backgroundColor: "{colors.primary-hover}" }
  button-primary-disabled: { backgroundColor: "{colors.neutral-3}", textColor: "{colors.neutral-11}" }
  button-secondary:        { backgroundColor: "{colors.neutral-3}", textColor: "{colors.ink}", typography: "{typography.label-md}", rounded: "{rounded.md}", padding: 12px, height: 36px }
  button-secondary-hover:  { backgroundColor: "{colors.neutral-4}" }
  button-ghost:            { backgroundColor: "{colors.background}", textColor: "{colors.ink}", rounded: "{rounded.md}", padding: 12px, height: 36px }
  button-destructive:      { backgroundColor: "{colors.error}", textColor: "{colors.on-primary}", rounded: "{rounded.md}", padding: 12px, height: 36px }
  input:                   { backgroundColor: "{colors.surface-raised}", textColor: "{colors.ink}", typography: "{typography.body-md}", rounded: "{rounded.md}", padding: 10px, height: 36px }
  input-error:             { textColor: "{colors.error}" }
  card:                    { backgroundColor: "{colors.surface-raised}", textColor: "{colors.ink}", rounded: "{rounded.lg}", padding: 20px }
  dialog:                  { backgroundColor: "{colors.surface-raised}", rounded: "{rounded.xl}", padding: 24px }
  popover:                 { backgroundColor: "{colors.surface-raised}", rounded: "{rounded.lg}", padding: 8px }
  toast:                   { backgroundColor: "{colors.neutral-12}", textColor: "{colors.neutral-1}", rounded: "{rounded.lg}", padding: 12px }
  tooltip:                 { backgroundColor: "{colors.neutral-12}", textColor: "{colors.neutral-1}", typography: "{typography.label-sm}", rounded: "{rounded.sm}", padding: 6px }
  badge:                   { backgroundColor: "{colors.neutral-3}", textColor: "{colors.ink-muted}", typography: "{typography.label-sm}", rounded: "{rounded.full}", padding: 4px }
  table-row:               { height: 44px, padding: 12px }
  sidebar:                 { backgroundColor: "{colors.surface}", width: 248px, padding: 12px }
---

<!--
  The design contract for this app (format: https://github.com/google-labs-code/design.md).
  - /front-end-design fills this in with the user (.agents/rules/design-system.md). Agents build ONLY with what's here.
  - Anything new (token, component, variant, state, pattern) goes in here FIRST as `proposed`, then gets approved, then built.
  - Check: npx @google/design.md@<pinned> lint DESIGN.md
  - Export the theme: npx @google/design.md@<pinned> export --format css-tailwind, then node .agents/tools/design-tokens.mjs (re-run after every change)
-->

## Overview
<Who uses the product, where and how often. 3 adjectives for how it should feel, and one thing it must **never** feel like.>

## Brand & personality
<The voice in one line. The **signature element**: one recognisable thing used consistently (a shape, a motion, an illustration style, a colour moment). Logo, wordmark and where the brand colour is allowed to appear.>

## Colors
<Where the accent appears (primary action, focus, selection, one highlight per screen) and where it never does. How neutral steps 1–12 are used. Success, warning and error. Chart colours and their order.>

**Themes:** light uses the base tokens; dark uses the `-dark` tokens with the same names. <Default theme; follows the system setting; where the user switches.>

## Typography
<The two fonts and why. Which level is used where: marketing display, page titles, section headings, body, labels, numbers (`numeric`, tabular figures), code.>

## Layout
- **Desktop (1440×900):** <content width (`content-max`), grid, sidebar or header, page padding `page-x-desktop`>
- **Mobile (390×844):** <what stacks, what collapses, page padding `page-x-mobile`, bottom actions>
- **Breakpoints:** `breakpoints` tokens only; mobile first.
- **Rules:** no horizontal scrolling on mobile; touch targets at least 44×44px; tables become cards or scroll inside their own container on mobile.

## Elevation & Depth
<Borders, shadows or tonal layers. What's raised (cards, menus, dialogs, toasts), how, and the `zIndex` layer each uses.>

## Shapes
<Which radius each kind of element uses (`sm` / `md` / `lg` / `xl` / `full`). Nested corners: inner radius = outer radius − padding.>

## Iconography
<One icon library, one stroke width, `iconSize` tokens, icon + label rules, when an icon may stand alone (with a tooltip and an accessible name).>

## Imagery & illustration
<Every real-world entity (person, company, product, place) shows its image, with a designed fallback (initials, monogram, tinted shape). The illustration style for empty states and marketing, approved here. Logo, favicon set and OG image live in `public/`. Never generic AI art or stock clichés.>

## Components
<!-- Every component the app uses, by group. For each: variants, sizes, every state (default, hover, focus-visible, active, disabled, loading, error, selected), keyboard, pointer and touch behaviour, desktop vs mobile. Remove what the app doesn't use; add new ones as `proposed` in the Approvals table first. -->
### Actions
- **Button:** primary, secondary, ghost, destructive; sm / md / lg; loading keeps its width
- **Icon button**
- **Link:** inline and standalone
- **Segmented control / toggle group**
- **Menu button / split button**

### Inputs & forms
- **Text input**, **textarea**, **search input**
- **Select**, **combobox** (search and create)
- **Checkbox**, **radio group**, **switch**
- **Slider**, **date and date-range picker**, **file upload** (drop zone, progress, error)
- **Form field:** label above, help text and error text below, required marker, validation timing, submit area on mobile

### Navigation
- **App shell:** header, sidebar (collapsed and expanded), mobile navigation
- **Tabs**, **breadcrumbs**, **pagination**
- **Command menu** (⌘K)
- **Stepper** for multi-step flows

### Data display
- **Card**, **stat / KPI** (label, value, change; a divided strip, no sparkline or icon circle)
- **Table:** header, sorting, selection, row actions, sticky header, empty and loading rows; mobile behaviour
- **List** and **key-value list**
- **Badge / tag / status dot**, **avatar** and avatar group
- **Chart:** line, bar, area, donut; axis, grid, tooltip and legend styles
- **Timeline / activity feed**, **code block / kbd**

### Feedback
- **Toast**, **alert / banner**
- **Progress:** bar, staged progress for long waits
- **Skeleton** shaped like the content (spinners only inside buttons)
- **Empty state:** illustration, one line, one action
- **Error state:** inline, section, full page

### Overlays
- **Dialog**, **alert dialog**, **drawer / sheet** (mobile bottom sheet)
- **Popover**, **tooltip**, **dropdown menu**, **context menu**

### Layout & content
- **Page header:** title, description, primary action
- **Section**, **divider**, **accordion**, **scroll area**

## Patterns
<!-- Page templates built from the components. Each lists its regions, states and mobile layout. -->
- **List page:** filters, table or cards, bulk actions, empty, loading, error
- **Detail page:** header, tabs or sections, side panel, activity
- **Create / edit form:** single page or stepped; save, cancel, unsaved-changes guard
- **Settings:** section navigation, forms, danger zone
- **Dashboard:** KPI row, charts, recent activity
- **Auth:** sign in, sign up, reset, verify
- **Onboarding:** first-run checklist, empty product state

## Marketing sections
<!-- Only if the product has a marketing site. Picked from .agents/references/ui-templates/ and themed with these tokens. -->
- **Hero**, **logo cloud**, **features**, **how it works**, **testimonials**, **pricing**, **FAQ**, **call to action**, **footer**, **changelog**, **docs**

## Data visualisation
<Chart colours in order (`chart-1`…`chart-6`), what each chart type is used for, number formatting, tooltips, empty and loading charts.>

## Motion inventory
<!-- Every screen moves with purpose. Durations and easing are `motion` tokens. Every animation honours prefers-reduced-motion. -->
| Moment | What moves | Token | Tool |
|---|---|---|---|
| Press feedback | Button scales to 0.97 | `duration-instant`, `ease-out` | CSS |
| Hover | Colour and border | `duration-fast`, `ease-out` | CSS |
| Overlay open and close | Fade and scale from the trigger | `duration-base`, `ease-out` / `ease-in` | Motion |
| List add, remove, reorder | Items slide into place | `duration-base` | AutoAnimate |
| Route change | Shared elements morph, content cross-fades | `duration-page` | `<ViewTransition>` |
| Content load | Skeleton → content cross-fade, staggered | `duration-base`, `stagger` | CSS |
| Toast | Slides in, swipe to dismiss | `spring-snappy` | Motion |
| Marketing reveal | Sections fade up on scroll | `duration-slow`, `ease-out` | CSS (`@supports`) or Motion |

## Loading choreography
<What appears first, what streams in, what never jumps. Waits over 1 s show progress; over 10 s show staged progress, partial results and a time estimate, and the user can leave and come back.>

## Voice & microcopy
<Tone, sentence case, button verbs, error messages (what happened and what to do), empty-state copy, numbers and dates.>

## Do's and Don'ts
- Do <rule>
- Don't <rule>

## Approvals & changelog
<!-- One row per token group, component, pattern and section. Status is `proposed` or `approved`. Nothing `proposed` ships. -->
| Item | Version | Status | Date |
|---|---|---|---|
| Colors | v1 | proposed | <YYYY-MM-DD> |
| Typography | v1 | proposed | <YYYY-MM-DD> |
| Button | v1 | proposed | <YYYY-MM-DD> |
