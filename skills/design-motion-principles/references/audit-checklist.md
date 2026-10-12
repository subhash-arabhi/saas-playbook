# Motion Checklist
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: reframed as a create-time self-check and quick inline review (no audit report), library-neutral, design-system tokens. -->

Use this list in Step 4 (Self-Check) of the Create workflow, and for a quick inline review when the user asks whether some motion is right. Check the component you built **and the view it lives in**. Report results in the conversation; never write a report file.

---

## Philosophy Check (Do First)

- [ ] **How often will users trigger this?** (Frequent = less/no animation, Emil's rule)
- [ ] **Is this keyboard-initiated?** (If yes, don't animate)
- [ ] **Does this animation serve a purpose?** (feedback, orientation, continuity; not just decoration)
- [ ] **Will users notice this animation consciously?** (If yes for product UI, probably too much)
- [ ] **Does it handle `prefers-reduced-motion: reduce`?**
- [ ] **Does this feel natural after the 10th interaction?** (Try it repeatedly, not just once)
- [ ] **Is the easing appropriate for the brand/context?** (design-system personality)
- [ ] **Is the duration appropriate for the surface?** (SaaS default under 300ms; marketing may go longer)

---

## Missing-Motion Check (state changes that snap)

A state change with **no** transition can feel broken, but in SaaS UI many instant changes are correct. Only add motion where the frequency gate allows it.

- [ ] **Conditional renders** (an element shown only when some condition is true): does the element need an enter/exit, or is instant right (high-frequency)?
- [ ] **Swaps** (A replaced by B, e.g. loading → content): smooth or deliberately instant?
- [ ] **Dynamic inline styles** with changing values but no `transition`
- [ ] **Exit path exists** where an enter exists. Elements that animate in but vanish instantly feel broken. (In React with Motion, that means wrapping the conditional render in `AnimatePresence`; other stacks have their own exit mechanism.)
- [ ] **Expandable sections** avoid animating `height` directly (use a transform/clip-path or a layout/FLIP technique, see cookbook §6, §9)

---

## Enter/Exit States

- [ ] Enter animations use opacity + small translateY (blur only where it earns it, not on every element)
- [ ] Exit animations are subtler than enters (smaller translateY, shorter)
- [ ] `animation-fill-mode: backwards` used for delayed sequences
- [ ] Elements don't flash before their delayed animation starts

---

## Easing & Timing

- [ ] Durations and easings come from design-system tokens (or existing code, or the skill defaults)
- [ ] No bare `ease` / `ease-in-out` keywords; custom curves or springs
- [ ] Springs (bounce 0) for interactive, interruptible values
- [ ] Consistent timing values across related animations
- [ ] Transform-origin matches the interaction source (dropdowns from trigger)

---

## Visual Polish (secondary)

- [ ] Shadows instead of borders where the background varies (if the design system allows)
- [ ] Gradients interpolated in oklch
- [ ] Blur used intentionally as a state signal

---

## Optical Alignment

- [ ] Buttons with icons have adjusted padding
- [ ] Asymmetric icons (play, arrows) are visually centered
- [ ] Text and icons feel balanced

---

## State Transitions

- [ ] Contextual icon swaps (copy → check) are animated (opacity, scale, blur)
- [ ] Loading states transition smoothly
- [ ] Hover states have short transitions (~150ms), not instant and not slow
- [ ] Button press has scale feedback (`scale(0.97)` on `:active`) where appropriate
- [ ] Nothing animates from `scale(0)` (use `0.9+`)

---

## Interaction Patterns (Emil's Rules)

- [ ] Tooltips: first delayed + animated, subsequent instant
- [ ] Animations are interruptible (can change mid-animation)
- [ ] Clip-path used for reveals instead of width/height
- [ ] High-frequency actions have minimal or no animation
- [ ] Keyboard shortcuts don't animate

---

## Performance

- [ ] `will-change` used sparingly and specifically
- [ ] Animations use transform/opacity (not layout properties)
- [ ] No continuous animations without purpose
- [ ] Transitions (not keyframes) for interruptible animations
- [ ] Direct style updates for drag operations (not CSS variables)
- [ ] Velocity-based thresholds (not distance) for swipe dismiss

---

## Accessibility (motion behaviour)

- [ ] Respects `prefers-reduced-motion`
- [ ] No vestibular triggers (excessive zoom, spin, parallax)
- [ ] Looping animations can be paused
- [ ] Functional animations have non-motion alternatives

---

## Severity Levels (for the quick inline review)

**Must fix:**
- Missing `prefers-reduced-motion` support
- Animating layout properties (width, height, top, left)
- Enter animation with no exit (element just disappears) in primary UI
- Animating keyboard-initiated actions
- Animations on high-frequency actions (100s/day)
- Looping pulse/glow on status indicators

**Should fix:**
- Exit animations as prominent as enter animations
- Animating from `scale(0)` instead of `0.9+`
- Default CSS easing instead of token/custom curves
- New values invented while the design system defines motion tokens
- Wrong transform-origin on dropdowns/popovers
- Bouncy springs on utility actions (dropdowns, menus, toggles, modals)

**Context-dependent (check against the lens weighting):**
- Durations over 300ms (Emil flags this in the app; Jakub/Jhey may approve on marketing pages)

**Optional:**
- Optical alignment refinements
- oklch for gradients
- Springs instead of eased transitions
- Button scale feedback on press
- Tooltip delay pattern
