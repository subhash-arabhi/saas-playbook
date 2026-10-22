<!-- Adapted from Dammyjay93/interface-design@2f9be32 .claude/skills/interface-design/SKILL.md (MIT, see licenses/). Changes: rewritten as rules; its memory file (.interface-design/system.md) is DESIGN.md; the render-tool, image-generation, review checks, save prompt and commands removed; motion values aligned to DESIGN.md motion tokens; trimmed. -->

# Craft: what makes product UI look decided

Use this for app screens (dashboards, tools, settings, data views) when building components and patterns in the gallery, and on every UI step after.

## Intent first
- **Who is this person,** where are they, and what did they just do? **What must they accomplish** (the verb)? **What should it feel like,** in words that mean something ("dense like a trading floor", not "clean and modern")?
- **Intent is systemic.** If it's warm, every surface, border, accent and font is warm. Every choice has a reason; "it's common" isn't one.

## Explore the product's world before proposing
Produce all four, then propose a direction that uses them:
- **Domain:** at least 5 concepts and words from the product's world.
- **Colour world:** at least 5 colours that exist in that world.
- **Signature:** one element that could only belong to this product.
- **Defaults:** 3 obvious choices for this kind of interface, named so you can avoid them.

**Test:** with the product name removed, could someone tell what it's for?

## Hierarchy and composition
- **One focal point per view.** Name it, then make it win through size, contrast, position or space.
- **The type scale is a ratio:** about 1.2 for dense UI, 1.25 for most product UI, 1.333 for expressive. **Weight and colour do more than size:** one size holds three tiers as 600 / primary, 500 / secondary, 400 / muted.
- **Density is a decision in px,** held everywhere: 12–16px padding feels like a workbench, 24px like a brochure.
- **Breathe unevenly:** tight groups of related things, real space between groups. Same card, same gap everywhere is no one deciding.
- **Proportions state relationships:** a 280px sidebar serves the content; a 360px one is its peer.
- **About 60/30/10:** a dominant neutral surface, a secondary tone, about 10% accent. Colour communicates (status, action, identity); grey builds structure.
- **Hierarchy through space and weight before lines.** Tighten tracking on large type; body line height about 1.5.

## Surfaces, borders, depth
- **Surfaces stack** (page → card → popover), each a few lightness points apart: felt, not seen. Light mode adds shadow; dark mode adds lightness.
- **Sidebars use the canvas background** with a subtle border. **Popovers sit one level above their parent.** **Inputs are slightly darker than their surroundings** (inset).
- **Borders disappear until you look for them:** low-opacity, in a progression (subtle, default, strong, focus).
- **One depth strategy,** committed: borders only, subtle shadows, layered shadows, or tonal shifts.
- **The squint test:** blurred, the hierarchy still reads and nothing jumps out.

## Infinite expression
A metric can be a hero number, inline stat, sparkline, gauge, progress bar, delta or trend badge. Same sidebar, same card grid and icon-number-label boxes every time is the AI tell. Ask what the one thing users do here is, and which product solves a similar problem brilliantly.

## Use what exists
- **Controls:** native HTML first (`<button>`, `<a>`, `<dialog>`, `<details>`); a headless primitive for anything stateful (the project's shadcn/ui on Base UI); hand-roll only as a last resort, with full keyboard, focus and ARIA behaviour.
- **Styling:** the project's components and variants first; a repeated class list becomes a component; bind to semantic tokens (`bg-surface text-ink-muted`), never raw values.

## System essentials
- **Every colour traces to a primitive:** text, surface, border, brand, semantic.
- **Four text levels:** primary, secondary, tertiary, muted.
- **One base unit** (4 or 8px), multiples only, scaled by context: micro, component, section, major. Padding symmetrical unless content demands otherwise.
- **A radius scale:** small for inputs and buttons, medium for cards, large for dialogs.
- **Controls get their own tokens** (background, border, focus), separate from surfaces.
- **Dark mode:** lean on borders, desaturate semantic colours slightly, keep one hue and shift lightness.

## Polish
- **Concentric radius:** outer radius = inner radius + padding.
- **Tabular figures** on every changing number.
- **Optical alignment** where geometric centring looks off (icon side about 2px less padding).
- **Every state:** default, hover, active, focus, disabled; data has loading, empty and error.
- **Hit areas 44×44px** (40 at least), extended with a pseudo-element when the visible control is smaller; never overlapping.
- **Lift with layered transparent shadows** (a 1px ring plus two soft depths in light mode; a single light ring in dark mode); real borders for dividers and inputs.
- **`text-wrap: balance`** on headings, **`pretty`** on body; antialiased font smoothing.
- **Images get a 1px inset outline** at 10% black (light) or white (dark).

## Motion essentials
- **Frequency decides:** actions repeated hundreds of times a day (keyboard shortcuts, command menu) don't animate; occasional surfaces (dialogs, drawers, toasts) do; rare moments can delight.
- **Under 300ms for UI:** press 100–160ms, tooltips and popovers 125–200ms, dropdowns 150–250ms, dialogs and drawers 200–400ms. Use the `motion` tokens.
- **Ease out for entering and interacting, ease in-out for moving on screen, never ease-in.**
- **Press feedback:** scale 0.97 on `:active`. **Never from `scale(0)`:** start at 0.95 with opacity 0. **Popovers grow from their trigger;** dialogs stay centred.
- **Animate only `transform` and `opacity`;** never `transition: all`.
- **Stagger** 30–80ms; exits faster and subtler than entrances. **Reduced motion** keeps opacity and colour, drops movement.

## Avoid
Harsh borders; dramatic surface jumps or shadows; flat hierarchy; monotone layout; inconsistent spacing; mixed depth strategies; missing states; large radius on small elements; thick decorative borders; decorative gradients and colour; several accents; different hues per surface; default fonts where a direction was set; negative margins, escape-hatch `calc()` and absolute positioning to dodge layout.
