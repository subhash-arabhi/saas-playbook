# Design gallery

A dev-only page at `/design` where the user sees and approves the design system. It renders what `DESIGN.md` defines and nothing else (`.agents/rules/design-system.md`). `/front-end-design` sets it up before the first UI step.

## What it must show (any framework)
1. **Header:** product name, a light / dark switch, and a count of `proposed` and `approved` rows from the Approvals table.
2. **Colours:** the neutral and accent scales as 12-step rows for light and dark, then every semantic token and chart colour with its name.
3. **Typography:** every typography token as a real sample line in its font, size, weight and tracking, with its name and values.
4. **Spacing, radius and motion tokens:** a bar per spacing step, a box per radius, and each duration and easing as a moving dot with replay.
5. **Components:** every component family in `DESIGN.md`, grouped as in its Components section, each in every state side by side (default, hover, focus-visible, active, disabled, loading, error, selected, as the component has them), with its status from the Approvals table.
6. **Patterns and marketing sections:** each pattern and section at real size with seeded data, at both widths the page is viewed at.
7. **Motion inventory:** every row of the table, playing on its own demo with a replay button.
8. **Fixture data that's messy on purpose:** long names, missing images, zero and huge numbers, empty lists, errors.

## Rules
- **Never in production.** The route returns 404 when the app runs in production (`NODE_ENV=production`, or the framework's equivalent), and nothing links to it.
- **Built from the project's real components,** not copies: if a component changes, the gallery shows the change.
- **Token values from `DESIGN.md`:** the token sections read values straight from `DESIGN.md` (Tailwind only outputs the variables that classes use), the one place inline styles show design values. Everything else uses theme classes.
- **Dark mode switch:** the page toggles a `dark` class on `<html>`; the project's CSS declares `@custom-variant dark (&:where(.dark, .dark *));`.
- **Checked like any UI:** desktop 1440×900 and mobile 390×844, light and dark, no console errors.

## Next.js (App Router)
Copy `nextjs/app/(dev)/design/` into the project's `app/` (or `src/app/`). The `(dev)` route group keeps it out of the URL, so it's at `/design`.

| File | What it does |
|---|---|
| `page.tsx` | The gallery: 404 in production, then reads `DESIGN.md` and renders every section above |
| `design-md.ts` | Reads tokens and the Approvals table from `DESIGN.md` (no dependencies) |
| `registry.tsx` | The demos: one entry per component, pattern, marketing section and motion moment, with its states. Add an entry whenever `DESIGN.md` gains one |
| `fixtures.ts` | The messy seed data the demos use |
| `gallery-client.tsx` | The light / dark switch and the replay wrapper |

Other frameworks: build the same sections from this spec, under a dev-only route.
