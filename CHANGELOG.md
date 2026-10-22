# Changelog

Each release is a `vX.Y.Z` tag. Its GitHub Release carries the `npm pack` tarball, its SHA-256, a provenance attestation, and the content checksum installs record in `.agents/playbook.json`. The release notes are the section below with the same version.

## v2.0.0 (2026-10-22)

**Upgrading:** in a project with UI, run `/front-end-design` before the next push. The pre-PR check now blocks without an Approvals table in `DESIGN.md`, and `/build` stops before using a component that isn't approved. It keeps what the project already has: existing tokens and components go into `DESIGN.md` and the gallery as `proposed`, offered first, and the one approval at the end covers them.

- `/front-end-design` (the `front-end-design` skill) sets up the design system before the first UI step: brand, style, palette, type, then every component, pattern, marketing section and motion moment, built as `proposed` in `DESIGN.md` and a dev-only gallery at `/design` (`templates/design-gallery/`, never served in production), then approved once as a whole. Later changes go through a short design-change flow; nothing is built on a `proposed` item. `rules/design-system.md` holds the rules, and `AGENTS.md` says `DESIGN.md` decides what UI looks like.
- `templates/DESIGN.md` now covers brand, 12-step OKLCH neutral and accent scales for light and dark, typography roles, motion tokens (durations, easing, springs, stagger), z-index, breakpoints, icon sizes, components in seven groups, patterns, marketing sections, data visualisation, a motion inventory, loading choreography, voice, and an Approvals table.
- Design tools: `tools/design-palette.mjs` generates accessible scales from a hue and checks every required contrast pair; `tools/design-tokens.mjs` exports the extra tokens (motion, z-index, breakpoints, icon sizes) as Tailwind theme variables, and with `--shadcn` writes shadcn/ui's colour, radius and font variables from `DESIGN.md`; `tools/design-coverage.mjs` fails when a shared component in use isn't approved.
- Curated UI templates in `references/ui-templates/`, pinned with their licences and an index: Studio Admin (app shell, dashboards, mail, chat, kanban, calendar, users, roles, profile, invoice, file manager, auth), tablecn (data tables), coss ui particles (components in use), Tailark (marketing blocks in three styles), Magic UI (landing-page effects) and tweakcn theme presets, with Fumadocs for docs sites. No two cover the same pages.
- Motion by default: every screen covers the motion inventory (press, hover, overlays, lists, route changes, content load, toasts, marketing reveals). Quiet in the app, expressive on marketing pages, never static; only keyboard actions and changes that happen hundreds of times a day stay instant. `motion` and `@formkit/auto-animate` are installed with the first UI step, and route changes use View Transitions.
- A strict quality bar for every screen (`frontend-ui-engineering` → `quality-bar.md`): one primary action, every interactive state, messy data, loading, empty and error, rules for waits over 1 s and over 10 s, dark mode, mobile, brand assets and copy; plus `baseline-ui.md` adapted from ibelick/ui-skills. React projects use shadcn/ui on Base UI; Magic UI stays on the landing page.
- Plans that touch UI start with a Design step with a checkpoint, where the gallery is approved; UI steps' Done when name quality-bar criteria. `/build` checks approvals before every UI step and has a sixth stop reason for an unapproved component.
- Pre-PR adds three blocking script checks for projects with UI: `DESIGN.md` lint errors, design coverage, and arbitrary Tailwind values (ESLint with `eslint-plugin-better-tailwindcss`). No reviewer or screenshot pass was added.
- The installer adds the playbook to an `AGENTS.md` that holds only another tool's managed blocks (such as the one `create-next-app` writes) and keeps those blocks, instead of writing `AGENTS.playbook.md` beside it.

## v1.1.0 (2026-10-21)

- Flow documents: the `flow-document` skill (`/flow-document [journey]`) maps the product's user journeys into a tree of numbered steps with branches, fills each step with how it works, real input and output, the processing steps in order, and measured or estimated time and cost, and renders `docs/flow/index.html` from `docs/flow/flow.json` with `templates/flow-document.html` (light and dark, phone layout, deep links, an outside-reader mode). The docs area names the skill, and a finished `/build` updates the flow document when the plan changed a journey.
- No AI attribution in projects: the installer turns off attribution in Claude Code, Codex and VS Code Copilot, and installs a `commit-msg` hook (`tools/strip-attribution.mjs`) that strips agent `Co-authored-by` trailers and "Generated with" / "Made with" lines from every commit, keeping human co-authors. The pre-PR check rewords unpushed commits that still carry attribution (never pushed ones) and blocks on it in files; `/push` removes tool footers from the PR description. Cursor's switch is per user, so the installer explains it.
- `/plan` asks everything before approval: a dry run of the steps lists every question in Open questions before the first card, asks them in rounds of up to 3, and repeats until a dry run finds none. Risky actions approved then become `Approved:` bullets in Changes.
- `/build` runs to the end. It decides and logs what the plan didn't cover ("Decided:", "Also changed:"), lists those notes in the final summary, and stops only for a checkpoint, a risky action without an `Approved:` bullet naming it exactly, a step's Stop and ask if, a check failing after two different approaches, or unrelated uncommitted changes.
- Agent sessions compact at about 500k tokens: the installer sets it for Claude Code (`autoCompactWindow`), Codex (`model_auto_compact_token_limit`, trusted projects) and VS Code Copilot, keeping any value already set. Cursor's point can't be configured; `/summarize` compacts sooner.
- Optional CI for projects: the first push asks whether to run the automated pre-PR checks in GitHub Actions (`templates/ci.yml`: pinned, read-only, no secrets) and whether to require them on `main`. `AGENTS.md` records the choice, and "turn CI on/off" changes it. Deploys still never run from CI.
- Agents ask questions with the coding tool's question interface (`rules/asking.md`), and plans open in the plan view whenever they change (hooks for Cursor and Claude Code).
- Plans can be approved only when Open questions says exactly "None."; the plan template passes the checker.
- The build workflow commits every plan update with its step.
- Deploys ship exactly the reviewed commit, stop before the merge when something they need isn't in the PR, open a revert PR when the smoke check fails, and require migrations that work with both versions.
- The installer records every file it installs with its SHA-256, deletes only those, backs up local edits, stops on unmanaged `.agents/` content or skill-name collisions (`--force` backs up and continues), and stops when a version's content changes.
- Fresh clones ask before running the remote install.
- The project's `AGENTS.md` template moved to `templates/project-AGENTS.md`; the root `AGENTS.md` is for maintaining the playbook.
- The Playwright skill no longer suggests global `@latest` installs, attaching to a running browser, reading auth cookies, `test.fixme` or `gh` uploads; a test keeps it that way.
- Self-tests and CI (tests on Ubuntu and macOS, ShellCheck, Gitleaks, Semgrep), a security policy, Dependabot for Actions, and attested releases.
- Privacy is designed when personal data is added: `ARCHITECTURE.md` gets a "Personal data" table, the security review flags a missing row, and publish blocks on critical or serious accessibility findings.
- The README shows which lifecycle stages are covered and which are planned, the platform assumptions the rules make, and how each agent was checked for compatibility.

## v1.0.2 (2026-10-12)

- Motion tooling: CSS first, Motion by default, GSAP only with approval.

## v1.0.1 (2026-10-12)

- Fixed an npm install warning; the package lists its files explicitly.

## v1.0.0 (2026-10-12)

- First release.
