<!-- Adapted from Leonxlnx/taste-skill@6010f91 skills/taste-skill/references/app-screens.md (MIT, see licenses/). Changes: rewritten as rules; values come from DESIGN.md tokens instead of its style library, sheets and hex defaults; its scripts (draw, lint, inspect, charts.js, app.css), style picker, face step and report removed; "no entrance motion" dropped for the motion inventory; type, primary colour and palette left to DESIGN.md; phone rules merged with quality-bar.md; trimmed. -->

# App screens

Dashboards, admin, analytics, settings, inboxes, queues and the detail page of one object: the screens people work in. Read this before building one; `quality-bar.md` still applies, and `DESIGN.md` supplies every value. Where an approved `DESIGN.md` item differs from a rule here, `DESIGN.md` wins: build it as approved and raise the difference through the design-change flow (`.agents/rules/design-system.md`), never restyle it silently.

A generated dashboard is the average of every template: a tinted sidebar with a coloured active pill, "Welcome back" with a waving hand, four KPI cards each with an icon in a tinted circle, a green "+12.5%" and a sparkline, a gradient area chart, a zebra table under uppercase headers. Nothing in it is wrong and none of it was decided.

## What real product screens do
Measured from 23 real product screens (17 products, desktop width):
1. **Colour goes on data, not chrome.** About 3% of pixels are coloured; 12 of 23 have no filled primary button.
2. **KPIs are type, not tiles.** No icon in a coloured circle, no sparkline, on any of them.
3. **Surfaces are flat.** 17 of 23 cards have no shadow; a 1px line or one tone step separates them.
4. **No hero header.** The page title is about 24px; 9 screens have nothing over 16px.
5. **Charts carry almost no chrome.** No legend for one series; 3–5 faint gridlines or none.
6. **Navigation recedes.** The active item is a neutral pill or brighter text; a coloured left bar appears once.
7. **Tables are rules and alignment.** No zebra striping, no header band, numbers right-aligned.
8. **Data states are honest.** Zeros print as zeros, missing values as a grey dash, an empty section keeps its frame.

Quiet is the starting point, not the goal. In blind tests, quiet screens lost to richer ones when:
- **The first screen was thin:** one big flat chart, half the asked-for blocks below the fold.
- **The product was missing:** no name, mark or workspace, so the screen could belong to anyone.
- **Restraint hid meaning:** a rise in errors in the same grey as a rise in visits.
- **There was nothing to do:** no control for the job the screen exists for.

## Before building
1. **Inventory the data:** the objects and their fields with units, realistic magnitudes (including a new account's small numbers), who opens the screen and how often, and what they do next.
2. **Name the screen's one question** ("Which deploy broke?", "Who is waiting for a reply?"). The biggest block answers it and is read first; the largest figure answers the title.
3. **Name the one finding** in today's data ("the 23:28 deploy doubled the error rate") and put it under the title or the headline figure, next to the action it drives.
4. **List the blocks** as answers to the next questions, one line each. A block with no question is deleted. This avoids the stock KPI row, big chart, two small charts, table.
5. **Sample data that adds up:** totals are computed from the rows, a fact shown twice is one variable, a change is the difference of the two values on screen, every relative figure names its baseline ("+5 on the usual Monday").

## The first screen
- **Everything the plan names shows at 1440×900:** each block's header and first rows. The headline block is about 200–360px tall; long lists cap at 4–6 rows with "View all"; time-sensitive blocks (bills due, a failed deploy) come before long tables.
- **The most frequent job is one click away:** a primary button in the title row, an action on the row that needs it.
- **Show the evidence beside the answer:** annotate the spike ("after the 23:28 deploy, reverted") rather than adding a second chart.
- **The product is named:** its mark and name at the top of the sidebar, and the scope (workspace, team, project) as a switcher or breadcrumb.

## Shell and canvas
- **Sidebar** about 224–240px, on the page ground or one step off it, never dark or saturated on a light screen. Rows about 32px on a 34px pitch, 16px outline icons, 14px labels. Group labels in grey sentence case, never uppercase. Settings and help at the bottom.
- **Nav items are other screens,** never anchors into one long page. A count on a nav item only for a queue that needs action, with its noun clear ("Requests 5").
- **Top bar** only when it holds something real: search, the switcher, or the object's name.
- **One gutter** for horizontal and vertical gaps. **One left edge and one right edge** from the header to the last row; write down the grid sum that proves the cards land on the edges.
- **The column count follows the items:** four KPIs get four columns, a lone card spans. **Cards in a row share a bottom edge;** balance by content, never by stretching a card over blank space. Narrow blocks (5 columns or 6 rows or fewer) pair with the next block instead of spanning the canvas.
- **Title:** one h1, a noun ("Invoices", the object's name), not a greeting. An optional grey line under it about the data (the finding, the period), never about the interface. Actions to its right only when real; one primary per screen.
- **Date range** at page level or on each card, never both. Underline tabs sit on a full-width 1px rule. Scope on the left, utilities on the right.

## KPIs
- **No tile of its own by default:** one container split by 1px dividers, or each headline number in the card that explains it. Label above value, grey, sentence case; the value about 1.7× the label, nothing at 48px or over.
- **Nothing else on a KPI:** no icon circle, no sparkline, no tinted tile. Units as a smaller grey suffix ("5 mins").
- **The answer figure leads:** when one figure is the screen's answer, it is at least 1.3× its siblings, and no other figure is larger.
- **One figure, one place:** don't repeat a KPI in a legend or as a panel's title.
- **Deltas** are optional, no larger than the label, with the window in words ("vs prior 30 days"). **Colour says good or bad, not up or down:** rising latency or cost is negative. A zero or undefined change is grey; from zero, write "+4 (new)".

## Charts
- **The form follows the question:** one line for change over time (area fill 15% or less), square-cornered columns per period, a sorted bar list for ranking, a thin ring or 100% bar for share (five parts at most), a progress bar with both ends labelled for a target. When a few numbers say it, draw no chart.
- **One series per chart,** three at most; switch metrics with a control instead of overlaying lines.
- **Axes:** 3–5 faint horizontal gridlines, no y-axis line, 4–7 round ticks with the top one above the maximum, zero as the baseline for bars. Never without a scale. Axis text no larger than the data. 4–8 x labels, never rotated.
- **Marks:** 2px straight lines, no point markers, no smoothing. One hue per chart; the accent goes on the main data element (today's series, the current period). One subject keeps one hue across the screen; four hues at most.
- **Legends:** none for one series; otherwise five items at most in the card header, each swatch the mark itself scaled down.
- **Annotate the event that matters** with a 1px marker and a short label; reference lines (a budget, an SLO) 1px dashed and labelled at the end. A forecast is dashed after today.
- **Short and empty histories are drawn honestly:** the zero line, missing bars for empty periods, no padded range, no "No data" picture. A flat series with one event gets at most two-thirds of the width.

## Tables and lists
- **Rows** about 45px for one line, 72px with media; a second line one size smaller and grey, with a 40px pitch at least. Overview lists show 2–5 rows, with "View all" and the total instead of pagination.
- **Header** 12px grey sentence case, no fill band, numeric headers right-aligned over their values. Sort glyph on the active column only.
- **No zebra.** Row rules 1px and faint, or none with a generous pitch.
- **Figures right-aligned with tabular figures,** fixed decimals per metric (money 2, counts 0), thousands separators, a sign on every change. **The identity column gets the most width** and is never the one cut off. IDs in mono, truncated with a copy button. Two measures stack in one cell rather than taking two columns.
- **Ink:** only the identity and the key number in primary ink. A missing value is a grey dash; a real zero is printed. The sign lives in the text; no red on every negative.
- **Status pills:** pale tint with dark text of the same hue, about 20px tall, never squeezed (`white-space: nowrap`). One status mark per row. A saturated fill only for the one rare call to action.
- **Row actions:** none, one kebab at the far right, or, when the row needs doing, a visible ghost button in one fixed trailing column at the same pitch for every row.
- **Full list screens:** the total above the table, the header in view while scrolling, the range at the end ("1–50 of 1,284").

## Forms and settings
- **Label above the field;** one control height per context; disabled controls stay legible and say why.
- **Settings:** each section a row of a label column (title and grey description) beside its panel, sections split by a full-width rule. One view per area, its name as the h1. One save model per view: autosave with a quiet "Saved", or one Save per panel, never both.
- **Show what the setting produces:** a small preview (the invite email, the next invoice) beside the control.
- **Destructive actions** last, in their own section, the consequence in words and a confirmation that names the object.

## States
- **Counts follow the view:** tab and KPI counts are computed from the rows in the current filter.
- **An empty section keeps its frame and header** with one sentence spanning the block; an empty side card can show reference data ("Nothing overdue yet; last month: 3").
- **First run:** keep the frame and title, and put the first action where the data will appear, with setup progress at its true percentage.
- **Red is a signal, not a texture:** one red mark per object at most, on the failing fact.
- **Error inside the block that failed,** never a full-screen banner: what failed, when the data was last good, a Retry.
- **Stale data:** a freshness stamp with a refresh button.

## On the phone
Also `quality-bar.md` → Dark mode and mobile.
- **Navigation folds** into a top bar with a menu sheet, or a bottom bar of four or five destinations.
- **KPIs** become a 2-column grid or a label-value list, never four squeezed columns.
- **At most one row of controls above a chart or list;** the first list row starts in the top 60% of the screen.
- **Tables become two-line rows below about 640px:** identity and key number on line 1, the other fields on line 2 in grey. Fields move, never disappear. A table that must stay a table scrolls inside its own frame with the identity column fixed and the key number in view without scrolling.
- **Blocks that carry an action move up:** a rail with "Bills due · Pay" becomes a summary row above the list.
- **List and detail:** one region at a time; back returns to the list at its scroll position.

## Tells of generated dashboards
| Tell | Instead |
|---|---|
| Dark or tinted sidebar, coloured active pill with a left bar | Sidebar on the page ground, neutral pill |
| "Welcome back" with an emoji | A noun title |
| KPI cards with icons in tinted circles, sparklines, green "+12.5%" pills | One divided container, label over value, deltas in words with their window |
| Gradient area chart, smoothed spline, a dot on every point | A 2px straight line, little or no fill |
| A hue per bar or per chart | One hue per chart, on the main data |
| Fat donut with slice labels | Thin ring, legend as a table with values |
| Cards with a big radius, a border and a soft shadow | A border or a tone step, not both |
| Zebra table, uppercase headers, a checkbox, avatar, chip and kebab on every row | Rules and alignment, one status mark, one action where needed |
| Saturated chips with white text | Pale tints with dark text |
| A top bar with search, bell and avatar left mostly empty | No top bar, or one that holds something real |
| Equal four-up grids with orphan cells and stretched cards | Column count from the item count, rows that end level |
| Placeholder people, round vanity totals, growth on a week-old account | The product's own data at its real size, totals from the rows |

A screen with every tell removed and nothing in its place is a tidy template. What fills the space is the product: its own data, the screen's one question answered by its biggest block, and a grid whose sums close.
