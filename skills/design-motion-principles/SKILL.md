---
name: design-motion-principles
description: Adds purposeful motion to every UI step, following the motion inventory in DESIGN.md. Use when building or changing any screen or component (press and hover feedback, overlays, lists, route changes, content loading, toasts, marketing reveals), or when the user asks whether some motion is right. Quiet in SaaS apps and dashboards, expressive on marketing pages, never static. Always ships prefers-reduced-motion handling.
---

<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: Create mode for every UI step against the DESIGN.md motion inventory (HTML audit report removed), quiet-in-the-app default with no static screens, occasional events at 150–250ms, design-system motion tokens, tool-agnostic, trimmed; layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/frontend.md` and follow it: it overrides this skill where they differ. Without it, follow this skill as written.

# Design Motion Principles

Build UI motion that has a purpose, feels fast, and gets out of the way.

## When It Runs

- **Every UI step:** check the screen against the motion inventory in `DESIGN.md` (press, hover, overlays, lists, route changes, content load, toasts, marketing reveals) and fill every moment it has. Quiet in the app, expressive on marketing pages, never static.
- **On request** ("does this motion feel right?"): the Quick Inline Review below.
- **Scope:** web/app UI motion (CSS, JS animation libraries, motion tokens). The frequency gate also applies to Lottie, Rive or video; the recipes may not. Examples are CSS and Motion for React; translate to the project's stack.
- **Tools, lightest first:** CSS (transitions, scroll-driven animations, View Transitions); then a component animation library such as Motion (formerly Framer Motion) for exits, layout changes, gestures and springs; then a timeline library such as GSAP only for long choreography. Use what the project already has.

## Lenses: Quiet in the App

Lenses in `references/`: **Emil Kowalski** (`emil-kowalski.md`, should this animate at all?), **Jakub Krehel** (`jakub-krehel.md`, subtle and polished enough?), **Jhey Tompkins** (`jhey-tompkins.md`, playful, expressive). They distill each designer's published work; the weighting is this skill's, not endorsed by them.

| Surface | Primary | Secondary | Selective |
|---|---|---|---|
| **SaaS app / dashboard (default)** | Emil | Jakub | Jhey (empty states, first-run only) |
| High-frequency tools (tables, command palette, editors, settings) | Emil | none | none |
| Onboarding / first-run / success moments | Jakub | Emil | Jhey (one deliberate delight moment) |
| Marketing / landing page | Jakub | Jhey | Emil (forms, nav, pricing toggles) |
| Mobile app shell | Jakub | Emil | Jhey (delighters) |

If the design system or the user states a different brand personality (e.g. playful), adjust the weighting and say so.

## Core Principles

1. **Frequency gate (decide first).** Rare (monthly: onboarding, first success) → expressive welcome. Occasional (daily: modal, toast, list change, route change) → subtle, 150–250ms. Frequent (hundreds of times a day: typing, table row hover, tabs in a busy tool) → instant. Keyboard-initiated (shortcuts, command palette) → never animate. Nothing else is left static.
2. **Named purpose.** Every animation is **feedback** (my action registered), **orientation** (where it came from / went) or **continuity** (same thing, changed). The inventory's moments all have one; anything outside it needs one too.
3. **Unnoticed.** If users would say "nice animation!" on a routine interaction, it's too prominent (except deliberate delight on marketing or onboarding).
4. **Reduced motion is mandatory.** Every animation ships `prefers-reduced-motion` handling in the same change. See `references/accessibility.md`.
5. **Cheap properties only:** `transform`, `opacity`, `filter`, `clip-path`. Never `width`, `height`, `top`, `left`, `margin`, `padding`.

## Motion Values

- **Design-system motion tokens exist:** use them. Don't invent values next to them.
- **None exist:** use the defaults below and ask: "The design system has no motion tokens; I used the skill defaults. Want me to add them to it?" Add them (in the file's token layout) only if they agree.
- **Existing code already animates:** match its values unless they are what's being fixed.

**Skill defaults** (quiet, SaaS UI):

| Token (suggested name) | Value | Use |
|---|---|---|
| `duration-instant` | 0ms | High-frequency and keyboard-initiated changes |
| `duration-fast` | 120–150ms | Hover, press, icon swaps, tooltips |
| `duration-base` | 180–200ms | Dropdowns, popovers, small enter/exit |
| `duration-slow` | 250–300ms | Modals, drawers, panels (exits shorter than enters) |
| `ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Elements entering / responding |
| `ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Elements moving while visible |
| `ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets and drawers (iOS-like) |
| `spring-default` | spring, bounce 0 | Interactive values (drag, layout) |

Marketing pages may use 300–500ms where the moment warrants it. Never bare `ease` / `ease-in-out` keywords: a token curve or a spring.

## Create Workflow

**Step 1: Light discovery (infer first, ask second).** Infer from the request, the design system (motion tokens, brand personality), project instructions, package manifest and existing components (library, current values). State it:

```text
Building: [e.g. "a notification toast"]
Surface: [e.g. "SaaS dashboard"]  → Lens: Emil primary · Jakub secondary
Motion values: [design-system tokens | existing code values | skill defaults]
```

Small, well-specified request: one line, then go to Step 3. Non-trivial component or ambiguous surface: confirm the weighting with the user first.

**Step 2: Load references.** Always `references/motion-cookbook.md`, `references/accessibility.md`, `references/creation-gotchas.md`; then the lens files for the weighting (Emil almost always for SaaS); `references/performance.md` for complex or numerous animations.

**Step 3: Generate**, in order:
1. Frequency gate.
2. A cookbook recipe matched to the lens. Enter = opacity + small translateY (+ blur only where it earns it). Exit subtler than enter. Popovers origin-aware. Token easing or a spring.
3. Reduced motion in the same code.
4. Cheap properties only.
5. Timing from tokens, else defaults (Emil-weighted: under 300ms, ~180ms ideal).

**Step 4: Self-check** before presenting:
- Check the code against every item in `references/creation-gotchas.md`; fix matches.
- Run the relevant parts of `references/audit-checklist.md` and `references/anti-checklist.md` across the whole view you touched, not just the new component (three cards with the same hover-scale is the tell).
- Tell the user briefly: which lens drove the decisions, where the timing values came from, and what you deliberately left un-animated.

## Quick Inline Review

When asked whether existing motion is right, answer in the conversation. No report file.

1. State the surface and lens weighting in one line.
2. Walk `references/audit-checklist.md` and `references/anti-checklist.md` against that code only.
3. Reply grouped as **Must fix** / **Should fix** / **Optional**, each with `file:line` and the fix (from the cookbook). Missing reduced-motion handling is always **Must fix**.
4. Offer to apply the fixes. Don't apply them unasked.
