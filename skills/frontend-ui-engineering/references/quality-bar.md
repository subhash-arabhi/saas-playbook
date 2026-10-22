# Quality Bar

Every screen ships at this bar. `DESIGN.md` supplies the values; this file says what must be there. Read it before building UI and once before finishing.

## Every screen
- **One primary action**, visibly the strongest thing on the screen. Secondary content is quieter: smaller, muted, or further down.
- **Layouts vary by purpose.** A list, a detail page and a settings page don't share one card grid. Never the same section layout down a whole page.
- **Hierarchy from weight, size and colour**, not from more boxes. Group with spacing first, dividers second, cards only when a surface means something.
- **Real content.** Messy sample data: long names, empty optional fields, large and zero numbers, non-English characters. Text wraps or truncates on purpose.

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
- **Mobile** at 390×844: no horizontal scroll, 44×44 touch targets, navigation reachable one-handed, tables become lists or scroll inside their own container.

## Brand assets
Logo, favicon, social image and empty-state art come from `DESIGN.md` (Imagery & illustration). Never emoji as icons, never hand-drawn SVG icons, one icon set at the `iconSize` tokens.

## Copy
Follow Voice & microcopy in `DESIGN.md`. Buttons name the action ("Create invoice"). One label per intent across the app. Re-read every visible string before finishing.
