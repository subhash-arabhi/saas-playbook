# UI templates

Free, MIT or Apache-2.0 SaaS UI, curated so no two sources cover the same pages. `/front-end-design` shortlists styles from here, and builds adapt pages from here instead of starting blank. Every file is a reference copy, pinned to a commit, starting with a comment naming its source. Nothing here is built or imported directly. Licences: `.agents/licenses/README.md`.

## Sources

| Folder | Use it for | Primitives | Style |
|---|---|---|---|
| `studio-admin/` | The signed-in app: shell and pages | Radix (map to Base UI) | Neutral, dense, sidebar admin |
| `tablecn/` | Every data table: sorting, filters, pagination, row actions | Base UI | Linear-like, toolbar-driven |
| `coss-particles/` | Single components in use: forms, fields, menus, overlays, feedback | Base UI | Crisp, compact, product-grade |
| `tailark/` | Marketing pages, in three styles | Base UI | Dusk, Mist or Veil (below) |
| `magicui/` | Landing-page effects only, never in the app | none | Animated accents |
| `themes/tweakcn-presets.ts` | Palette and type starting points for the Style question | none | 42 named themes |
| Fumadocs (not copied) | Docs sites | its own | Clean docs layout |

### studio-admin
From [arhamkhnz/next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard) `e832f5b`.
- **Shell:** `dashboard/layout.tsx`, `dashboard/_components/sidebar/` (sidebar, main nav, user menu), `dashboard/_components/header/` (search dialog, account switcher, theme and layout controls), `shared/navigation/sidebar/sidebar-items.ts`.
- **Dashboards:** `dashboard/default`, `crm`, `analytics`, `finance`, `ecommerce`, `infrastructure`, `productivity`.
- **App pages:** `mail/`, `chat/`, `dashboard/kanban`, `dashboard/calendar` (with `shared/components/calendar/`), `dashboard/users`, `dashboard/roles`, `dashboard/profile`, `dashboard/invoice`, `dashboard/file-manager`.
- **Auth:** `auth/v1` (brand panel on a third of the screen) and `auth/v2` (half-and-half with an inset brand card), login and register, with `auth/_components/`.

### tablecn
From [sadmann7/tablecn](https://github.com/sadmann7/tablecn) `744ffda`, the Base UI build.
- `components/data-table/`: table, toolbar, advanced toolbar, column header, faceted, date, range and slider filters, filter and sort menus, view options, pagination, skeleton, select and actions columns.
- `hooks/use-data-table.ts` (URL-synced state) and `lib/` (filters, features, formatting).
- **Tasks demo:** `components/tasks-table*.tsx`, `delete-tasks-dialog.tsx`, `update-task-sheet.tsx`, and `tasks-demo/lib/` (queries, validations, actions). It imports tablecn's Radix build; point it at `components/data-table/` instead.

### coss-particles
From [cosscom/ui](https://github.com/cosscom/ui) `3d8ca28`: up to three examples per component, for accordion, alert, alert dialog, autocomplete, avatar, badge, breadcrumb, button, calendar, card, checkbox, checkbox group, collapsible, combobox, command, composer, context menu, date picker, dialog, drawer, empty, field, fieldset, form, frame, group, input, input group, kbd, menu, meter, navigation, number field, OTP field, pagination, popover, preview card, progress, radio group, scroll area, select, separator, sheet, skeleton, slider, spinner, switch, table, tabs, textarea, toast, toggle, toggle group, toolbar and tooltip. Files are `p-<component>-<n>.tsx`. They import coss ui components (`@/registry/default/ui/*`); use the project's shadcn/ui component of the same name.

### tailark
From [tailark/blocks](https://github.com/tailark/blocks) `8139698`, the Base UI build. Up to three variants each of hero, features, logo cloud, pricing, testimonials, FAQ, call to action and footer, in `<style>/blocks/<block>/`:
- **Dusk:** centred, large type, announcement pill, bold contrast. Fits developer tools and launches.
- **Mist:** soft background gradients, left-aligned split heroes, friendly. Fits SMB and finance products.
- **Veil:** serif headings, masked imagery, integration logos. Fits premium and platform products.

Some blocks load remote stock images; replace them with the project's approved imagery.

### magicui
From [magicuidesign/magicui](https://github.com/magicuidesign/magicui) `efe76fc`: `border-beam`, `blur-fade`, `particles`, `animated-shiny-text`, `retro-grid`, `number-ticker`, `marquee`, `animated-list`. Landing page only. Each one must map to a row of the motion inventory in `DESIGN.md` and honour `prefers-reduced-motion`.

### themes
`tweakcn-presets.ts` from [jnsahaj/tweakcn](https://github.com/jnsahaj/tweakcn) `a3b47b3`: named themes with light and dark colours, fonts and radius. Use them as Style options and palette seeds, then generate the real scales with `.agents/tools/design-palette.mjs`.

### Fumadocs (docs sites)
Not copied; it's a full app. Start a docs site with:

```bash
npx create-fumadocs-app@16.2.25
```

Then theme it from `DESIGN.md` like any other app.

## How to adapt a template
1. **Pick by job, not looks:** the app from `studio-admin/`, tables from `tablecn/`, single components from `coss-particles/`, marketing from `tailark/` in the chosen style.
2. **Copy the page or block** into the project, then swap every import to the project's own shadcn/ui components (`@/components/ui/*`), built on Base UI.
3. **Radix to Base UI** (Studio Admin): `asChild` becomes `render={<Link … />}`; `--radix-dropdown-menu-trigger-width` and `--radix-popover-trigger-width` become `--anchor-width`; Radix `onSelect` on menu items becomes `onClick`.
4. **Take every colour, font, radius, shadow and duration from `DESIGN.md`.** Delete the template's own values: arbitrary classes, hex colours, inline styles, fonts.
5. **Replace the content:** real product copy and messy sample data, never the template's text, names or images.
6. **Add what templates leave out:** loading, empty and error states, the motion inventory, and the mobile layout at 390×844.
7. **Never ship a near-copy.** The result should look like the project's design system, not the template.
