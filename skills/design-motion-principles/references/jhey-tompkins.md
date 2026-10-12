# Jhey Tompkins' Animation Principles
<!-- Adapted from kylezantos/design-motion-principles@4a9ca87 (MIT, see licenses/). Changes: scoped to marketing pages and delight moments, trimmed learning-only advice. -->

Jhey Tompkins (@jh3yy) is a design engineer known for pushing the boundaries of CSS and creative coding. His approach emphasizes **playful experimentation**: learning through building whimsical projects where the joy of creation drives skill development.

**In this skill, Jhey's lens is selective.** Use it on marketing/landing pages and for a deliberate delight moment (an empty state, a first success). Inside the SaaS app, Emil's restraint leads.

This file is Jhey's **philosophy and decision frameworks**: the judgment for *creative expression* and *easing personality*. Implementation code lives in `motion-cookbook.md` (cross-referenced below).

---

## Core Philosophy: Learn Through Play

> "I went from 'I want to learn X, so how do I fit it into Y' to 'I want to make Y, can I learn X to do it?'"

His key question for any interaction: **"What could this become?"**

### Core Beliefs

- **No idea is a bad idea:** explore first, judge later
- **"Useless" demos teach real skills:** CSS art teaches clip-path mastery, border-radius tricks, stacking contexts
- **Lateral learning:** building diverse demos trains you to switch contexts and rise to challenges

For shipped product UI, the exploring happens before the PR; what ships still passes the frequency gate and reduced-motion check.

---

## When to Apply Jhey's Mindset

- Marketing and landing pages, where delight is part of the point
- One deliberate delight moment in the app (empty state, first success, onboarding)
- Prototyping or exploring what's possible with new CSS features

---

## The Golden Rule (Even in Play)

> "The best animation is that which goes unnoticed."

Even in playful contexts, effective motion enhances the experience without demanding attention, feels natural and expected, serves a functional purpose, and doesn't fatigue users on repeated interactions.

---

## Easing Has Personality (Decision Framework)

> "Duration is all about timing, and timing has a big impact on the movement's naturalness."

Each easing curve communicates something. **Context matters more than rules.**

> "You wouldn't use 'Elastic' for a bank's website, but it might work perfectly for an energetic site for children."

Brand personality (from the design system) should drive easing choices: a playful brand can use bouncy/elastic easing, a professional brand should use subtle springs or `ease-out`.

**When NOT to use bouncy/elastic easing:**
- Professional/enterprise applications
- Frequently repeated interactions (gets tiresome)
- Error states or serious UI
- When users need to complete tasks quickly

(Easing-feel reference table and the `linear()` recipe for pure-CSS bounce/elastic/spring → cookbook §2.)

---

## Signature Techniques (decision context; code in cookbook)

| Technique | When Jhey reaches for it | Cookbook |
|---|---|---|
| `linear()` function | Pure-CSS bounce, elastic, spring effects without JS | §2 |
| `@property` | Animating CSS custom properties: type declaration unlocks interpolation | §7 |
| Decomposed transforms | Curved motion paths impossible with a monolithic transform | §7 |
| `animation-fill-mode` | Delayed fade-in sequences: `backwards` prevents the pre-animation flash | §1 |
| Negative delays | "Already in progress" stagger effects | §2 |
| Scoped CSS variables | Varied behavior from a single animation definition | §7 |
| 3D CSS ("think in cubes") | Decompose 3D objects into cuboids; `preserve-3d` + `perspective` | §8 |
| Scroll-driven with duration | Decouple animation timing from scroll speed | §14 |

---

## When to Experiment vs. Ship

| Situation | Approach |
|---|---|
| Learning a new CSS feature | Build something weird and fun (outside the product) |
| Marketing hero / landing moment | Push boundaries, within reduced-motion and performance limits |
| Client work / product UI | Apply Jakub's production polish instead |
| High-frequency tool | Apply Emil's restraint instead |

The playful approach is for **expressive moments and exploration**. For production app UI, switch to Emil's or Jakub's mindset.

---

## Common Mistakes (Jhey's Perspective, Applied to Shipping)

- **Bouncy or elastic easing on utility actions:** save it for the delight moment
- **Delight everywhere:** one deliberate moment lands; ten become noise
- **Scroll-driven animation tied to scroll speed:** decouple it (cookbook §14)
- **Forgetting the fallback:** new CSS features need progressive enhancement and a reduced-motion path

---

## Jhey vs. Emil vs. Jakub

| Aspect | Jhey | Emil | Jakub |
|---|---|---|---|
| **Focus** | Playful experimentation | Restraint & speed | Subtle polish |
| **Key question** | "What could this become?" | "Should this animate?" | "Is this subtle enough?" |
| **Signature technique** | CSS custom properties | Frequency-based decisions | Blur + opacity + translateY |
| **Ideal context** | Marketing, delight moments | High-frequency tools, SaaS apps | Production polish |

**When to use Jhey:** you're building something where delight is the goal, or exploring what's possible with a new technique.
