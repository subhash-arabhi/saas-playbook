<!-- Adapted from emilkowalski/skills@2d22863 (break-ui and mobile-native, MIT, see licenses/) for the worst-case data and phone rules; the rest is the playbook's own. Changes: break-ui's toggle, posture and report replaced by one rule with its catalogue's cases; mobile-native's fixes condensed to one line each; real-hardware testing left to the browser-check rules. -->

# Quality Bar

Every screen ships at this bar. `DESIGN.md` supplies the values; this file says what must be there. Read it before building UI and once before finishing.

## Every screen
- **One primary action**, visibly the strongest thing on the screen. Secondary content is quieter: smaller, muted, or further down.
- **Layouts vary by purpose.** A list, a detail page and a settings page don't share one card grid. Never the same section layout down a whole page.
- **Hierarchy from weight, size and colour**, not from more boxes. Group with spacing first, dividers second, cards only when a surface means something.
- **Real content.** Messy sample data: long names, empty optional fields, large and zero numbers, non-English characters. Text wraps or truncates on purpose.
- **Worst-case data, realistic not random.** For every value a screen renders, take its limit from the validation schema, database column or API contract; with none, say "unbounded" and use something long but believable. Cover the long cases (`Aleksandra Wiśniewska-Kowalczyk`, `bartholomew.fitzgerald@northwind-industries-holdings.example.com`, a German compound label) and the short ones that ship broken: a one- or two-letter name, a count of exactly 0 and 1 ("1 member"), 1,284 with its separator, a missing avatar or optional field, an empty list and a single item, a negative amount. Put them in through the fixtures or props, never by editing markup. A form limit shorter than its column is a finding.

## Every interactive state
Each control has default, hover, focus-visible, active (pressed), disabled and, where it applies, loading, selected, error and read-only. Press feedback is instant (`duration-instant`): the user sees the press before any request returns.

## Loading, empty, error
- **Loading:** skeletons shaped like the final layout, then a cross-fade to content. No layout shift when data arrives.
- **Empty:** what's missing, why, and one next action. Approved empty-state art from `DESIGN.md` where it exists.
- **Error:** next to where the action happened, in plain words, with a retry when it helps. Never a stack trace.

## Waits
- **Under 1 s:** the pressed state or a skeleton; nothing else.
- **Over 1 s:** visible progress (a bar or a determinate count when the total is known).
- **Over 10 s:** staged progress ("Importing 3 of 5 files"), partial results as they arrive, a time estimate, and the user can leave and come back to the result (a notification, a status row, or the page remembers).

## Motion
Quiet in the app, expressive on marketing pages, never static. Every screen covers the motion inventory in `DESIGN.md`, using its `motion` tokens and the tool it names:

| Moment | What moves | Default token |
|---|---|---|
| Press feedback | Scale to 0.97 | `duration-instant` |
| Hover | Colour and border | `duration-fast` |
| Overlay open and close | Fade and scale from the trigger | `duration-base` |
| List add, remove, reorder | Items slide into place | `duration-base` |
| Route change | Shared elements morph, content cross-fades | `duration-page` |
| Content load | Skeleton to content, staggered | `duration-base`, `stagger` |
| Toast | Slides in, swipe to dismiss | `spring-snappy` |
| Marketing reveal | Sections fade up on scroll | `duration-slow` |

Only keyboard-initiated actions and changes that happen hundreds of times a day (typing, table row hover, tab switches in a busy tool) stay instant. Every animation honours `prefers-reduced-motion` and animates only `transform`, `opacity`, `filter` or `clip-path`.

## Dark mode and mobile
- **Dark mode** uses the `-dark` tokens, not inverted colours. Check contrast in both themes.
- **Mobile** at 390×844: no horizontal scroll, 44×44 touch targets, navigation reachable one-handed, tables become lists or scroll inside their own container with the identity column fixed and the key number in view.
- **Feels native on a phone:**
  - Inputs, textareas and selects at 16px or more, so iOS doesn't zoom in; never `maximum-scale=1` or `user-scalable=no`. The right `inputmode`, `type` and `enterkeyhint` on each field.
  - Hover styles only under `@media (hover: hover) and (pointer: fine)` (Tailwind v4's `hover:` already is), so they don't stick after a tap; touch gets `:active` press feedback.
  - App shells and bottom-pinned UI use `100dvh`, heroes `100svh`, never `100vh`.
  - No tap delay or flash: `touch-action: manipulation` on controls, `-webkit-tap-highlight-color: transparent` once on `html`.
  - `viewport-fit=cover` with `env(safe-area-inset-*)` padding on fixed headers, bottom bars, sheets and toasts.
  - `overscroll-behavior: none` on the root of an app (not a scrolling document) and `contain` on inner scroll areas.
  - Controls aren't text-selectable on long-press (`user-select: none` on buttons and tabs, never on `body`).
  - A `theme-color` for each colour scheme, matching the top of the page.

## Brand assets
Logo, favicon, social image and empty-state art come from `DESIGN.md` (Imagery & illustration). Never emoji as icons, never hand-drawn SVG icons, one icon set at the `iconSize` tokens.

## Copy
Follow Voice & microcopy in `DESIGN.md`. Buttons name the action ("Create invoice"). One label per intent across the app. Re-read every visible string before finishing.
