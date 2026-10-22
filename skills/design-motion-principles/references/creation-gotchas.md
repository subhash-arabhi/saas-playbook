# Creation Gotchas
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: tool-agnostic wording, design-system tokens, quiet in the SaaS app, never static. -->

Where the agent typically fails when **writing** motion. Self-check generated code against every item before presenting.

---

## Motion that shouldn't exist

- **Don't animate just because you can.** Decorative motion added "for polish" is the default failure mode. Every animation needs a purpose: feedback, orientation, or continuity. If you can't name the purpose, remove it.
- **Don't animate high-frequency interactions.** If the user triggers it dozens of times a session (table rows, tabs, filters), motion becomes friction. Instant is correct.
- **Don't animate keyboard-initiated actions.** Keyboard shortcuts and the command palette should never animate. The user wants speed, not a show.
- **Don't add looping attention-seeking motion.** No pulsing dots, glowing status rings, breathing CTAs, throbbing indicators, or any looped scale/opacity pulse to draw the eye. They age badly, harm accessibility, and rarely serve the user. Use a static treatment unless the user explicitly asks for a pulse.

## Wrong defaults

- **Don't start from `scale(0)`.** It produces unnatural motion. Start from `scale(0.9)` or higher.
- **Don't use bare `ease` or `ease-in-out`.** Built-in curves lack strength. Use the design system's easing token, the skill's default curve, or a spring.
- **Don't give enter and exit equal weight.** Exits should be subtler (smaller translate, shorter); the user's attention is already moving on.
- **Don't use one duration for everything.** Smaller elements animate faster. Match duration to element size and context.
- **Don't ignore `transform-origin`.** Dropdowns, popovers, and tooltips should expand from their trigger, not from center.

## Ignoring the project

- **Don't invent values when the design system has motion tokens.** Use them. If it has none, use the skill defaults and offer to add them to the design system.
- **Don't ignore the existing codebase.** If the project already animates with 500ms springs, a new 150ms ease-out component will feel foreign. Match established conventions unless they are the thing being fixed.
- **Don't add an animation library for one transition.** If the project has none, a CSS transition is usually enough. Adding a dependency is a decision for the user.

## Performance failures

- **Don't animate layout properties.** `width`, `height`, `top`, `left`, `margin`, `padding` trigger reflow. Use `transform` and `opacity`.
- **Don't sprinkle `will-change` everywhere.** It's a targeted hint for elements about to animate, not a global fix.
- **Don't use keyframes for interruptible animations.** Keyframes can't retarget mid-flight. Use state-driven transitions for anything the user can re-trigger rapidly.

## Accessibility omissions

- **Don't ship motion without `prefers-reduced-motion`.** Every animation you generate needs a reduced-motion path. This is not optional and not a follow-up. Include it in the same code.
- **Don't use vestibular triggers casually.** Large-scale zoom, spin, and parallax can cause genuine discomfort. Avoid unless the design explicitly calls for it, and gate them behind reduced-motion.

## Context blindness

- **Don't apply one lens universally.** Emil's sub-300ms restraint is the SaaS default, but it is wrong for a playful onboarding moment; Jhey's elastic playfulness is wrong for a billing page. State the weighting before generating.
- **Don't let a marketing-page habit leak into the app.** Scroll reveals, staggered lists, and fade-in-on-mount belong (sparingly) on landing pages, not in dashboards.
