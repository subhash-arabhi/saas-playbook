---
name: flow-document
description: "Make a flow document for a SaaS: the user's journey as a clickable tree (with the other paths a user can take), each step opening to how it works, its input and output, the processing steps in order, and their time and cost."
metadata:
  internal: false
---

# Flow document

A single page that explains what the product does, step by step, from the user's side. The user's journey is a tree: the main path runs down the page as numbered steps, and the other paths a user can take branch off where they start. Clicking a step's arrow opens a short explanation of how that step works: its input, its output, each thing the system does (model calls, outside services, our own code) in order, and the time and cost of each.

It's for the team, investors, reviewers and future agents: one place to see what happens, what it costs and where the time goes. It is documentation of what is built, never a design for what isn't.

The page is rendered from a data file (`flow.json`) by the template `.agents/templates/flow-document.html`, so it can be regenerated whenever the product changes and its changes show as a diff.

## When to use it

- The user asks for a flow document, a user-flow tree, a "how it works" page, or the time and cost per step.
- After a plan that changed a user-facing flow is built, when the project already has a flow document (update it).

## 1. Ask first

Ask with the question tool (`.agents/rules/asking.md`), recommended option first, only what the code and docs can't answer:

1. **Audience:** internal team (default: costs, model names, job names shown), or outside readers (hide job names, internal limits and costs per call; keep times).
2. **Scope:** which journeys. Default: the main journey from first visit to the product's core result, plus everything a user can reach from it. Admin, billing and ops flows only if asked.
3. **Measurements:** use existing logs only (default, free), or also do a live run to measure (state what it costs and where it runs; only at localhost or a test environment, never production without "deploy" rights).
4. **Where it goes:** the repo (default: `docs/flow/index.html`, with `docs/flow/flow.json` beside it), or another place the user names.

## 2. Map the journeys into a tree

Read `ARCHITECTURE.md` (key flows, data model, outside services, AI models), the routes and pages, and the background jobs and schedules. Then list what a user does, in the order a typical user does it.

**Tree rules**
- **Main path = top-level steps**, numbered in the order a typical user meets them (the numbers mean order, so use them only for that). Aim for 6–12. Name each in the user's words, verb first ("Compare products' specs", not "SpecsService").
- **A branch is another path a user can take at that point:** another way in ("Pasted a link instead"), a choice that leads somewhere different (plan tier, invite vs sign-up), an outcome with its own screen ("No products found"), or a follow-on that happens only for some cases ("Then, for stores we don't know"). Put it under the step where it starts, with a short fork label: `Other path`, `If …`, `Then, for …`, `Then, on the page`.
- **At most two levels:** step → branch → sub-branch. If it goes deeper, the branch is probably its own journey: give it its own tree on the same page.
- **A branch that rejoins the main path** ends with "continues at step N". Never copy steps.
- **Work the system does inside a step is a processing step, not a node.** A background job becomes its own node only when the user sees its result as a separate stage (for example "Confirming model number…" on a card).
- **Things that run on their own** (daily checks, emails, re-checks) go at the end as their own step, or as a second tree titled "Runs on its own".
- Leave out internal plumbing a user never feels (health checks, migrations), unless the audience is ops.

Write the outline first (titles only, with branches indented) and check it against the code before filling anything in.

## 3. Fill in each node

For every step and branch, collect:

| Field | What it holds |
|---|---|
| `title` | User's words, verb first, under 40 characters |
| `summary` | One line: what the user sees or gets |
| `trigger` | Internal only: the route, job or command that runs it, e.g. `POST /api/research · research-candidates` |
| `about` | 2–4 plain sentences: how it works and why it's built that way (what keeps it reliable, cheap or safe) |
| `input` | What goes in, in words, plus a short real example |
| `output` | What comes out, in words, plus a short example (trimmed JSON for data, the sentence for text) |
| `steps` | Ordered list of what the system does. Each has a `kind`, a sentence naming the model, service or function, and its own time and cost |
| `time`, `cost` | The node's total, shown on its collapsed row |
| `callouts` | Optional: a measured live run, a known limit, a source that's deliberately not used |

**Step kinds** (keep to these so the legend stays short):
- `AI`: a model call. Name the task and the model (`**shortlist** (gpt-6.1-sol) picks 5–10 from the pool`).
- `EXT`: an outside service (search API, scraping, payments, email, a dataset). Name the provider and what it returns.
- `CODE`: our own logic: checks, rules, merging, saving. Say what it decides, e.g. "keeps a product only if a page it read names it".
- `USER`: something the user does inside the step (answers, picks, confirms), when it isn't its own step.

A step that runs several things at once says so ("read at once", "13 stores in parallel"), because it changes the time.

**Examples are real.** Take inputs and outputs from fixtures, test data, eval cases or a live run, trimmed to a few fields with `…`. Never invent IDs, model numbers, prices or names. If no real example exists, write the shape with placeholders (`"<brand>"`) instead of a plausible fake.

## 4. Measure time and cost

Use the best source available, in this order, and say which one each number came from:

1. **Telemetry from real runs:** a per-call log of outside calls with duration and cost (e.g. a `service_call` table), the job queue's history (started and completed times per job name), APM traces.
2. **A live run done now** (only if approved in step 1), at localhost or a test environment, with a fresh input so caches don't hide the cost. Note the start time, then sum the calls made after it.
3. **Eval results** (they record time and cost per call).
4. **Estimates:** the number of calls times the provider's list price, or a timing from the docs.

**Rules**
- Use **medians**, not means (one slow outlier skews a mean), and keep the sample size and date range for the footer.
- **Don't mix eras:** after a provider or model change, use only runs since the change, or say the numbers are mixed.
- **Per call vs per step vs per journey:** state which. A step's time is the critical path (steps that run at once count once, the slowest); its cost is the sum.
- **Waiting counts:** if a call's duration includes queue or rate-limit wait, say so, since it grows under load.
- **Caches:** say whether a number is cold or cached. "Cached a week" belongs in the step's text.
- **One-time and shared costs** say "once" or "per category", not per run. A free quota says "free quota", not "free".
- **Currency:** provider list prices in their own currency (usually USD), to 2 significant figures. Add local currency only with the rate and date.
- **Measured vs estimate is visible:** measured numbers on solid chips, estimates on dashed chips with `~`. Never show an estimate as measured.

Useful queries (adapt the table and column names to the project):

```sql
-- per operation: calls, average cost, median duration (successful calls only)
select service, operation, count(*) n, avg(cost_usd) avg_usd,
       percentile_cont(0.5) within group (order by duration_ms) / 1000.0 median_s
from service_call where status = 'OK' and created_at >= :since group by 1, 2 order by 1, 2;

-- per background job: runs and median run time
select name, count(*) n,
       percentile_cont(0.5) within group (order by extract(epoch from completed_on - started_on)) median_s
from pgboss.job where state = 'completed' and started_on >= :since group by 1 order by 1;
```

**Journey totals:** 3–5 cards at the top for the journeys people ask about ("Need → shortlist", "One product page"), each with its time, cost and one line saying what it covers and whether it was measured.

## 5. Check every claim

Before rendering:
- Every step, model, service and limit matches the code as it is now. Read the function, not just the docs.
- Every number has a source (step 4) and the footer names the sources, the date range and the sample sizes.
- **No private values:** no secrets, keys, tokens, cloud account or resource names, internal URLs, customer data or personal details (`.agents/rules/documentation.md`). Use placeholders like `https://www.samsung.com/in/…`.
- Paths the product deliberately doesn't take are said once, in a callout ("Not read: Flipkart reviews, because …"), so readers don't assume them.
- Words are the user's: no unexplained internal names in titles or summaries. Internal names belong in `trigger` and in steps, in bold or code.

## 6. Write `flow.json`

```json
{
  "product": "Product research",
  "asOf": "2026-10-21",
  "lede": "What happens from the moment a shopper visits the site to …",
  "totals": [
    { "label": "Need → shortlist", "time": "3.5 min", "cost": "$0.10", "measured": true,
      "note": "Measured live: a robot vacuum research, steps 2–5." }
  ],
  "nodes": [
    {
      "id": "find-candidates",
      "title": "Find candidate products",
      "summary": "An AI agent searches Google and reads expert reviews and best-of lists.",
      "trigger": "research-candidates · discover agent",
      "time": { "value": "105 s median", "measured": true },
      "cost": { "value": "$0.09", "measured": true },
      "open": true,
      "about": "A larger model works in turns with two tools …",
      "input": { "text": "The need text", "example": "\"A robot vacuum cleaner for a 2BHK flat with a dog, under ₹25,000\"" },
      "output": { "text": "A pool of 15–25 candidates (JSON)", "example": "[{ \"id\": \"c1\", \"brand\": \"ECOVACS\", … }]" },
      "steps": [
        { "kind": "AI", "text": "**discover** agent (gpt-6.1-sol) plans its searches", "time": { "value": "3 s a turn", "measured": true }, "cost": { "value": "$0.07", "measured": true } },
        { "kind": "EXT", "text": "Each search goes to Bright Data's Google results for India", "time": { "value": "40–70 s", "measured": false }, "cost": { "value": "$0.0015 each", "measured": true } },
        { "kind": "CODE", "text": "**groundPool** keeps a product only if a page it read names it" }
      ],
      "callouts": [{ "label": "Live run, 21 Oct:", "text": "182 s for 2 searches, 5 pages and 15 products." }],
      "branches": []
    }
  ],
  "footer": ["Where the numbers come from: …"]
}
```

- `id`: lowercase words with hyphens; becomes the node's anchor (`#find-candidates` opens it).
- `branches`: nodes with the same fields plus `fork` (the fork label). A branch may have its own `branches` (one more level, no more).
- `time`, `cost`, `steps[].time`, `steps[].cost`: optional; `measured: false` draws a dashed estimate chip.
- In `text`, `about`, `summary` and callouts, `**bold**` and `` `code` `` are the only markup. Everything else is shown as plain text.
- `trees` (optional, top level): more journeys on the same page, each `{ "title": "Runs on its own", "nodes": [ … ] }`, drawn after the main tree with their own numbering.
- `audience: "outside"` (optional, top level) hides `trigger` and every cost chip.
- Keep `flow.json` next to the page (`docs/flow/flow.json` when it's in the repo) so later updates are diffs.

## 7. Render the page

1. Copy `.agents/templates/flow-document.html`, replace the JSON inside `<script type="application/json" id="flow-data">` with `flow.json`, and set the `<title>` to the product's name plus "Flow" ("Product Research Flow").
2. If the project has design tokens (`DESIGN.md`), replace the template's `:root` colour and font tokens with them, in both themes. Change nothing else in the layout.
3. Don't hand-edit the rendered tree; change `flow.json` and render again.

## 8. Check the page

Look once at desktop (about 1280 px) and phone (375 px) widths, in light and dark:
- every step and branch opens and closes; "Open all" and "Close all" work; a `#id` link opens its node;
- the page never scrolls sideways (only example blocks scroll inside themselves); chips wrap under the title on a phone;
- numbers line up; estimate chips are dashed; the legend matches the kinds used;
- nothing private shows (step 5).

Fix what's wrong in one pass, then save it.

## 9. Save and keep it current

- Default: `docs/flow/index.html` and `docs/flow/flow.json`, committed with the plan's next commit (or on their own, outside a plan). It opens straight from the file in any browser. Or the place the user chose in step 1.
- The eyebrow says "as built on <date>". When a plan changes a flow, a model, a provider or a price, update `flow.json`, re-measure the steps it touched, and render again.
- Report to the user: where the page is, which numbers are measured and which are estimates, the sample sizes, and anything you couldn't measure.

## Pitfalls (seen in practice)

- **Queue time hiding in call durations:** a provider call that "takes 225 s" may be 50 s of work and 175 s waiting behind a concurrency limit. Report the unqueued time and note the queue as a known limit.
- **Runs from before a migration** still sit in the logs. Filter by date, or the "measured" median describes a provider you no longer use.
- **Invented examples look real.** A made-up model number in an example will be copied by readers. Use fixtures.
- **Cheap because cached:** a second run of the same input can cost a fifth of the first. Measure with fresh input, or say "cached".
- **Agents' costs vary widely by input:** give the live run and the eval average side by side.
- **Paths that exist only in old data** (a removed source, a legacy flow) are mentioned in a callout or left out, never drawn as live branches.
