---
version: alpha
name: <Product name>
description: <One sentence on the look and feel, e.g. "Calm, dense, data-first workspace with one confident accent color.">
colors:
  # Light theme
  primary: "#<hex>"            # main action color, used sparingly
  on-primary: "#<hex>"         # text/icons on primary
  surface: "#<hex>"            # page background
  surface-raised: "#<hex>"     # cards, panels, menus
  ink: "#<hex>"                # main text
  ink-muted: "#<hex>"          # secondary text
  border: "#<hex>"
  focus: "#<hex>"              # focus ring
  success: "#<hex>"
  warning: "#<hex>"
  error: "#<hex>"
  # Dark theme (same names + "-dark")
  primary-dark: "#<hex>"
  on-primary-dark: "#<hex>"
  surface-dark: "#<hex>"
  surface-raised-dark: "#<hex>"
  ink-dark: "#<hex>"
  ink-muted-dark: "#<hex>"
  border-dark: "#<hex>"
  focus-dark: "#<hex>"
  success-dark: "#<hex>"
  warning-dark: "#<hex>"
  error-dark: "#<hex>"
typography:
  headline-lg: { fontFamily: <Font>, fontSize: 32px, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.02em }
  headline-md: { fontFamily: <Font>, fontSize: 24px, fontWeight: 600, lineHeight: 1.25 }
  headline-sm: { fontFamily: <Font>, fontSize: 18px, fontWeight: 600, lineHeight: 1.3 }
  body-md:     { fontFamily: <Font>, fontSize: 15px, fontWeight: 400, lineHeight: 1.5 }
  body-sm:     { fontFamily: <Font>, fontSize: 13px, fontWeight: 400, lineHeight: 1.5 }
  label-md:    { fontFamily: <Font>, fontSize: 13px, fontWeight: 500, lineHeight: 1.2 }
  mono:        { fontFamily: <Mono font>, fontSize: 13px, fontWeight: 400, lineHeight: 1.5 }
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  page-x-desktop: 32px
  page-x-mobile: 16px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
components:
  button-primary:          { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.md}", padding: 10px, height: 40px }
  button-primary-hover:    { backgroundColor: "<token or color>" }
  button-primary-disabled: { backgroundColor: "{colors.border}", textColor: "{colors.ink-muted}" }
  button-secondary:        { backgroundColor: "{colors.surface-raised}", textColor: "{colors.ink}", rounded: "{rounded.md}", padding: 10px, height: 40px }
  button-ghost:            { backgroundColor: "transparent", textColor: "{colors.ink}", rounded: "{rounded.md}", padding: 10px, height: 40px }
  button-destructive:      { backgroundColor: "{colors.error}", textColor: "{colors.on-primary}", rounded: "{rounded.md}", padding: 10px, height: 40px }
  input:                   { backgroundColor: "{colors.surface}", textColor: "{colors.ink}", rounded: "{rounded.md}", padding: 10px, height: 40px }
  input-error:             { textColor: "{colors.error}" }
  card:                    { backgroundColor: "{colors.surface-raised}", rounded: "{rounded.lg}", padding: 16px }
  dialog:                  { backgroundColor: "{colors.surface-raised}", rounded: "{rounded.lg}", padding: 24px }
  toast:                   { backgroundColor: "{colors.ink}", textColor: "{colors.surface}", rounded: "{rounded.md}", padding: 12px }
  badge:                   { backgroundColor: "{colors.surface-raised}", textColor: "{colors.ink-muted}", rounded: "{rounded.full}", padding: 4px }
  table-row:               { height: 44px, padding: 12px }
---

<!--
  The design contract for this app (format: https://github.com/google-labs-code/design.md).
  - Agents read this before any UI work and build ONLY with these tokens and components.
  - Anything new (token, component, variant, state) is added here FIRST, then built.
  - Every component the app uses must be listed in "Components" below.
  - Check: npx @google/design.md@<pinned> lint DESIGN.md
  - Export the Tailwind theme: npx @google/design.md@<pinned> export --format css-tailwind  (re-run after every change)
-->

## Overview
<Who uses the product and how it should feel. 2–3 adjectives, and one thing it must never feel like.>

## Colors
<How the palette is used: the single accent and where it appears, success/warning/error, borders.>

**Themes:** light uses the base tokens; dark uses the `-dark` tokens with the same names. <Default theme, how the user switches, whether it follows the system setting.>

## Typography
<Fonts and why. Which level is used where: page titles, section headings, body, labels, numbers in tables (tabular figures).>

## Layout
- **Desktop (1440×900):** <max content width, grid, sidebar/header, page padding `page-x-desktop`>
- **Mobile (390×844):** <what stacks, what collapses into a menu, page padding `page-x-mobile`, bottom actions>
- **Rules:** no horizontal scrolling on mobile; touch targets at least 44×44px; tables become cards or scroll inside their own container on mobile.

## Elevation & Depth
<Borders, shadows or tonal layers. What's raised (menus, dialogs, toasts) and how.>

## Shapes
<Corner radius rules: what uses sm / md / lg / full.>

## Components
<!-- List EVERY component the app uses. For each: variants, sizes, states (default, hover, focus, active, disabled, loading, error), desktop vs mobile behaviour. Remove ones the app doesn't use; add new ones here before building them. -->
- **Buttons:** primary, secondary, ghost, destructive; sizes; states including loading
- **Links**
- **Inputs:** text, textarea, select, checkbox, radio, toggle, date; label above, help text below, error text below
- **Forms:** layout, required markers, validation timing, submit area on mobile
- **Cards**
- **Tables / lists:** header, row, empty, loading; mobile behaviour
- **Navigation:** header, sidebar, tabs, breadcrumbs; mobile menu
- **Menus / dropdowns**
- **Dialogs / drawers:** desktop dialog vs mobile full-screen or bottom sheet
- **Toasts / alerts / banners**
- **Tooltips**
- **Badges / tags / avatars**
- **Empty states:** icon/illustration rule, message, action
- **Loading:** skeletons shaped like the content (no spinners for content)
- **Error states:** inline, page-level
- **Charts** (if used): colors from tokens, axis and label styles
- **Icons:** one icon library, one stroke width, sizes

## Motion
<Durations and easing, e.g. "fast: 120ms ease-out for hovers; base: 200ms for panels; never animate keyboard-triggered actions; respect reduced motion". See `.agents/skills/design-motion-principles/SKILL.md`.>

## Do's and Don'ts
- Do <rule>
- Don't <rule>
