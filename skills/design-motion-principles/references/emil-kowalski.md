# Emil Kowalski's Animation Principles
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: marked as the SaaS default lens, design-system tokens, library-neutral wording. -->

Emil Kowalski is a Design Engineer at Linear. Creator of Sonner, Vaul, and the "Animations on the Web" course. His approach emphasizes **restraint, speed, and purposeful motion**.

**In this skill, Emil's lens leads for SaaS apps and dashboards.** Apply it first; reach for Jakub's polish only once something has earned motion.

This file is Emil's **philosophy and decision frameworks**: the judgment for *whether* and *when* to animate. Implementation code lives in `motion-cookbook.md` (cross-referenced below).

---

## Core Philosophy: Restraint & Purpose

Emil's defining contribution to motion design thinking is knowing **when NOT to animate**.

> "The goal is not to animate for animation's sake, it's to build great user interfaces."

His key question for any interaction: **"Should this animate at all?"**

### The Frequency Rule

Animation appropriateness depends on interaction frequency:

| Frequency | Recommendation |
|---|---|
| Rare (monthly) | Delightful, morphing animations welcome |
| Occasional (daily) | Subtle, fast animations |
| Frequent (100s/day) | No animation or instant transitions |
| Keyboard-initiated | Never animate |

**The Raycast example:** a tool used constantly throughout the day benefits from zero animation. Users with clear goals "don't expect to be delighted" and prioritize frictionless workflow. Most screens in a SaaS dashboard are like this.

### Speed is Non-Negotiable

> "UI animations should generally stay under 300ms."

A 180ms animation feels more responsive than 400ms. Speed creates perceived performance. When in doubt, go faster. (Use the design system's duration tokens when defined.)

---

## The 7 Practical Animation Tips

Emil's decision checklist. Code for each is in the cookbook section noted.

1. **Scale your buttons:** subtle `scale(0.97)` on `:active` for immediate tactile feedback. → cookbook §10
2. **Don't animate from `scale(0)`:** it creates unnatural motion. Start from `scale(0.9)` or higher. → cookbook §10
3. **Tooltip delay patterns:** first tooltip in a group: delay + animation. Subsequent: instant. → cookbook §10
4. **Custom easing is essential:** *"Easing is the most important part of any animation. It can make a bad animation feel great."* Built-in `ease`/`ease-in-out` lack strength; use custom Bézier curves (easing.dev, easings.co). → cookbook §2
5. **Origin-aware animations:** motion should originate from its logical source; a dropdown expands from its trigger, not from center. → cookbook §13
6. **Keep animations fast:** under 300ms for UI; remove animation entirely for high-frequency interactions.
7. **Use blur when nothing else works:** `filter: blur(2px)` masks imperfections during rough state transitions. → cookbook §10

---

## Signature Techniques (decision context; code in cookbook)

| Technique | When Emil reaches for it | Cookbook |
|---|---|---|
| Clip-path animations | Reveals and tab transitions: hardware-accelerated, no layout shift, no extra DOM | §9 |
| Spring physics | Any value that should interpolate smoothly rather than snap (e.g. mouse position) | §12 |
| CSS transitions over keyframes | Anything the user can rapidly re-trigger; keyframes can't retarget mid-flight | §11 |
| Direct style updates | Frequent updates like drag; CSS variables cause cascade recalculation | §11 |
| Momentum-based dismissal | Swipe-to-dismiss: use velocity, not distance thresholds | §11 |

---

## Interruptibility

Great animations can be interrupted mid-play and respond naturally. Spring-based JS libraries (e.g. Motion) support this natively; CSS transitions allow smooth interruption before completion. **Test by clicking rapidly:** animations should blend, not queue.

---

## When to Use Each Approach

| Context | Approach |
|---|---|
| Keyboard shortcuts | No animation |
| High-frequency tool | Minimal or no animation |
| Daily-use feature | Fast, subtle animation (180-250ms) |
| Onboarding/first-time | Delightful animations welcome |
| Marketing/landing page | Full creative expression |
| Banking/billing/serious UI | Minimal, functional motion |
| Playful brand | Bouncy, elastic easing appropriate |

---

## Invisible Quality: Lessons from Sonner & Vaul

Emil's open-source libraries (Sonner for toasts, Vaul for drawers) reveal his philosophy in shipped code. The throughline: every detail serves **invisible quality**. Users shouldn't notice polished interactions; they should just feel right.

> "When a feature functions as you assume it should, you proceed without giving it a second thought, which is our goal."

Details that matter: matching native motion curves for familiarity (Vaul uses iOS's `cubic-bezier(0.32, 0.72, 0, 1)`), damping near boundaries (*"things in real life don't suddenly stop, they slow down first"*), multi-touch protection, pointer capture during drags, pausing timers when the tab is inactive.

### Sonner Defaults

| Setting | Value | Rationale |
|---|---|---|
| Duration | 4000ms | Long enough to read, short enough to not annoy |
| Animation | 400ms ease | Smooth but snappy |
| Position | bottom-right | Convention, out of primary content |
| Dismissible | true | User control by default |

### Vaul Defaults

| Setting | Value | Rationale |
|---|---|---|
| Duration | 500ms | Match iOS sheet feel |
| Easing | cubic-bezier(0.32, 0.72, 0, 1) | iOS-native curve |
| Modal | true | Focus management, overlay |
| Direction | bottom | Convention for mobile sheets |

---

## Emil vs. Jakub vs. Jhey

| Aspect | Emil | Jakub | Jhey |
|---|---|---|---|
| **Focus** | Restraint & speed | Subtle polish | Playful experimentation |
| **Key question** | "Should this animate?" | "Is this subtle enough?" | "What could this become?" |
| **Signature technique** | Frequency-based decisions | Blur + opacity + translateY | CSS custom properties |
| **Ideal context** | High-frequency tools, SaaS apps | Production polish | Marketing, delight moments |

**Synthesis:** use Emil's framework to decide IF you should animate. Use Jakub's techniques for HOW to animate in production. Use Jhey's approach for expressive moments and experimentation.
