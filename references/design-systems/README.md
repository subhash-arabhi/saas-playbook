# Reference design systems

Starting points for a new app's `DESIGN.md`. **Pick one, copy it to the project root as `DESIGN.md`, then make it yours.** Change the name, the primary/accent colors, the fonts and the voice in the Overview. Never ship a near-copy of another company's brand: it looks generic and risks trademark look-alike problems.

| Reference | Feel | Good for |
|---|---|---|
| [`linear/`](linear/DESIGN.md) | Dark, dense, precise, single indigo accent | Power-user tools, dashboards, issue/task trackers |
| [`vercel/`](vercel/DESIGN.md) | Stark black-and-white, hairline borders, developer-platform | Developer tools, technical products, minimal admin UIs |
| [`cal/`](cal/DESIGN.md) | Clean white canvas, black CTAs, friendly display font | Scheduling, booking, consumer-facing SaaS, forms-heavy apps |

All three use the [Google DESIGN.md format](https://github.com/google-labs-code/design.md): YAML design tokens at the top (colors, typography, spacing, rounded, components), then prose sections (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts). For a blank start, use [`templates/DESIGN.md`](../../templates/DESIGN.md).

**Source:** [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) @ `13be5c0` (MIT, see `licenses/voltagent-awesome-design-md.LICENSE`). These are third-party *interpretations* of each brand's public design language, not official brand files. More brands are in that repo if none of these fit; copy and review any new one the same way.
