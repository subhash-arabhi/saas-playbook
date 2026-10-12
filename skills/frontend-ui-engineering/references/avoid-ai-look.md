# Avoid the AI Look

_Distilled from Leonxlnx/taste-skill@717446e (MIT)._ These are the defaults models reach for. Treat each as banned unless the design system or the user explicitly asks for it.

| AI default | Do instead |
|---|---|
| Purple/indigo gradients, blue "AI glow", neon outer glows, gradient text on headings | The design system's palette: neutrals plus **one** accent, flat surfaces |
| Inter + slate-900 everywhere because it's the default | The design system's type stack. Build hierarchy with weight and color, not giant headings |
| Three equal feature cards in a row; every block wrapped in a card | Layout by priority. Cards only when elevation means something; otherwise group with spacing or dividers |
| Dashboards as a wall of identical KPI cards with shadows | Key numbers in a plain, aligned layout; tabular figures; one clear primary metric |
| Centered everything (hero over a dark mesh, centered forms and tables) | Left-aligned content on a grid. In tables, text left, numbers right |
| Glassmorphism, blur and heavy shadows on everything | Solid surfaces. Subtle, background-tinted shadows only where the design system defines them |
| Pure `#000` / `#fff`, oversaturated accents | The off-black / off-white and accent from the design system |
| Mixed radii, warm and cool grays mixed, the accent drifting between screens | One radius scale and one palette, applied everywhere |
| Emoji as icons, hand-drawn SVG icons, mixed icon sets | One icon library, one stroke width |
| "John Doe", "Jane Doe", "Acme", lorem ipsum, perfect numbers (`99.99%`, `1234567`) | Realistic, locale-appropriate sample data with messy values and long names that test wrapping |
| Filler copy: "Elevate", "Seamless", "Unleash", "Next-gen", "Revolutionize" | Concrete verbs. Buttons say what they do ("Create invoice", not "Submit") |
| Several labels for one intent ("Get started", "Try free", "Sign up free") | One label per intent, used everywhere |
| Cute, "thoughtful" or em-dash-heavy UI copy | Plain functional sentences. Re-read every visible string before finishing |
| Small uppercase "eyebrow" labels above every section, section numbers ("01 / Features"), status dots on every row | Headings alone. Dots and badges only for real state (e.g. a failed job) |
| Placeholder text as the field label | Label above the input, help text under it, error text below it |
| Spinners for content | Skeletons shaped like the final layout |
| Fake product screenshots built from styled divs | A real screenshot, a real component, or nothing |
| Infinite-loop micro-animations, motion on everything | Static by default. Motion only when it explains something |

**On marketing pages** also skip: version labels or "BETA" in the hero, "Scroll to explore" cues, logo walls inside the hero (put them below it), and the same section layout repeated down the page.
