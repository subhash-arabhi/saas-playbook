<!-- Adapted from ibelick/ui-skills@55363c3 skills/baseline-ui/SKILL.md (MIT, see licenses/). Changes: the review command removed (rules apply while building); values come from DESIGN.md tokens instead of Tailwind defaults; the "no animation unless requested" and "no custom easing" rules replaced by the DESIGN.md motion inventory and motion tokens; letter-spacing and shadows follow DESIGN.md; shadcn/ui on Base UI named as the primitives. -->
# Baseline UI

An opinionated baseline that keeps generated UI from looking generic. `DESIGN.md` wins wherever it says otherwise.

## Stack
- MUST use the theme exported from `DESIGN.md`; no arbitrary values.
- MUST use `motion/react` (formerly `framer-motion`) when JavaScript animation is required.
- MUST use the `cn` utility (`clsx` + `tailwind-merge`) for class logic.

## Components
- MUST use accessible primitives for anything with keyboard or focus behaviour. For React: shadcn/ui on Base UI.
- MUST use the project's existing components first.
- NEVER mix primitive systems within the same interaction surface.
- MUST add an `aria-label` to icon-only buttons.
- NEVER rebuild keyboard or focus behaviour by hand unless explicitly requested.

## Interaction
- MUST use an `AlertDialog` for destructive or irreversible actions.
- SHOULD use structural skeletons for loading states.
- NEVER use `h-screen`, use `h-dvh`.
- MUST respect `safe-area-inset` for fixed elements.
- MUST show errors next to where the action happens.
- NEVER block paste in `input` or `textarea` elements.

## Animation
- MUST cover the motion inventory in `DESIGN.md` with its `motion` tokens; no other durations or curves.
- MUST animate only compositor props (`transform`, `opacity`).
- NEVER animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- SHOULD avoid animating paint properties (`background`, `color`) except for small, local UI (text, icons).
- SHOULD use `ease-out` on entrance.
- NEVER exceed `200ms` for interaction feedback.
- MUST pause looping animations when off-screen.
- MUST respect `prefers-reduced-motion`.
- SHOULD avoid animating large images or full-screen surfaces.

## Typography
- MUST use `text-balance` for headings and `text-pretty` for body text.
- MUST use `tabular-nums` for data.
- SHOULD use `truncate` or `line-clamp` for dense UI.
- NEVER change letter-spacing beyond the typography tokens in `DESIGN.md`.

## Layout
- MUST use the `zIndex` scale from `DESIGN.md` (no arbitrary `z-*`).
- SHOULD use `size-*` for square elements instead of `w-*` + `h-*`.

## Performance
- NEVER animate large `blur()` or `backdrop-filter` surfaces.
- NEVER apply `will-change` outside an active animation.
- NEVER use `useEffect` for anything that can be expressed as render logic.

## Design
- NEVER use gradients unless `DESIGN.md` defines them.
- NEVER use purple or multicolour gradients.
- NEVER use glow effects as primary affordances.
- MUST use the elevation levels in `DESIGN.md` for shadows.
- MUST give empty states one clear next action.
- SHOULD limit accent colour usage to one per view.
