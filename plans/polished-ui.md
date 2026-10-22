---
name: "Polished UI by default"
status: building
steps:
  - id: 1
    title: "Design-system rule, /front-end-design and precedence"
    summary: "rules/design-system.md (one source of truth, approval flows), the command and Areas row in the project AGENTS.md, and the precedence note"
    done: true
    checkpoint: false
  - id: 2
    title: "Expanded DESIGN.md template"
    summary: "Brand and signature element, 12-step OKLCH scales, motion and layout tokens, about 40 component families in 7 groups, patterns, imagery, Approvals table"
    done: true
    checkpoint: false
  - id: 3
    title: "Design tools: palette, extra tokens, coverage"
    summary: "tools/design-palette.mjs, tools/design-tokens.mjs and tools/design-coverage.mjs, dependency-free and tested"
    done: false
    checkpoint: false
  - id: 4
    title: "/front-end-design skill and design gallery"
    summary: "skills/front-end-design: style, palette, type, components, patterns, motion, freeze; the design-change flow; templates/design-gallery"
    done: false
    checkpoint: false
  - id: 5
    title: "Strict quality bar and motion by default"
    summary: "quality-bar.md, rewritten avoid-ai-look rows, frontend.md, frontend-ui-engineering and design-motion-principles: purposeful motion on every screen"
    done: false
    checkpoint: false
  - id: 6
    title: "Curated UI templates"
    summary: "Copy chosen pages and blocks from Studio Admin, tablecn, coss ui, Tailark, Magic UI and tweakcn, pinned with licences, plus an index the agent reads first"
    done: false
    checkpoint: false
  - id: 7
    title: "Design phase in plans and builds"
    summary: "UI plans start with a Design step that pauses; UI steps name quality-bar criteria; the build stops for unapproved components"
    done: false
    checkpoint: false
  - id: 8
    title: "Cheap design checks before every PR"
    summary: "Script-only rows in pre-pr.md: design.md lint, the coverage check and Tailwind's no-arbitrary-values lint"
    done: false
    checkpoint: false
  - id: 9
    title: "Docs and release"
    summary: "README, CHANGELOG, licenses/README.md, version 2.0.0; release tag after merge"
    done: false
    checkpoint: false
  - id: 10
    title: "Try it in a small sample project"
    summary: "Install the playbook in a tiny Next.js app in sample/, run /front-end-design, build a list and a detail page, and report what works and what doesn't"
    done: false
    checkpoint: false
---

# Plan: Polished UI by default

## What we're building
A project built only with this playbook looks designed by default. Before the build, `/front-end-design` has the user pick a style from bundled, polished open-source templates, then a palette, type and the components and patterns, all shown in a design gallery page and approved. Every screen then follows strict, written design rules: a quality bar, a motion inventory and loading choreography, so nothing ships plain or static. Checking stays cheap: no AI review passes, only a few script checks that cost no tokens.

## Changes
- **One source of truth, two layers:** `DESIGN.md` is what agents build from; the dev-only gallery page is what the user looks at and approves (`rules/design-system.md`). No Figma.
- **Approval flows:** `/front-end-design` for a new project (style, palette, type, components, patterns, marketing, motion, freeze v1); a design-change flow for later needs: propose with options, ask, then build.
- **The user never designs anything:** the agent proposes options and builds the gallery; the user only answers questions and opens the gallery at localhost.
- **Approvals table in prose:** status (`proposed` or `approved`) lives in a `## Approvals & changelog` table, not in YAML, because `design.md lint` warns on unknown component keys.
- **Precedence:** `DESIGN.md` decides what things look like; skills decide how to build them well; no restraint rule removes a motion-inventory item or lowers the quality bar.
- **DESIGN.md template:** neutral example, 3 adjectives plus "never feels like", a signature element, 12-step OKLCH neutral and accent scales (light and dark), chart colours, and about 40 component families in 7 groups with every state.
- **Extra tokens:** motion, z-index, breakpoints and icon sizes stay in the YAML (lint only warns) and reach Tailwind through `tools/design-tokens.mjs`, since `design.md export` drops them.
- **Palette tool:** `tools/design-palette.mjs` builds 12-step OKLCH scales from a hue and checks WCAG 2.2 AA pairs, with no dependency.
- **Coverage check:** `tools/design-coverage.mjs` lists the shared components UI code imports and fails on any that aren't `approved` in `DESIGN.md`, or when there's no Approvals table yet.
- **Gallery:** `templates/design-gallery/`, a spec plus a Next.js App Router dev-only route: tokens, every component state, patterns, motion demos with replay, light and dark, seeded data.
- **Strict rules from proven sources:** Anthropic's `frontend-design` process and cliché list (Apache-2.0) and Dammyjay93 `interface-design` principles (MIT), adapted into the `front-end-design` skill; ui-skills `baseline-ui` (MIT) as a reference.
- **Quality bar:** `skills/frontend-ui-engineering/references/quality-bar.md`: hierarchy, every state, messy data, waits, feedback, the motion inventory table, dark mode, mobile, brand assets, copy.
- **Motion by default:** "Quiet in the app, expressive on marketing pages, never static." Motion and AutoAnimate come with the first UI step; route changes use React's `<ViewTransition>` (stable in React 19.3; Next.js 16.3+ needs no flag).
- **View Transitions guidance:** a short section in our own words in `frontend-ui-engineering`, linking Vercel's `react-view-transitions` skill.
- **Components:** React projects use shadcn/ui on Base UI (the CLI's default), themed only from `DESIGN.md`; Magic UI only on the landing page.
- **Imagery:** every real-world entity shows its image with a designed fallback; `public/` holds the logo, favicon set, OG image and approved illustrations. The ban is on generic AI art, not on art.
- **UI templates:** chosen pages and blocks copied into `references/ui-templates/`, pinned, with licences and an index the agent reads first. They give the layout, and `DESIGN.md` gives the look.
- **No repeats in the set:** each need has one source. shadcn blocks are covered by Studio Admin, and ShipFree by Tailark. Templates' own `components/ui` copies stay out; components come from the shadcn CLI.
- **App sources:** Studio Admin for app pages, tablecn for the data table, coss ui particles for Base UI usage examples, tweakcn for starting themes.
- **Marketing and docs sources:** Tailark for light marketing, Magic UI's animated components for dark and animated, and Fumadocs (pinned install command only) for docs.
- **Answers:** the existing and new script checks stay, and no agent review passes are added; approvals are light (style, palette and type as questions, then one approval of the whole gallery).
- **Cheap checks only:** the pre-PR script runs `design.md lint`, the coverage check and `eslint-plugin-better-tailwindcss` (no arbitrary values). No design reviewer, visual-regression baselines, screenshot loops or AI review passes.
- **Design phase in plans:** a UI plan's first step is "Design" with `checkpoint: true` set when the plan is written; the build stops when a step needs a component or pattern that isn't `approved`.
- **Existing projects:** the checks apply from the first push after a project installs this version; a project without an Approvals table is blocked with "run /front-end-design".
- **Release 2.0.0:** README, CHANGELOG, `licenses/README.md`, `package.json`; the tag goes on `main` after merge.
- **Sample-project trial:** a tiny Next.js app in `sample/` (excluded in `.git/info/exclude`, never committed) with the playbook installed; findings go in the Build log, small fixes are made, larger ones become a follow-up plan.

## Steps

### Step 1: Design-system rule, /front-end-design and precedence
**Do:**
1. Write `rules/design-system.md`: the two layers; the `/front-end-design` flow as a tree; the design-change flow (covered → build with it; not covered → propose in `DESIGN.md` as `proposed` with 1–2 options shown in the gallery, ask, then approve or revise); the "never" list (one-off values, local restyles, building on `proposed`).
2. `templates/project-AGENTS.md`: a `/front-end-design [what]` row in Commands; an Areas row "Design system: palette, type, components, patterns, motion, imagery" with rules `design-system.md`, `frontend.md`, `DESIGN.md` and skills `front-end-design`, `design-motion-principles`; the precedence sentence after "Precedence".
3. Tests: the rule has both flows and the "never" list; the template has the row, the area and the precedence sentence. The "every area skill has a folder" test passes once step 4 adds the skill.

**Files:** `rules/design-system.md` (new), `templates/project-AGENTS.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The rule describes the two layers, both flows and the "never" list
- [x] The project `AGENTS.md` has `/front-end-design`, the design-system area and the precedence sentence
- [x] Tests fail if any of them is removed

**Check:** `npm test`

### Step 2: Expanded DESIGN.md template
**Do:**
1. `templates/DESIGN.md` front matter: neutral `description` placeholder; `colors` with `neutral-1`…`neutral-12` and `accent-1`…`accent-12` in OKLCH for light and `-dark`, semantic aliases, `chart-1`…`chart-6`; extra keys `motion` (durations, easings, spring), `zIndex`, `breakpoints`, `iconSize`; component tokens for the main families.
2. Prose sections: Overview (audience, 3 adjectives, "never feels like"), Brand & personality with a signature element, Colors, Typography, Layout, Elevation, Shapes, Iconography, Imagery & illustration, Components (7 groups, about 40 families, each with every state, keyboard, pointer and touch, desktop vs mobile), Patterns / page templates, Marketing section library, Data visualisation, Motion inventory, Loading choreography, Voice & microcopy, Do's and Don'ts, Approvals & changelog (item, version, status, date).
3. A filled temp copy lints with `npx @google/design.md@0.4.0 lint`: zero errors; the only warnings are the expected ones for the extra keys.
4. Tests: every section heading and the 7 groups exist; the Approvals table has its columns; the description doesn't suggest a mood.

**Files:** `templates/DESIGN.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The template has every section above and about 40 component families in 7 groups
- [x] A filled copy lints with zero errors on `@google/design.md` 0.4.0
- [x] Tests fail if a section, a group or the Approvals table is removed

**Check:** `npm test`, the lint command above

### Step 3: Design tools: palette, extra tokens, coverage
**Do:**
1. `tools/design-palette.mjs`: from a hue and chroma, print 12-step OKLCH neutral and accent scales for light and dark (Radix step roles) as `DESIGN.md` YAML, and check text and UI pairs against WCAG 2.2 AA (4.5:1 text, 3:1 large text and UI). Exit 1 if a required pair fails.
2. `tools/design-tokens.mjs`: read `motion`, `zIndex`, `breakpoints` and `iconSize` from `DESIGN.md` and write a CSS file with a Tailwind `@theme` block next to the `design.md export` output.
3. `tools/design-coverage.mjs`: list components imported from the shared component folders (default `components/ui` and `components/design`, overridable) across UI files, read the Approvals table, and fail on any that's missing or not `approved`. With no Approvals table, print "No Approvals table: run /front-end-design" and exit 1.
4. Tests with fixtures for all three.

**Files:** `tools/design-palette.mjs` (new), `tools/design-tokens.mjs` (new), `tools/design-coverage.mjs` (new), `tests/design-tools.test.mjs` (new)

**Done when:**
- [ ] The palette tool's output lints in a `DESIGN.md` and fails on a pair below AA
- [ ] The tokens tool writes every extra token as a theme variable
- [ ] The coverage tool fails on a missing or proposed component, or no table, and passes when all are approved
- [ ] All three run on Node 20+ with no dependencies

**Check:** `npm test`

### Step 4: /front-end-design skill and design gallery
**Do:**
1. `skills/front-end-design/SKILL.md` (`name: front-end-design`): with no argument and no approved v1, run the flow from `rules/design-system.md`: brand questions, a style from `.agents/references/ui-templates/` (app shell, marketing style and a starting theme shortlisted from the index), 3 palettes from `tools/design-palette.mjs`, 2–3 type pairings, components, patterns, marketing sections and the motion inventory shown in the gallery, then freeze v1 (export `@theme` with both tools). With an argument, run the design-change flow.
2. Adapt Anthropic `frontend-design` (anthropics/skills `41bbe19`, Apache-2.0: subject grounding, token plan, cliché clusters, copy rules) and Dammyjay93 `interface-design` principles (`2f9be32`, MIT; its memory file becomes `DESIGN.md`) into `references/` of the skill, trimmed to rules. No review or critique passes. Source comments, license files, `licenses/README.md` rows.
3. `templates/design-gallery/`: `README.md` (the framework-neutral spec) and `nextjs/` (an App Router route under `app/(dev)/design/` that returns `notFound()` in production): every token, every component in every state, patterns, motion demos with replay, light and dark, seeded fixture data.
4. Tests: front matter, the flow order, the production guard, sources and licenses.

**Files:** `skills/front-end-design/` (new), `templates/design-gallery/` (new), `licenses/` (new files), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] `/front-end-design` walks style, palette, type, components, patterns, marketing, motion and freeze, asking with the question tool and pointing the user to the gallery
- [ ] The design-change flow never builds on a `proposed` item
- [ ] The gallery renders in a scratch Next.js app at 1440×900 and 390×844, light and dark, with no console errors, and returns 404 in production
- [ ] Every adapted file names its source and commit, and every source has its license file

**Check:** `npm test`, the gallery in a scratch app at both sizes and themes

### Step 5: Strict quality bar and motion by default
**Do:**
1. `skills/frontend-ui-engineering/references/quality-bar.md`: every screen (one primary action, quieter secondary content, varied layouts), every interactive state, messy data, loading / empty / error, waits (over 1 s progress; over 10 s staged progress, partial results, a time estimate, leave and return), instant press feedback, the motion inventory table with `DESIGN.md` tokens, dark mode, mobile, brand assets, copy.
2. `avoid-ai-look.md`: rewrite the motion, fake-screenshot and cards rows; allow approved illustrations and empty-state art.
3. `rules/frontend.md`: "Quiet in the app, expressive on marketing pages, never static."; install `motion` and `@formkit/auto-animate` with the first UI step; `<ViewTransition>` for route changes; scroll-driven animations only behind `@supports`; Imagery; references always in the design phase; shadcn/ui on Base UI for React projects; Magic UI only on the landing page.
4. `skills/frontend-ui-engineering/SKILL.md`: motion follows the screen's inventory; read `avoid-ai-look.md`, `quality-bar.md` and `baseline-ui.md` (vendored from ibelick/ui-skills `55363c3`, MIT); new components go through the design-change flow; a short View Transitions section linking Vercel's skill.
5. `skills/design-motion-principles/SKILL.md`: runs for every UI step against the inventory; occasional events get 150–250 ms; "none" only for keyboard actions and changes that happen hundreds of times a day. Update its source comment.

**Files:** `skills/frontend-ui-engineering/references/quality-bar.md` (new), `skills/frontend-ui-engineering/references/baseline-ui.md` (new), `skills/frontend-ui-engineering/references/avoid-ai-look.md` (edit), `rules/frontend.md` (edit), `skills/frontend-ui-engineering/SKILL.md` (edit), `skills/design-motion-principles/SKILL.md` (edit), `licenses/` (new file), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] No file says motion is "none by default", "on demand only" or "static by default"
- [ ] The quality bar has the motion inventory and the wait rules
- [ ] Tests fail if the old restraint wording returns or the inventory is removed

**Check:** `npm test`

### Step 6: Curated UI templates
**Do:**
1. Copy into `references/ui-templates/<source>/`, each file starting with a source comment:
   - `studio-admin/` from arhamkhnz/next-shadcn-admin-dashboard `e832f5b` (MIT): the sidebar shell, the current dashboards, mail, chat, kanban, calendar, users, roles, profile, invoice, file manager, and auth v1 and v2. Leave out `components/ui`, the legacy dashboards and the tasks page.
   - `tablecn/` from sadmann7/tablecn `744ffda` (MIT): the data-table components and the tasks demo.
   - `coss-particles/` from cosscom/ui `3d8ca28`, `apps/ui/registry/default/particles` (MIT per its `LICENSING.md`).
   - `tailark/` from tailark/blocks `8139698` (MIT): the free hero, features, logo cloud, pricing, testimonials, FAQ, CTA and footer blocks.
   - `magicui/` from magicuidesign/magicui `efe76fc` (MIT): border-beam, blur-fade, particles, animated-shiny-text, retro-grid, number-ticker, marquee and animated-list.
   - `themes/tweakcn-presets.ts` from jnsahaj/tweakcn `a3b47b3` (Apache-2.0).
2. `references/ui-templates/README.md`, the index the agent reads first:
   - each source with what it's for, its pages or blocks, and its style;
   - the Fumadocs entry as a pinned `create-fumadocs-app` command;
   - how to adapt: copy the page, swap imports to the project's shadcn components (Studio Admin is Radix, so map to Base UI), and take every colour, font and radius from `DESIGN.md`.
3. License files, `licenses/README.md` rows, and tests: every index entry has its folder, every copied file has a source comment, no `components/ui` folder is copied.

**Files:** `references/ui-templates/` (new), `licenses/` (new files), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] Every index entry has its files, source, commit and licence
- [ ] No source repeats another's pages, and no template ships its own `components/ui`
- [ ] The installed package grows by less than 2 MB

**Check:** `npm test`, `npm pack --dry-run` size

### Step 7: Design phase in plans and builds
**Do:**
1. `rules/planning.md`: a plan touching UI starts with a "Design" step written with `checkpoint: true` (the user can switch it off), which adds every new screen, component and pattern to the gallery as `proposed`; UI steps' Done when name quality-bar criteria, not "looks right". Allow this one case in "Never change checkpoint otherwise".
2. `workflows/build-plan.md`: before a UI step, list its components and patterns and check they're `approved`. Add a sixth stop reason for one that isn't.
3. `skills/plan/SKILL.md` and `templates/plan.md` where they describe UI steps.
4. Update the five-reasons test to six; add tests for the Design step rule. The template still passes `plan.mjs check`.

**Files:** `rules/planning.md` (edit), `workflows/build-plan.md` (edit), `skills/plan/SKILL.md` (edit), `templates/plan.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] A UI plan written from the rules starts with a Design step with a checkpoint
- [ ] The build checks approvals before every UI step and stops for an unapproved one
- [ ] The stop list has six reasons, and tests pin them

**Check:** `npm test`, `node tools/plan.mjs check templates/plan.md`

### Step 8: Cheap design checks before every PR
**Do:**
1. `workflows/pre-pr.md`: script rows, only when the project has UI: `npx @google/design.md@<pinned> lint DESIGN.md` (errors block), `node .agents/tools/design-coverage.mjs` (blocks), ESLint with `eslint-plugin-better-tailwindcss` restricting arbitrary values (blocks). The existing web-interface-guidelines row stays a warning.
2. `rules/frontend.md`: the ESLint snippet and the UI audit wording to match.
3. Tests: each row exists with its blocking rule; no reviewer or screenshot step was added.

**Files:** `workflows/pre-pr.md` (edit), `rules/frontend.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The three rows run from `scripts/pre-pr.sh` and block as stated
- [ ] A project without an Approvals table is blocked with "run /front-end-design"; a project without UI skips the rows
- [ ] Tests pin each row

**Check:** `npm test`

### Step 9: Docs and release
**Do:**
1. README: skills table (`front-end-design`), `/front-end-design` in the commands, the UI templates, counts, and the "Light on context" figure re-measured.
2. `## v2.0.0 (<date>)` in CHANGELOG with an "Upgrading" note: run `/front-end-design` before the next push; `package.json` 2.0.0.
3. Credits line in README for the new sources.

**Files:** `README.md` (edit), `CHANGELOG.md` (edit), `package.json` (edit)

**Done when:**
- [ ] README and CHANGELOG describe every change
- [ ] The release workflow's notes command finds the new section

**Check:** `npm test`, `shellcheck install.sh tools/plan-editor/install.sh`, `node tools/plan.mjs check plans/polished-ui.md`

### Step 10: Try it in a small sample project
**Do:**
1. Add `sample/` to `.git/info/exclude`. Create a minimal Next.js app there (pinned `create-next-app`, Tailwind v4), and install this branch of the playbook with `bash install.sh sample`.
2. Acting as the project's agent and following only its installed `AGENTS.md`: set Phase to build, run `/front-end-design` with a short made-up product brief (answering the questions myself and logging each answer), then `/plan` and `/build` a list page and a detail page.
3. Observe without prompting: does the Design step appear with a checkpoint, is a template picked and adapted, is the gallery built, are components approved before use, is the motion inventory implemented, do the pre-PR checks run and block where they should, and how many tokens the design work takes.
4. Record each observation in the Build log as works / doesn't; fix small playbook problems on this branch (each with a test), and write a follow-up plan for larger ones.

**Files:** `sample/` (not committed), `plans/polished-ui.md` (edit), playbook files only for small fixes (logged as "Also changed:")

**Done when:**
- [ ] Every item in Do 3 has a works / doesn't line in the Build log
- [ ] Small problems are fixed with tests; larger ones are in a follow-up plan in `plans/`
- [ ] `sample/` isn't tracked by git

**Check:** `npm test`, `git status --short` shows nothing from `sample/`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| Plan | 2026-10-22 | Dry run | Dry run: 14 questions, none left. |
| 1 | 2026-10-22 | Done | Decided: a minimal `skills/front-end-design/SKILL.md` pointing to the rule, so the area-skill test passes at every commit; step 4 fills it in. Also changed: `skills/front-end-design/SKILL.md` (same reason). `plan-open.test.mjs` fails only in the parallel full run (port in use, as on `main`) and passes alone. |
| 2 | 2026-10-22 | Done | Decided: the template carries a neutral grey and blue example scale in OKLCH instead of placeholders, so it lints as-is and `design-palette.mjs` replaces it. Lint on 0.4.0: 0 errors; the warnings are unreferenced scale steps and the `motion`, `breakpoints` and `iconSize` keys. |
