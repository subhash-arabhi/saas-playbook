# Accessibility (Reduced Motion)
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: library-neutral examples, scoped to motion behaviour. -->

**This is not optional.** Motion can cause discomfort, nausea, or distraction for many users. Reduced-motion handling ships with every animation, in the same change.

This file covers **motion behaviour only**. A full WCAG check is a separate audit; it is not a reason to skip this.

---

## Respect User Preferences

**Principle:** when the user asks the OS for reduced motion, remove or shorten movement while keeping the final state, so nothing is left hidden or half-positioned.

Example (CSS, global safety net):

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**What this does:** effectively disables animations while preserving final states (so layouts don't break).

Example (CSS, opt-in per component; motion only when the user hasn't asked to reduce it):

```css
.toast { opacity: 1; transform: none; }

@media (prefers-reduced-motion: no-preference) {
  .toast[data-entering] {
    transition: transform var(--duration-base) var(--ease-out),
                opacity var(--duration-base) var(--ease-out);
  }
}
```

Example (Motion for React; follow the user's OS setting app-wide):

```jsx
<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>

// Or per component:
const reduce = useReducedMotion();
const enter = reduce ? { opacity: 0 } : { opacity: 0, y: 8 };
```

With JS-driven animation (any library), check `window.matchMedia("(prefers-reduced-motion: reduce)")` and skip or shorten the animation.

---

## Functional vs. Decorative Motion

| Type | Purpose | Reduced-motion behaviour |
|---|---|---|
| **Functional** | Indicates state changes, spatial relationships, orientation | Replace movement with an instant change or a short opacity fade |
| **Decorative** | Pure delight, visual interest | Remove entirely |

**The test:** does removing this animation break the user's ability to understand what happened? If yes, it's functional, so keep a non-motion cue (instant state change, fade, or text).

---

## Motion Sensitivity Considerations

- Avoid large-scale motion (full-screen transitions, parallax)
- Avoid continuous or looping animations that can't be paused
- Provide pause controls for any ambient animation
- Be especially careful with vestibular triggers: zooming, spinning, parallax

---

## Implementation Checklist

- [ ] Tested with `prefers-reduced-motion: reduce` enabled (OS setting or the browser devtools emulation)
- [ ] No vestibular triggers (excessive zoom, spin, parallax)
- [ ] Looping animations can be paused
- [ ] Functional animations have non-motion alternatives
- [ ] Users can complete all tasks with animations disabled
