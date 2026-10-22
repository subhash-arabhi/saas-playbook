---
name: front-end-design
description: Sets up a product's design system before the first UI step (style, palette, type, components, patterns, marketing sections, motion), shown in a dev-only gallery and approved by the user, or proposes one new component, pattern or token later. Use for /front-end-design, or when UI work needs something DESIGN.md doesn't have.
---

# Front-end design

The user never designs anything. You propose options, build them in the gallery, and the user answers questions and looks at `/design`. `.agents/rules/design-system.md` is the rule; this skill is how to run it.

**Read first:** `.agents/rules/design-system.md`, `.agents/rules/frontend.md`, `DESIGN.md` if it exists, `.agents/skills/front-end-design/references/direction.md` (choices and copy) and `.agents/skills/front-end-design/references/craft.md` (hierarchy, surfaces, polish, motion).

**Which flow:**
- No `DESIGN.md`, or its Approvals table has no `approved` rows: **new project** (below).
- `/front-end-design <what>`, or work needs something `DESIGN.md` doesn't have: **design change** (below).

**Keep it cheap:** no review passes, critique loops or screenshot rounds. The user's look at the gallery is the review. Ask with the question tool (`.agents/rules/asking.md`), up to 3 questions per card.

## New project
1. **Set up `DESIGN.md` and the gallery.**
   - Copy `.agents/templates/DESIGN.md` to the project root if it's missing.
   - **The project already has UI:** keep its existing tokens and components. Move them into the template's sections and the gallery, each with an Approvals row `proposed`, and offer them as the first option in steps 2–5. Freeze v1 approves them with everything else.
   - Copy the gallery from `.agents/templates/design-gallery/` (Next.js: `nextjs/app/(dev)/design/` into `app/`; other frameworks: build it from that folder's `README.md`).
   - Add `@custom-variant dark (&:where(.dark, .dark *));` to the global CSS, start the dev server, and give the user the `/design` URL.
2. **Brand.** Ground it in the subject first (`.agents/skills/front-end-design/references/direction.md`). Ask in one card:
   - who it's for and the job (your proposal, confirmed);
   - 3 adjectives (2–3 sets to choose from);
   - what it must never feel like.

   Then propose 2–3 signature elements and ask which. Write Overview and Brand & personality.
3. **Style.** Read `.agents/references/ui-templates/README.md` and shortlist from it. Ask in one card:
   - the app shell and page layouts;
   - the marketing style: light and minimal, dark and animated, or none;
   - a starting theme: 3 tweakcn presets that fit the brand.

   The templates give layout; colours, type and radius always come from `DESIGN.md`.
4. **Palette.**
   - Pick 3 hues from the theme and the brand's colour world, and run `node .agents/tools/design-palette.mjs --hue <h>` for each. Drop any that exits 1.
   - Show the three side by side in the gallery's colour section (temporary `-option-a/b/c` tokens), and ask which.
   - Write the chosen scales into `DESIGN.md` and remove the options.
5. **Type.** Propose 2–3 pairings chosen for this product (not the usual families), shown in the gallery's typography section, and ask which. Write the typography tokens and the font loading.
6. **Components, patterns, marketing and motion.** Build them all, as `proposed`, without asking in between:
   - every component family the product needs, in every state, from the project's shadcn/ui components on Base UI, themed only from `DESIGN.md`;
   - the patterns (list, detail, form, settings, dashboard, auth, onboarding) with the messy fixtures;
   - the marketing sections, if the product has a marketing site, adapted from the chosen templates;
   - every row of the motion inventory, playing with replay.

   Add each to the gallery registry and to the Approvals table as `proposed`.
7. **Freeze v1.**
   - Ask once, with the gallery URL: "Approve" or "Change something". A change: fix it in the gallery and ask again.
   - On approve: mark every row `approved` with version `v1` and today's date.
   - Export the theme (`npx @google/design.md@<pinned> export --format css-tailwind`, then `node .agents/tools/design-tokens.mjs --out <file>`) and run `npx @google/design.md@<pinned> lint DESIGN.md`. It must show 0 errors.

## Design change
For one new component, variant, pattern, section or token:
1. **Covered?** If `DESIGN.md` has it and it's `approved`, build with it. Stop here.
2. **Propose:** add 1–2 options to `DESIGN.md` and the gallery, each built from the existing tokens, with an Approvals row `proposed`.
3. **Ask** which option, with the gallery URL.
4. **Approve:** mark the chosen one `approved` (version bumped, today's date), remove the other, re-export the theme, then build with it.

Never build on a `proposed` item; never add a one-off value or a local restyle instead.

## Gallery rules
- Built from the project's real components; one registry entry per item, named as in the Approvals table.
- Checked at desktop 1440×900 and mobile 390×844, light and dark, with no console errors. Returns 404 in production.
