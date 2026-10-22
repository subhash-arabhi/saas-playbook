# Design system

A product built with this playbook looks designed, not assembled. The user never designs anything: the agent proposes options, builds them where the user can see them, and the user answers questions. No Figma.

## Two layers, one source of truth
- **`DESIGN.md`** (project root) is what agents build from: every token, component, pattern, motion and imagery rule, and the **Approvals & changelog** table that says what's `proposed` and what's `approved`.
- **The gallery** is what the user looks at and approves: a dev-only page at `/design` that renders everything in `DESIGN.md` (`.agents/templates/design-gallery/`). It never ships to production.
- **Nothing exists outside `DESIGN.md`.** If the gallery shows it, `DESIGN.md` defines it; if `DESIGN.md` defines it, the gallery shows it.

## New project: `/front-end-design`
Run it before the first UI step (`.agents/skills/front-end-design/SKILL.md`). Each answer is written into `DESIGN.md` and shown in the gallery before the next question.

```text
/front-end-design
├─ 1. Brand: who it's for, 3 adjectives, what it must never feel like, the signature element
├─ 2. Style: app shell, marketing style and starting theme, from .agents/references/ui-templates/
├─ 3. Palette: 3 options from .agents/tools/design-palette.mjs, checked for contrast
├─ 4. Type: 2–3 pairings
├─ 5. Components, patterns, marketing sections and the motion inventory: built in the gallery
└─ 6. Freeze v1: the user approves the whole gallery once; every row becomes approved
```

## Later: the design-change flow
When work needs something the design doesn't have (a component, a variant, a pattern, a token):
- **Covered:** it's in `DESIGN.md` and `approved`. Build with it.
- **Not covered:**
  1. Add it to `DESIGN.md` as `proposed`, with 1–2 options shown in the gallery.
  2. Ask the user which option, with the gallery URL.
  3. Mark the chosen one `approved` (or revise and ask again), then build.

`/front-end-design <what>` runs this flow on its own.

## Never
- **One-off values:** no colour, size, radius, shadow, duration or easing that isn't a `DESIGN.md` token.
- **Local restyles:** don't restyle a shared component in one place. Add a variant to `DESIGN.md` instead.
- **Building on `proposed`:** nothing ships that uses a component or pattern that isn't `approved`.
- **Copying another product's look:** the bundled templates give layout and structure; the look always comes from `DESIGN.md`.
