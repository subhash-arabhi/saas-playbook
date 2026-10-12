---
name: frontend-ui-engineering
description: Builds production-quality, responsive user interfaces that follow the project's design system. Use when building or modifying pages, screens or components, implementing layouts, wiring UI to the API, managing UI state, or when the output needs to look and feel like a real product rather than AI-generated.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/), with an "Avoid the AI look" section distilled from Leonxlnx/taste-skill@717446e (MIT). Changes: design-system contract, Tailwind styling, framework-agnostic, full accessibility audit as a separate pass, OpenAPI client, browser checks, trimmed (examples and AI-look table in references/); layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/frontend.md` and `.agents/rules/testing.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Frontend UI Engineering

Build UI that follows the design system, handles every state, works at desktop and mobile sizes, and avoids the "AI look". Styling is always Tailwind CSS; the framework varies per project. Prototypes get the same foundation.

## Design System First

The app has one design system, usually one root file (e.g. `DESIGN.md`): light and dark themes, all tokens, every component with variants and states.

1. **Read the design system first**, every time, before touching UI.
2. **Use only its tokens and components.** No hard-coded colors, font sizes, font families, spacing or radii. Reuse the shared component for every button, input, card and so on; never restyle one locally.
3. **Need a new component, variant or state?** Add it to the design system **first** (tokens, states, desktop and mobile behaviour), then build it as a shared component.
4. **Missing a token?** Add it to the design system with a one-line rationale, re-export, then use it. Never invent a one-off value in a component.
5. **Styling is Tailwind CSS.** Tokens reach the code by export, not by hand-copying: for a `DESIGN.md`, `npx @google/design.md@<pinned-version> export --format css-tailwind` writes Tailwind's `@theme`. Use only theme classes, never arbitrary values (`p-[13px]`, `bg-[#…]`) or inline styles. The project pins the version.
6. **No design system yet?** Write one before building UI. Start from one or two real SaaS brands' design systems and customize them: your own brand color, type, voice and name. Never ship a near-copy of another brand.

**Reference-led quality:** when a screen needs direction, study two or three relevant screens (project references or user-supplied). Rebuild their hierarchy, density, navigation, controls and states with your own tokens and content. Never copy another product's branding, text, imagery or exact layout.

**Adherence:**
- **Spacing:** only the spacing scale (`13px` is a bug).
- **Typography:** only the type roles. One `h1` per page, no skipped heading levels, no heading styles on non-headings.
- **Color:** semantic tokens (`text`, `surface`, `border`, `accent`), never raw hex. Never color as the only signal of state (add text or an icon).
- **Radius and elevation:** one radius scale; shadows only where the design system defines them.
- **Component library** (e.g. shadcn/ui, Radix): theme it with the design system's tokens. Never ship its default look.
- In Tailwind, the same rule means using classes from the exported theme, not arbitrary values like `p-[13px]`.

## Components and State

- **Colocate** implementation, tests, state helper and types in one folder.
- **Composition over configuration** (child components, not many props).
- **One job per component.** Over ~200 lines usually means split it.
- **Separate data from presentation:** a container fetches and picks the state; a presentational component renders what it's given.
- **Simplest state that works:** local (one component) → lifted (2–3 nearby) → context (theme, auth, locale) → URL (filters, sorting, pagination, tabs) → server state in a cache library (e.g. TanStack Query, SWR) → global store only for complex app-wide client state (rare, e.g. Zustand).
- **Never copy API data into local or global state.** The cache library owns it.
- **No prop drilling deeper than 3 levels.** Use context or restructure.

For pseudocode examples (composition, container, optimistic update, tokens), read `references/patterns.md`.

## Data from the API

- **Generate the API client and types from the OpenAPI spec** (the `api-and-interface-design` skill, if installed). Never hand-write API types or fetch wrappers. Regenerate when the API changes.
- **Server state goes through the cache library.**
- **Every data view handles loading, empty and error**, and success and permission states where they apply. Build them with the happy path. Show the API error's `message`, never stack traces.
- **Optimistic updates** are fine for quick toggles, with rollback on error and a cache invalidation afterwards.

## Avoid the AI Look

Before building or finishing any visible UI, read `references/avoid-ai-look.md` and avoid every pattern in it unless the design system or the user asks for it. Re-read every visible string before finishing.

## Don't Break the Basics

The full WCAG 2.2 AA audit is a separate pass before release. During builds:

- **Real elements:** buttons are buttons, links are links. Never a clickable `div`.
- **Labels:** every input has a visible label; icon-only buttons have an accessible name (`aria-label="Close dialog"`).
- **Visible focus:** never remove the outline without a visible replacement. Everything clickable is reachable by Tab.
- **Alt text:** meaningful images get `alt`; decorative ones get `alt=""`.
- **Dialogs:** focus moves in on open and back on close (native `<dialog>` or the library's dialog does this).

## Responsive

- Build mobile-first. Every multi-column layout states how it collapses on small screens.
- **Always check** a desktop and a mobile size (e.g. **1440×900** and **390×844**).
- Breakpoints around 320, 768, 1024 and 1440px, or what the design system defines.
- Use `100dvh`, not `100vh`, for full-height sections.
- Prefer CSS Grid for page layout over percentage math (e.g. in Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).

## Loading, Empty, Error, Motion

- **Loading:** skeletons matching the final layout (`aria-busy` on the region). No layout shift when data arrives.
- **Empty:** say what's missing and offer the next action ("No invoices yet" + "Create invoice").
- **Error:** inline for forms and sections; toast only for short-lived feedback. Offer a retry when it helps.
- **Motion:** none by default. When a change needs it, follow the `design-motion-principles` skill (if installed). Animate only `transform` and `opacity`; respect `prefers-reduced-motion`.

## Checking the UI

- **While building:** open it in a real browser (the `browser-testing-with-devtools` skill, if installed). Check both sizes, a clean console, and loading, empty and error states.
- **Core user flows:** an automated E2E suite (e.g. Playwright).
- **Before a PR, if UI changed:** UI audit of the changed UI files (the `web-design-guidelines` skill, if installed).
- **Before release to real users:** the full accessibility audit.
