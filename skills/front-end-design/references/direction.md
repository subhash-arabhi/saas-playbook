<!-- Adapted from anthropics/skills@41bbe19 skills/frontend-design/SKILL.md (Apache-2.0, see licenses/). Changes: rewritten as rules for the /front-end-design flow; the token plan writes to DESIGN.md; the screenshot self-critique pass removed; motion guidance limited to what fits the playbook's motion inventory; trimmed. -->

# Direction: make choices for this product, not defaults

Use this while running steps 1–4 of `/front-end-design` (brand, style, palette, type), and whenever a screen needs a new direction.

## Ground everything in the subject
- **Name the subject, the audience and the primary job** before any visual choice. If the brief doesn't say, propose them and confirm.
- **Distinctive choices come from the subject's world:** its industry, materials, vernacular and real content. A tool for kids' clubs and a dashboard for financial analysts look nothing alike.
- **Build with real content.** Placeholder copy makes a design feel as templated as placeholder layout.

## Defaults to name and avoid
Generated design clusters around these. Each is fine when the brief asks for it; otherwise don't spend a free choice on it.
1. A warm cream background with a high-contrast serif display and a terracotta accent.
2. A near-black background with one acid-green or vermilion accent.
3. A broadsheet layout: hairline rules, zero radius, dense newspaper columns.
4. The SaaS card kit: everything in identical rounded cards, one radius everywhere, the same soft grey shadow, gradient washes as decoration.
5. Template chrome: a tracked ALL-CAPS eyebrow above every heading, meta joined with middle dots, "WORD — fragment" labels, tinted near-black for black, monospace for small labels, "→" on every link and button.

**Typographic tells to avoid:** one accented word in a headline (italic, bold or a different colour), all-caps labels, labels above content that add nothing.

## The design plan (written into DESIGN.md)
1. **Colour:** the base palette as a few named roles, then the 12-step scales from `.agents/tools/design-palette.mjs`.
2. **Type:** one or two families with clear roles; if two, clearly distinct. Choose them for this product, not the usual ones. A real scale with intentional weights and tracking.
3. **Layout:** the layout concept in a sentence or an ASCII wireframe, with alignment.
4. **Principles:** what makes this product's UI its own, including the signature element.

**Check the plan against the brief before building:** if a part is what you'd produce for any similar product, change it and say what changed and why.

## Principles
- **Spend boldness in one place.** One memorable element; everything around it quiet and disciplined. Remove one accessory before you finish.
- **The hero opens with the most characteristic thing in the subject's world:** a headline, an image, a live demo, an interactive moment. A big number with a small label and a gradient is the default; use it only if it's truly best.
- **Type carries personality.** Line length under 80 characters; serif body gets a little more line height.
- **Structure is information.** Borders, numbering, eyebrows and dividers encode something about the content. Number things only when they are a sequence.
- **Motion answers people.** Motion that shows what changed after an action (opening, expanding, confirming) is always welcome. Ambient motion is one orchestrated moment, not scattered effects. The screen's motion inventory in `DESIGN.md` decides the rest.
- **The quality floor is silent:** responsive to mobile, visible keyboard focus, reduced motion respected, accessible contrast.

## Writing in the interface
- **Words make the interface easier to use;** they're design content, not decoration.
- **The user's language, not the system's:** "notifications", not "webhook config". Plain and specific beats clever.
- **Active voice; a button says what happens:** "Save changes", not "Submit". An action keeps its name through the flow: "Publish" → "Published".
- **Errors and empty screens give direction:** what happened and how to fix it; no apologies, never vague. An empty screen invites the first action.
- **Sentence case, plain verbs, no filler.** Each piece of text does one job.
