# Motion Cookbook
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: principle-first with labeled CSS / Motion for React examples, design-system tokens, Create mode only, quiet in the app and never static. -->

The single source of motion **recipes**: implementation patterns and code. Read it in every Create run. Lens philosophy and decision frameworks live in the per-designer files; the code lives here.

**How to read it.** Each recipe states the **principle** first. The code blocks are **examples**: plain CSS, and Motion for React (formerly Framer Motion) where the pattern is easier in a JS library. Frameworks vary by project, so translate examples to the project's stack. Replace literal durations and easings with the design system's motion tokens when they exist (e.g. `var(--duration-base)`, `var(--ease-out)`); otherwise use the defaults in `../SKILL.md`.

**Quiet in the app.** For SaaS app UI, pass the frequency gate before using any recipe here; every moment in the `DESIGN.md` motion inventory still gets one. Several sections (§7 `@property` art, §8 3D, §14 scroll-driven) are mainly for marketing pages.

---

## 1. Enter & Exit Animations

### Enter Animation Recipe (Jakub)

**Principle:** an appearing element combines a fade with a small movement toward its resting place. Blur is optional: it adds a "materializing" feel; use it on a few deliberate elements, not everything.
- **Opacity:** 0 → 1
- **TranslateY:** ~8px → 0 (or a full container height for slides from an edge)
- **Blur (optional):** 4px → 0px

Example (CSS):

```css
.panel[data-state="open"] {
  animation: panel-in var(--duration-base, 200ms) var(--ease-out, cubic-bezier(0.23, 1, 0.32, 1)) both;
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
}
```

Example (Motion for React):

```jsx
initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
```

**Why blur?** It creates a "materializing" effect that feels more physical than opacity alone. The element appears to come into focus, not just fade in.

### Exit Animation Subtlety (Jakub)

**Principle:** exits should be subtler than enters. When a component leaves, the user's focus is already moving to what comes next.

Example (Motion for React):

```jsx
// Instead of the full enter movement in reverse:
exit={{ y: 8 }}

// Use a small, fixed value, and keep it short:
exit={{ y: -4, opacity: 0, filter: "blur(4px)" }}
```

**Why this works:** exits become softer, less jarring, and don't compete for attention with whatever is entering or remaining.

**When NOT to use subtle exits:**
- When the exit itself is meaningful (user-initiated dismissal)
- When you need to emphasize something leaving (error clearing, item deletion)
- Full-page transitions where directional continuity matters

### Fill Mode for Persistence (Jhey)

**Principle:** delayed animations must hold their first frame until they start. Use `animation-fill-mode`:
- `forwards`: element retains animation styling after completion
- `backwards`: element retains style from the first keyframe before the animation starts
- `both`: both directions

**Critical for:** fade-in sequences with delays. Without `backwards`, elements flash at full opacity before their delayed animation starts, then pop to invisible, then fade in.

---

## 2. Easing & Timing

### Duration Impacts Naturalness

> "Duration is all about timing, and timing has a big impact on the movement's naturalness." (Jhey Tompkins)

**Principle:** use the project's duration tokens; smaller elements and higher-frequency interactions get shorter durations. App UI stays under 300ms.

### Custom Easing is Essential (Emil)

> "Easing is the most important part of any animation. It can make a bad animation feel great."

Built-in CSS easing keywords (`ease`, `ease-in-out`) lack strength. Use custom Bézier curves: the design system's easing tokens, or the skill defaults. Resources for designing curves: easing.dev, easings.co.

Example (CSS tokens, when the design system has none yet):

```css
:root {
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
}
```

### Easing Selection Guidelines (Jhey)

Each easing curve communicates something. **Context matters more than rules.** (Use custom curves with these shapes, not the bare keywords.)

| Easing shape | Feel | Good for |
|---|---|---|
| ease-out | Fast start, gentle stop | Elements entering view, responding to input |
| ease-in | Gentle start, fast exit | Elements leaving view |
| ease-in-out | Gentle both ends | Elements changing state while visible |
| linear | Constant speed | Continuous loops, progress indicators |
| spring | Natural deceleration | Interactive elements, professional UI |

**The context rule:**

> "You wouldn't use 'Elastic' for a bank's website, but it might work perfectly for an energetic site for children."

Brand personality (from the design system) should drive easing choices. A professional SaaS brand uses subtle springs or ease-out.

**When NOT to use bouncy/elastic easing:**
- Professional/enterprise applications
- Frequently repeated interactions (gets tiresome)
- Error states or serious UI
- When users need to complete tasks quickly

### Spring Animations (Jakub)

**Principle:** springs feel more natural than fixed curves for interactive, interruptible motion. `bounce: 0` gives smooth deceleration without overshoot, the production default. Reserve bounce > 0 for playful contexts.

Example (Motion for React):

```jsx
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
transition={{ type: "spring", duration: 0.55, bounce: 0.1 }}  // playful contexts only
```

### The linear() Function (Jhey)

**Principle:** CSS `linear()` approximates bounce, elastic, and spring curves in pure CSS, no JS needed.

Example (CSS):

```css
:root {
  --bounce-easing: linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 13.6%, 0.25, 0.391, 0.563, 0.765,
    1, 0.891 40.9%, 0.848, 0.813, 0.785, 0.766, 0.754, 0.75, 0.754, 0.766, 0.785,
    0.813, 0.848, 0.891 68.2%, 1 72.7%, 0.973, 0.953, 0.941, 0.938, 0.941, 0.953,
    0.973, 1, 0.988, 0.984, 0.988, 1
  );
}
```

Jake Archibald's linear() generator makes custom curves: https://linear-easing-generator.netlify.app/

### Stagger Techniques (Jhey)

**Principle:** stagger is for one deliberate moment (usually marketing), never for data lists in the app. `animation-delay` applies once, not per iteration. Approaches:

1. **Different delays with finite iterations:** works for one-time sequences.
2. **Pad keyframes** to create stagger within the animation:

```css
@keyframes spin {
  0%, 50% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

3. **Negative delays** for "already in progress" effects:

```css
.element { animation-delay: calc(var(--index) * -0.2s); }
```

This makes animations appear mid-flight from the start, useful for staggered continuous animations.

---

## 3. Visual Effects

These are motion-adjacent polish notes. The design system's color, border, and shadow tokens win where they exist.

### Shadows Instead of Borders (Jakub)

**Principle:** in light mode on varied backgrounds, subtle multi-layer shadows adapt better than solid borders (they use transparency) and transition smoothly.

Example (CSS):

```css
.card {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
  transition: box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
}

/* Slightly darker on hover */
.card:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

**Why shadows over borders?**
- Shadows adapt to any background (images, gradients, varied colors) because they use transparency
- Borders are solid colors that may clash with dynamic backgrounds
- Multi-layer shadows create depth; single borders feel flat
- Shadows can be transitioned smoothly

**When borders are fine:**
- Dark mode (shadows less visible anyway)
- When you need hard edges intentionally
- Simple interfaces where depth isn't needed

### Gradients & Color Spaces (Jakub)

**Principle:** interpolate gradients in `oklch` to avoid muddy midpoints.

Example (CSS):

```css
element { background: linear-gradient(in oklch, blue, red); }
```

- **Color hints** control where the blend midpoint appears (different from color stops)
- Layer gradients with `background-blend-mode` for unique effects

**Why oklch?** It interpolates through perceptually uniform color space, avoiding the gray/muddy zone that sRGB hits when blending complementary colors.

### Blur as a Signal (Jakub)

**Principle:** blur combined with opacity and translate reads as focus. Use it to signal:
- **Entering focus:** blur → sharp
- **Losing relevance:** sharp → blur
- **State transitions:** blur during, sharp after

---

## 4. Optical Alignment

### Geometric vs. Optical (Jakub)

> "Sometimes it's necessary to break out of geometric alignment to make things feel visually balanced."

**Buttons with icons:** reduce padding on the icon side so content appears centered:

```text
[  Icon Text  ] ← Geometric (mathematically centered, feels off)
[ Icon Text   ] ← Optical (visually centered, feels right)
```

**Play button icons:** the triangle points right, creating visual weight on the left. Shift it slightly right to appear centered.

**Icons in general:** many icon packs account for optical balance, but asymmetric shapes (arrows, play, chevrons) may need manual margin/padding adjustment.

**The rule:** if it looks wrong despite being mathematically correct, trust your eyes and adjust.

---

## 5. Icon & State Animations (Jakub)

### Contextual Icon Transitions

**Principle:** when an icon changes meaning (copy → check, loading → done), cross-fade it with a small scale and blur instead of swapping instantly. Instant swaps feel jarring and can be missed; the animated swap confirms the action registered. Keep it fast (`duration-fast`).

Example (CSS: stack both icons, toggle with a data attribute):

```css
.icon-swap { display: grid; }
.icon-swap > * {
  grid-area: 1 / 1;
  transition: opacity var(--duration-fast, 150ms) var(--ease-out),
              transform var(--duration-fast, 150ms) var(--ease-out),
              filter var(--duration-fast, 150ms) var(--ease-out);
}
.icon-swap [data-icon="check"],
.icon-swap[data-copied] [data-icon="copy"] {
  opacity: 0; transform: scale(0.8); filter: blur(4px);
}
.icon-swap[data-copied] [data-icon="check"] {
  opacity: 1; transform: scale(1); filter: blur(0);
}
```

Example (Motion for React):

```jsx
<AnimatePresence mode="wait" initial={false}>
  {isCopied ? (
    <motion.span
      key="check"
      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
    >
      <CheckIcon />
    </motion.span>
  ) : (
    <motion.span key="copy" /* same initial/animate/exit */>
      <CopyIcon />
    </motion.span>
  )}
</AnimatePresence>
```

---

## 6. Shared Layout Animations (Jakub)

### FLIP Technique

**Principle:** to move an element between two layouts (card → modal, list item → detail), measure the **F**irst and **L**ast positions, apply the **I**nverse transform, then **P**lay it to zero. Only `transform` animates, so it stays cheap even when size and position change.

- Plain web: the View Transitions API (`document.startViewTransition`) gives a FLIP-style crossfade with little code; hand-written FLIP works everywhere.
- Example (Motion for React): the `layoutId` prop does FLIP automatically between components:

```jsx
// In one location:
<motion.div layoutId="card" className="small-card" />

// In another location:
<motion.div layoutId="card" className="large-card" />
```

### Best Practices (Motion `layoutId`)

- Keep elements with `layoutId` **outside** `AnimatePresence` to avoid conflicts
- If inside `AnimatePresence`, the initial/exit animations will trigger during the layout animation (looks bad with opacity)
- Multiple elements can animate if each has a unique `layoutId`
- Works for different heights, widths, positions, and even component types (card → modal)

---

## 7. CSS Custom Properties & @property (Jhey)

### Type Specification Unlocks Animation

**Principle:** CSS sees custom properties as strings, which can't interpolate. Declaring a type with `@property` lets the browser animate them smoothly.

Example (CSS):

```css
@property --hue {
  initial-value: 0;
  inherits: false;
  syntax: '<number>';
}

@keyframes rainbow {
  to { --hue: 360; }
}
```

**Available types:** length, number, percentage, color, angle, time, integer, transform-list.

### Decompose Complex Transforms

**Principle:** a single transform can't follow a curved path. Split it into typed properties animated on different keyframes.

Example (CSS):

```css
@property --x { syntax: '<percentage>'; initial-value: 0%; inherits: false; }
@property --y { syntax: '<percentage>'; initial-value: 0%; inherits: false; }

.ball {
  transform: translateX(var(--x)) translateY(var(--y));
  animation: throw 1s;
}

@keyframes throw {
  0% { --x: -500%; }
  50% { --y: -250%; }
  100% { --x: 500%; }
}
```

The ball arcs through space rather than moving in straight lines.

### Scoped Variables for Dynamic Behavior (Jhey)

**Principle:** custom properties respect scope, so one animation definition can behave differently per element.

Example (CSS):

```css
.item { --delay: 0; animation-delay: calc(var(--delay) * 100ms); }
.item:nth-child(1) { --delay: 0; }
.item:nth-child(2) { --delay: 1; }
.item:nth-child(3) { --delay: 2; }
```

---

## 8. 3D CSS (Jhey; marketing only)

### Think in Cuboids

> "Think in cubes instead of boxes." (Jhey Tompkins)

Complex 3D scenes are assemblies of cube-shaped elements (like LEGO). Decompose any 3D object into cuboids.

### Essential Setup

```css
.scene {
  transform-style: preserve-3d;
  perspective: 1000px;
}
```

### Responsive 3D

Use CSS variables for dimensions and `vmin` units:

```css
.cube {
  --size: 10vmin;
  width: var(--size);
  height: var(--size);
}
```

Gate any 3D motion behind reduced-motion (it is a vestibular trigger).

---

## 9. Clip-Path Animations (Emil)

**Principle:** reveal content by animating `clip-path` instead of width/height.
- Hardware-accelerated rendering
- No layout shifts
- No additional DOM elements needed
- Smoother than width/height animations

### Basic Syntax

```css
clip-path: inset(top right bottom left);
clip-path: circle(radius at x y);
clip-path: polygon(coordinates);
```

### Image Reveal Effect

Example (CSS):

```css
.reveal {
  clip-path: inset(0 0 100% 0); /* Hidden */
  animation: reveal 1s forwards cubic-bezier(0.77, 0, 0.175, 1);
}

@keyframes reveal {
  to { clip-path: inset(0 0 0 0); } /* Fully visible */
}
```

### Tab Transitions

Duplicate the tab list with different styling. Animate the overlay's clip-path to reveal only the active tab. This creates smooth color transitions without timing issues. (In app UI, keep it at `duration-base` or faster; tabs are high-frequency.)

### Scroll-Driven with clip-path

Example (Motion for React):

```javascript
const clipPathY = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);
const motionClipPath = useMotionTemplate`inset(0 0 ${clipPathY} 0)`;
```

### Text Mask Effect

Stack elements with complementary clip-paths:

```css
.top { clip-path: inset(0 0 50% 0); }    /* Shows top half */
.bottom { clip-path: inset(50% 0 0 0); } /* Shows bottom half */
```

Adjust values on mouse interaction for seamless transitions.

---

## 10. Button & Interactive Feedback (Emil)

### Scale on Press

**Principle:** give immediate tactile feedback on press with a tiny scale-down.

Example (CSS):

```css
button {
  transition: transform var(--duration-fast, 150ms) var(--ease-out);
}
button:active {
  transform: scale(0.97);
}
```

### Don't Animate from scale(0)

**Principle:** scaling from nothing looks unnatural. Start at 0.9 or higher, with opacity.

Example (Motion for React):

```jsx
// BAD: Unnatural motion
initial={{ scale: 0 }}

// GOOD: Natural, gentle motion
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
```

### Tooltip Delay Pattern

**Principle:** first tooltip in a group: delay + animation. Once one is open, moving to neighbours shows them instantly.

Example (CSS):

```css
[data-instant] {
  transition-duration: 0ms;
}
```

### Blur as a Bridge

**Principle:** when a state transition isn't smooth enough, a brief blur masks the imperfection.

```css
.transitioning {
  filter: blur(2px);
}
```

---

## 11. CSS Transitions vs Keyframes (Emil)

### Interruptibility Problem

**Principle:** keyframe animations can't be interrupted mid-flight. When users rapidly trigger actions, elements jump instead of retargeting. Use **state-driven transitions** for anything the user can re-trigger.

Example (CSS + a state flag set after mount; any framework):

```css
.element {
  transform: translateY(100%);
  transition: transform var(--duration-slow, 300ms) var(--ease-out);
}
.element.mounted {
  transform: translateY(0);
}
```

```javascript
// After the element is in the DOM (e.g. in a mount hook / effect):
element.classList.add("mounted");
```

### Direct Style Updates for Performance

**Principle:** CSS variables cause style recalculation across all children. For frequent updates (drag operations), set the element's style directly.

```javascript
// BAD: CSS variable (expensive cascade)
element.style.setProperty('--drag-y', `${y}px`);

// GOOD: Direct style (no cascade)
element.style.transform = `translateY(${y}px)`;
```

### Momentum-Based Dismissal

**Principle:** use velocity (distance / time) instead of distance thresholds. Fast, short gestures should work; users shouldn't need to drag far.

```javascript
const velocity = dragDistance / elapsedTime;
if (velocity > 0.11) dismiss();
```

### Damping for Natural Boundaries

When dragging past boundaries, reduce movement progressively. Things in real life slow down before stopping.

---

## 12. Spring Physics (Emil)

### Key Parameters

| Parameter | Effect |
|---|---|
| **Stiffness** | How quickly the spring reaches its target (higher = faster) |
| **Damping** | How quickly oscillations settle (higher = less bounce) |
| **Mass** | Weight of the object (higher = more momentum) |

### Spring for Mouse Position

**Principle:** values that follow input continuously (cursor, drag) should interpolate with a spring, not snap.

Example (Motion for React):

```javascript
const springConfig = { stiffness: 300, damping: 30 };
const x = useSpring(mouseX, springConfig);
const y = useSpring(mouseY, springConfig);
```

### Interruptibility

Great animations can be interrupted mid-play:
- Spring-based JS libraries (e.g. Motion) support interruption natively
- CSS transitions allow smooth interruption before completion
- Test by clicking rapidly: animations should blend, not queue

---

## 13. Origin-Aware Animations (Emil)

**Principle:** animations originate from their logical source. A dropdown grows from its trigger, not from its center.

Example (CSS):

```css
.dropdown {
  transform-origin: top center;
}
```

**Component library support (examples):**
- Base UI: `--transform-origin` CSS variable
- Radix UI: `--radix-dropdown-menu-content-transform-origin`

---

## 14. Scroll-Driven Animations (Jhey; mainly marketing)

### The Core Problem

Scroll-driven animations are tied to scroll **speed**. If users scroll slowly, animations play slowly. That feels wrong for most UI: you want the animation to trigger at a scroll position, not be controlled by scroll speed.

### Duration Control Pattern

**Principle:** decouple trigger from timing with two coordinated animations:
1. **Trigger animation:** scroll-driven, toggles a custom property when the element enters view
2. **Main animation:** traditional duration-based, activated via a style query

The animation then runs over a fixed duration once triggered, regardless of how fast the user scrolled.

### Progressive Enhancement

Always provide a fallback:

```javascript
// IntersectionObserver fallback for browsers without scroll-driven animation support
if (!CSS.supports('animation-timeline', 'scroll()')) {
  // Use IntersectionObserver instead
}
```
