# Frontend and design

Stack: the frontend framework is chosen per project (`.agents/rules/stack.md`). The website runs in the cloud with the rest of the app.

## Styling: Tailwind CSS
- **Every frontend uses Tailwind CSS (v4, pinned).** No other styling system: no CSS-in-JS, no component library's default theme, no hand-written CSS beyond the generated tokens file and a small global base.
- **Tailwind's theme comes from `DESIGN.md`:** `npx @google/design.md@<pinned> export --format css-tailwind` writes the `@theme` block. Never edit the generated file by hand.
- **Use only theme classes** (`bg-primary`, `text-ink-muted`, `p-md`, `rounded-lg`). **Never** arbitrary values (`bg-[#1f2937]`, `p-[13px]`, `text-[15px]`) or inline `style` for design values.
- **Dark theme:** use Tailwind's `dark:` variant with the `-dark` tokens from `DESIGN.md`.
- **Repeated class lists become a shared component** (the components listed in `DESIGN.md`), not copy-pasted strings.
- **Mobile first:** base classes are for 390×844, then `md:` / `lg:` / `xl:` for larger screens.

## DESIGN.md is the single source of truth
- **Every app with a UI has a root `DESIGN.md`** in Google's design.md format (YAML tokens plus rationale prose), created from `.agents/templates/DESIGN.md` (or from a reference in `.agents/references/design-systems/`, then customised; never a near-copy of another brand).
- **It defines everything the UI uses:**
  - **Themes:** light and dark color tokens
  - **Typography, spacing, radius, elevation and motion tokens**
  - **Every component** the app uses, with variants and states: buttons, links, inputs, selects, checkboxes, radios, toggles, forms, cards, tables, lists, navigation (header, sidebar, tabs), menus, dialogs, drawers, toasts, tooltips, badges, avatars, empty states, loading skeletons, error states, charts if used
  - **Layout rules** for desktop and mobile
- **Before any UI work, read `DESIGN.md`.** Build only with its tokens and components. Never hard-code a color, size, font, radius or shadow.
- **Something new, or a different look?** It goes through the design-change flow in `.agents/rules/design-system.md` first: `DESIGN.md`, the gallery and an approval, then re-export the theme and run `npx @google/design.md@<pinned> lint`.

## Mobile is required
- **Every UI change is checked at desktop 1440×900 and mobile 390×844.** Both must look right and work.
- On mobile: no horizontal scrolling, touch targets at least 44×44px, readable text without zoom, and navigation that works one-handed.

## Motion
- **Quiet in the app, expressive on marketing pages, never static.** Every screen covers the motion inventory in `DESIGN.md` (`design-motion-principles` skill). Only keyboard actions and changes that happen hundreds of times a day stay instant.
- **Install `motion` and `@formkit/auto-animate` with the first UI step,** pinned, so the inventory never waits on a dependency decision.
- **Use the lightest tool that does the job,** in this order:
  1. **CSS:** Tailwind transitions for hover and press feedback, skeleton cross-fades and staggered content. Scroll-driven animations only inside `@supports (animation-timeline: view())`, with the content visible without them.
  2. **`<ViewTransition>`** (React) or the View Transitions API for route changes and shared elements.
  3. **AutoAnimate** (`@formkit/auto-animate`) for list add, remove and reorder.
  4. **Motion** (`motion`, or `motion-v` for Vue; MIT, formerly Framer Motion) for overlays with exits, toasts, layout and shared-element transitions, gestures, drag and springs. Load it with `LazyMotion` (or the framework's equivalent).
  5. **GSAP** only with the user's OK (proprietary licence), for long choreographed timelines on marketing pages.
- **Durations, easing and springs come from `DESIGN.md` motion tokens.** Every animation honours `prefers-reduced-motion`.

## Imagery
- Logo, favicon, social image, illustrations and empty-state art follow Imagery & illustration in `DESIGN.md`, approved in the design phase. One icon set, at the `iconSize` tokens.
- Product shots are real screenshots or real components with sample data, never mock-ups drawn with divs.

## How to build UI
- Follow the `frontend-ui-engineering` skill, including "Avoid the AI look" and the quality bar.
- **React projects use shadcn/ui on Base UI** for primitives, themed from `DESIGN.md`. **Magic UI** components are for the landing page only, never inside the app.
- **References always shape the design phase:** `/front-end-design` shortlists from `.agents/references/ui-templates/` and `.agents/references/design-systems/`, or screens the user supplied, and adapts them; never a near-copy.
- Every data view has loading, empty and error states.
- Accessibility basics always (real buttons and links, labels on inputs, visible focus, alt text). The full WCAG 2.2 AA audit happens only at publish (`.agents/workflows/publish.md`, using `.agents/references/accessibility-checklist.md`).
- **UI audit** (`web-design-guidelines` skill): on push, only over changed UI files, as warnings. It skips `[a11y]` rules unless the user asks, noting `Accessibility-only rules skipped; covered at publish.` Publish runs every rule.
