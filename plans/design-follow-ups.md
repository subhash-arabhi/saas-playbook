---
name: "Design follow-ups from the sample trial"
status: draft
steps:
  - id: 1
    title: "Dark colours switch by themselves"
    summary: "DESIGN.md colour utilities take their -dark value under .dark, so no class needs a dark: twin"
    done: false
    checkpoint: false
  - id: 2
    title: "The plan checker enforces the Design step"
    summary: "plan.mjs check fails a plan that touches UI files and doesn't start with a Design step"
    done: false
    checkpoint: false
  - id: 3
    title: "Type pairings side by side in the gallery"
    summary: "Temporary -option-a/b/c typography tokens, shown like the palette options"
    done: false
    checkpoint: false
  - id: 4
    title: "shadcn component states from DESIGN.md"
    summary: "The --shadcn export covers the disabled and hover states DESIGN.md's component tokens define"
    done: false
    checkpoint: false
---

# Plan: Design follow-ups from the sample trial

## What we're building
Fixes for the larger problems the `polished-ui` sample trial found (its step 10 Build log). Dark mode works without a `dark:` class on every colour, the plan checker catches a UI plan with no Design step, the user sees type pairings side by side like palettes, and shadcn components show `DESIGN.md`'s disabled and hover colours instead of their own opacity tricks.

## Changes
- **Dark colours:** `design-tokens.mjs` writes `.dark { --color-<name>: <name>-dark }` for every colour with a `-dark` twin; `rules/frontend.md` and the gallery template drop the per-class `dark:` twins.
- **Plan checker:** `tools/plan.mjs check` errors when a step's Files list UI files (`.tsx`, `.jsx`, `.vue`, `.svelte`, `.astro`) and step 1 isn't "Design" with `checkpoint: true`.
- **Type options:** the gallery's typography section shows `<level>-option-a/b/c` tokens as their own rows, and the skill's Type step writes them.
- **shadcn states:** the `--shadcn` export maps `button-primary-disabled` and `*-hover` component tokens to the variables shadcn's components read, or the skill says how to restyle them.

## Steps

### Step 1: Dark colours switch by themselves
**Do:**
1. In `tools/design-tokens.mjs`, emit a `.dark` block overriding `--color-<name>` with the `<name>-dark` value for every colour that has one.
2. Update `rules/frontend.md` → Dark theme and the gallery template's classes; keep `dark:` for the rare one-off.

**Files:** `tools/design-tokens.mjs` (edit), `rules/frontend.md` (edit), `templates/design-gallery/nextjs/app/(dev)/design/page.tsx` (edit), `tests/design-tools.test.mjs` (edit)

**Done when:**
- [ ] `bg-surface-raised` alone is the dark surface under `.dark` in a Tailwind v4 build
- [ ] The test covers every colour with a `-dark` twin, and none without one

**Check:** `npm test`

### Step 2: The plan checker enforces the Design step
**Do:**
1. In `tools/plan.mjs`, add the error and its message ("A plan that touches UI starts with a Design step with checkpoint: true").

**Files:** `tools/plan.mjs` (edit), `tests/plan.test.mjs` (edit)

**Done when:**
- [ ] A plan with `.tsx` files and no Design step fails; with the Design step it passes; a plan with no UI files is unaffected

**Check:** `npm test`

### Step 3: Type pairings side by side in the gallery
**Do:**
1. Group `<level>-option-x` typography tokens in the gallery's typography section, one row per option.
2. Update the skill's Type step to write them and remove them after the choice.

**Files:** `templates/design-gallery/nextjs/app/(dev)/design/page.tsx` (edit), `skills/front-end-design/SKILL.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] Three pairings render as labelled rows, each in its own fonts

**Check:** `npm test`

### Step 4: shadcn component states from DESIGN.md
**Do:**
1. Map what the shadcn variables can carry; for the rest, add a skill bullet saying which component classes to restyle with `DESIGN.md` tokens when the component is added.

**Files:** `tools/design-tokens.mjs` (edit), `skills/front-end-design/SKILL.md` (edit), `tests/design-tools.test.mjs` (edit)

**Done when:**
- [ ] A disabled primary button uses `button-primary-disabled`'s colours, not 50% opacity

**Check:** `npm test`

## Open questions
- Step 1: also drop the `-dark` utilities entirely, or keep them for one-offs? Recommendation: keep them.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
