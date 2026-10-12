# Anti-Checklist
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: reframed as a create-time self-check (no audit report), learning-only Jhey bullets removed, library-neutral labels. -->

Motion patterns to **catch before they ship**: AI-slop tells first, then perspective-specific anti-patterns from Emil and Jakub, then general mistakes and code-shaped red flags. Use it in Step 4 (Self-Check) across the view you touched, and in the quick inline review. If code matches a pattern, fix it using the relevant lens file (`emil-kowalski.md`, `jakub-krehel.md`, `jhey-tompkins.md`) and the cookbook.

---

## AI-Slop Motion Patterns

These are the recognizable motion fingerprints of AI-generated UIs. They're not always wrong in isolation; what makes them slop is *frequency* and *uniformity*. One instance is normal polish; the same pattern slapped across the view is the tell. Each category has a heuristic so single intentional uses don't trip it.

---

### Pulsing indicators

Glowing dots, breathing CTAs, throbbing rings, "live"/"online"/"recording"/"AI active" pulse animations, dark-mode pulse glows: any looped scale/opacity pulse used to draw attention to a status element.

**Look for:**
- `@keyframes` rules with names containing `pulse`, `glow`, `breathe`, `throb`
- `animation: ... infinite` on small UI elements (dots, badges, status indicators)
- `box-shadow` or `opacity` loops on status icons
- Utility classes like Tailwind's `animate-pulse` on indicator dots or active-state elements

**Heuristic:** catch *any* instance. The only exception is a single brand element with explicit design rationale in code comments or the design system.

**Fix lens:** Emil, purposeful restraint.

---

### Blur-everywhere entrances

`filter: blur(Npx)` on every entering element: sections, cards, images, paragraphs. Jakub's enter recipe (opacity + translateY + blur) is excellent in moderation; slop applies it uniformly.

**Look for:**
- A blur start state (`filter: blur(Npx)` in `from {}` or a library's initial state) on multiple distinct components in the same view
- Identical blur values (e.g. `blur(4px)`) repeated without context distinction
- Blur on text-bearing entrances (headings, paragraphs) where it impairs first-paint readability

**Heuristic:** catch when ≥3 distinct components in the same view share the same blur enter. Single uses with intent (a hero element, a modal) are fine.

**Fix lens:** Jakub, production polish, but selective.

---

### Hover-scale-on-everything

`transform: scale(1.0X)` on `:hover` on every card, button, and image without intent.

**Look for:**
- `transform: scale(1.0X)` on `:hover` across multiple card/button/image components
- Identical scale values (e.g. `scale(1.05)`) repeated across selectors with no discriminating context
- Utility classes like `hover:scale-105` on grids of repeated items

**Heuristic:** catch when ≥3 distinct components share the same hover scale. Single intentional uses (e.g. a primary CTA) are fine.

**Fix lens:** Emil for utility-shaped elements (none); Jakub for product-shaped elements (selective).

---

### Stagger-spam-on-every-list

Staggered entrances (`staggerChildren` in a library, or `animation-delay: calc(var(--i) * 50ms)`) on every list, grid, or repeated block. A stagger on one deliberate moment is delightful; on every list it's default polish.

**Look for:**
- Stagger configuration across multiple list components
- `animation-delay: calc(...)` with item-index multipliers across multiple components
- Sequential delays on lists that don't read as a moment (search results, settings options, table rows)

**Heuristic:** catch when ≥2 lists in the same view use stagger entrance. In SaaS app UI, data lists and table rows should not stagger at all.

**Fix lens:** Emil for utility lists (no stagger); Jhey for delight moments (selective).

---

### Bouncy-springs-on-utility-actions

Springs with bounce on dropdown opens, toggle switches, menu reveals, modal entrances: utility actions where bounce reads as "playful" but the action is productivity-oriented.

**Look for:**
- Spring transitions with bounce > 0 on dropdowns, popovers, menus, toggles, modals, settings panels
- `cubic-bezier(...)` with overshoot values on utility elements
- Identical spring configs across utility components

**Heuristic:** catch *any* spring with bounce > 0 on a utility action. Bounce belongs on celebration moments and intentional delight, not productivity UI.

**Fix lens:** Emil, speed and purpose.

---

### Uniform-fade-in-on-every-element

Identical opacity + translateY enters (with or without blur) on every section, card, paragraph, and heading, regardless of element type or context.

**Look for:**
- Multiple components sharing identical initial/animate opacity + translateY values
- In-view triggers with identical options on every block on a page
- Keyframes with generic names (`fadeInUp`, `enter`, `reveal`) attached to many selectors

**Heuristic:** catch when ≥4 distinct components share identical enter animations (same opacity, translateY, duration, easing). Three is an acceptable baseline on a marketing page; inside the app, even that is usually too many.

**Fix lens:** Jakub, selective polish with hierarchy.

---

### Motion-on-mount-for-static-content

Entrance animations on headings, body paragraphs, navigation links, and other content that should appear instantly. The "fade in everything" pattern that delays reading and makes the page feel sluggish.

**Look for:**
- Enter animations on `<h1>`, `<h2>`, `<p>`, `<nav>` elements
- In-view animations on body copy (paragraphs, articles, prose)
- `animation` rules on text-only components without functional reason

**Heuristic:** catch any motion on a text-only or navigation element whose only purpose is the entrance itself. Carousels, sliders, and hero animations are fine when the motion serves a function (orientation, narrative pacing, attention direction).

**Fix lens:** Emil, animations should serve a purpose, not announce themselves.

---

## From Emil's Perspective (Purposeful Restraint)

- **Animating high-frequency interactions:** if users trigger this 100s of times daily, remove the animation
- **Animating keyboard-initiated actions:** keyboard shortcuts should NEVER animate
- **Animations over 300ms in app UI:** 180ms feels more responsive than 400ms
- **Animating from scale(0):** start from `scale(0.9)` or higher
- **Same tooltip behavior everywhere:** first tooltip delayed + animated, subsequent instant
- **Using default CSS easing:** built-in `ease` and `ease-in-out` lack strength
- **Ignoring transform-origin:** dropdowns should expand from their trigger, not center
- **Expecting delight in productivity tools:** users of high-frequency tools prioritize speed
- **Using keyframes for interruptible animations:** keyframes can't retarget mid-flight
- **CSS variables for frequent updates:** expensive style recalculation; update the element's style directly
- **Distance thresholds for dismissal:** use velocity (distance/time); fast short gestures should work
- **Abrupt boundary stops:** use damping; things slow down before stopping in real life

---

## From Jakub's Perspective (Production Polish)

- **Making enter and exit animations equally prominent:** exits should be subtler
- **Using solid borders when shadows would adapt better:** especially on varied backgrounds
- **Forgetting optical alignment:** buttons with icons, play buttons, asymmetric shapes
- **Over-animating:** if users notice the animation itself, it's too much
- **Using the same animation everywhere:** context should drive timing and easing choices
- **Ignoring hover state transitions:** a short transition (~150ms) feels more polished than an instant change

---

## General Motion Design Mistakes

- **Animating layout-triggering properties** (width, height, top, left): use transform instead
- **Elements that appear animated but vanish instantly:** add a (subtler) exit
- **Same duration for all animations:** smaller elements should animate faster
- **Forgetting `prefers-reduced-motion`:** not optional

*Note: duration is lens-dependent. Emil prefers under 300ms for app UI. Jakub and Jhey may use longer durations on marketing surfaces when polish or effect warrants it.*

---

## Red Flags in Code

Examples are in plain CSS/JS, and in Motion for React where the pattern is library-shaped. The principle is the same in any stack.

```jsx
// BAD: Animating layout properties (Motion for React)
animate={{ width: 200, height: 100 }}

// GOOD: Use transform
animate={{ scale: 1.2 }}
```

```jsx
// BAD: Same animation for enter and exit (Motion for React)
initial={{ opacity: 0, y: 20 }}
exit={{ opacity: 0, y: 20 }}

// GOOD: Subtler exit
initial={{ opacity: 0, y: 20 }}
exit={{ opacity: 0, y: -8 }}
```

```css
/* BAD: No reduced motion support */
.animated { animation: bounce 1s infinite; }

/* GOOD: Respects user preference */
@media (prefers-reduced-motion: no-preference) {
  .animated { animation: bounce 1s infinite; }
}
```

```css
/* BAD: will-change everywhere */
* { will-change: transform; }

/* GOOD: Targeted will-change */
.animated-button { will-change: transform, opacity; }
```

```jsx
// BAD: Animating from scale(0) (Motion for React)
initial={{ scale: 0 }}
animate={{ scale: 1 }}

// GOOD: Start from higher scale
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

```jsx
// Per Emil: too slow for app UI (Motion for React)
transition={{ duration: 0.4 }}

// Per Emil: fast, snappy (Jakub/Jhey might use 0.4 on a marketing page)
transition={{ duration: 0.18 }}
```

```css
/* BAD: Dropdown expanding from center */
.dropdown { transform-origin: center; }

/* GOOD: Origin-aware animation */
.dropdown { transform-origin: top center; }
```

```css
/* BAD: Keyframes can't be interrupted */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.toast { animation: slideIn 300ms var(--ease-out); }

/* GOOD: Transitions can retarget mid-flight */
.toast {
  transform: translateY(100%);
  transition: transform 300ms var(--ease-out);
}
.toast.mounted {
  transform: translateY(0);
}
```

```javascript
// BAD: CSS variables cause cascade recalc
element.style.setProperty('--drag-y', `${y}px`);

// GOOD: Direct style update
element.style.transform = `translateY(${y}px)`;
```

```javascript
// BAD: Distance threshold for dismissal
if (dragDistance > 100) dismiss();

// GOOD: Velocity-based (fast short gestures work)
const velocity = dragDistance / elapsedTime;
if (velocity > 0.11) dismiss();
```
