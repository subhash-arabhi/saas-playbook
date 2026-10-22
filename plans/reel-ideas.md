---
name: "Ideas from agent-skill repos"
status: approved
steps:
  - id: 1
    title: "App-screen rules from Taste v2"
    summary: "A new app-screens reference distilled from taste-skill 2.1.4, the AI-look table re-pinned, and the UI skill reads it"
    done: false
    checkpoint: false
  - id: 2
    title: "Worst-case data and phone fixes"
    summary: "The quality bar gets schema-backed worst-case data and the mobile fixes from Emil Kowalski's skills"
    done: false
    checkpoint: false
  - id: 3
    title: "Merge danger and evidence in PRs"
    summary: "The PR description adds Evidence (before and after) and Merge danger (door and blast radius)"
    done: false
    checkpoint: false
  - id: 4
    title: "Grill in dependency order"
    summary: "/plan asks a question only once the questions it depends on are answered, and looks up facts in parallel"
    done: false
    checkpoint: false
  - id: 5
    title: "Assumptions and traceable changes"
    summary: "Always 9 in the project AGENTS.md: state assumptions, ask on two readings, every changed line traces to the request"
    done: false
    checkpoint: false
  - id: 6
    title: "Docs and full check"
    summary: "Sources and licences, README credits, CHANGELOG, a trial on the sample app, a branch review and the full test run"
    done: false
    checkpoint: false
---

# Plan: Ideas from agent-skill repos

## What we're building
Six improvements found in Leonxlnx/taste-skill, emilkowalski/skills, mattpocock/skills and the Karpathy guidelines. App screens get measured rules against the template-dashboard look, UI checks use realistic worst-case data and the common phone fixes, PRs say how risky a merge is, the planning grill asks questions in dependency order, and every agent states its assumptions before a direct change. Out of scope: Impeccable's design checker (a separate plan after a trial), a `/retro` command and a worst-case toggle in the gallery.

## Changes
- **App-screen rules:** new `frontend-ui-engineering/references/app-screens.md` from taste-skill `6010f91`: colour on data, KPIs as type, flat surfaces, quiet navigation, charts, tables, honest states, a full first screen.
- **Taste re-pinned:** `avoid-ai-look.md`, the UI skill's source comment and `licenses/README.md` move from `717446e` to `6010f91`; the dashboard row points to the new reference.
- **Worst-case data:** the quality bar's "Real content" rule takes values from the validation schema or column limits and covers the short cases (one-letter names, "1 member", missing avatar, empty list), from Emil Kowalski's `break-ui`.
- **Phone fixes:** the quality bar's mobile section adds 16px inputs, hover only on `(hover: hover)`, `dvh` heights, no tap delay or highlight flash, safe areas and contained overscroll, from Emil Kowalski's `mobile-native`.
- **PR evidence and merge danger:** `templates/pr-description.md` adds Evidence (failing then passing test, or screenshots) and Merge danger (one-way or two-way door, blast radius); `workflows/push.md` fills them.
- **Grill order:** `skills/plan/SKILL.md` step 6 asks only questions whose prerequisites are answered, most consequential first among those, and looks facts up in parallel instead of asking.
- **Always 9:** the project `AGENTS.md` rule "Stay in scope" also says: state assumptions, ask when the request reads two ways, every changed line traces to the request. No renumbering.
- **Sources:** Emil Kowalski's MIT licence added to `licenses/`; Matt Pocock's skills and the Karpathy guidelines listed as "Referenced, not copied"; README credits and a CHANGELOG entry.

## Steps

### Step 1: App-screen rules from Taste v2
**Do:**
1. Write `skills/frontend-ui-engineering/references/app-screens.md` (under 150 lines) from taste-skill `6010f91` `skills/taste-skill/references/app-screens.md`: the eight measured findings, the two lessons from testing (first screen full, product named), and the shell, canvas, KPI, chart and table rules that fit `DESIGN.md` tokens. Drop its own style picker, scripts and report format. First line: an "Adapted from" comment with the commit and changes.
2. `avoid-ai-look.md`: re-pin to `6010f91`, keep the table, change the dashboard row to point to `app-screens.md`.
3. `frontend-ui-engineering/SKILL.md`: read `references/app-screens.md` before building an app screen; update its source comment.
4. `craft.md` "Infinite expression": point to `app-screens.md` for dashboards, so the two don't contradict (sparkline on a KPI).
5. `licenses/README.md`: the Taste row names both files and `6010f91` (the licence text is unchanged).
6. Tests: add `app-screens.md` to "adapted design sources name their commit and keep their licence", and check the UI skill reads it.

**Files:** `skills/frontend-ui-engineering/references/app-screens.md` (new), `skills/frontend-ui-engineering/references/avoid-ai-look.md` (edit), `skills/frontend-ui-engineering/SKILL.md` (edit), `skills/front-end-design/references/craft.md` (edit), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] `app-screens.md` has the eight findings and both testing lessons, in the playbook's terms (`DESIGN.md` tokens, no Taste scripts)
- [ ] No file still names `717446e`
- [ ] `craft.md` and `app-screens.md` agree on KPIs and sparklines
- [ ] The source test fails if the new file's first-line comment or its licence row is removed

**Check:** `npm test`, `rg -n 717446e .`

### Step 2: Worst-case data and phone fixes
**Do:**
1. `quality-bar.md` "Real content": worst-case values come from the validation schema, column or API limit (or "unbounded", then long but believable); include the short cases; enter through the fixtures or props, never by editing markup; flag a form limit shorter than the column.
2. `quality-bar.md` "Dark mode and mobile": add the phone fixes listed in Changes, each in one line.
3. First-line comment on `quality-bar.md` naming emilkowalski/skills `2d22863` (`break-ui`, `mobile-native`) and the changes.
4. Add `licenses/emilkowalski-skills.LICENSE` and its `licenses/README.md` row.
5. Tests: the quality bar keeps the worst-case and phone rules; add `quality-bar.md` to the source test.

**Files:** `skills/frontend-ui-engineering/references/quality-bar.md` (edit), `licenses/emilkowalski-skills.LICENSE` (new), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The quality bar says where worst-case values come from and names the short cases
- [ ] The mobile section has 16px inputs, hover gating, `dvh`, tap delay and highlight, safe areas and overscroll
- [ ] The existing quality-bar test (motion inventory and waits) still passes

**Check:** `npm test`

### Step 3: Merge danger and evidence in PRs
**Do:**
1. `templates/pr-description.md`: an Evidence section (the test that failed before and passes now, or command output; screenshots stay in their table) and a Merge danger section (one-way or two-way door with a reason, blast radius in a few words), after Changes.
2. `workflows/push.md` step 6: name both sections; a migration, deleted data or a changed public API is a one-way door.
3. Tests: the template has both sections and push names them.

**Files:** `templates/pr-description.md` (edit), `workflows/push.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The template has Evidence and Merge danger with one-line guidance each
- [ ] Push says what counts as a one-way door
- [ ] The attribution test for PR descriptions still passes

**Check:** `npm test`

### Step 4: Grill in dependency order
**Do:**
1. `skills/plan/SKILL.md` 6.3: each round asks only questions whose prerequisites are answered, most consequential first among those; a question that depends on an open one waits for a later round.
2. 6.1: a fact the code, docs or tools can answer is looked up (in parallel with a subagent where the tool has one), never asked; only the questions that depend on it wait.
3. Tests: extend "/plan finds every question before asking any" with both phrases in order.

**Files:** `skills/plan/SKILL.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The grill orders rounds by dependency, then by consequence
- [ ] Facts are looked up, not asked, without blocking unrelated questions
- [ ] Rounds stay up to 3 per card (`rules/asking.md` unchanged)

**Check:** `npm test`

### Step 5: Assumptions and traceable changes
**Do:**
1. `templates/project-AGENTS.md` Always 9: "Stay in scope. Before a change, state your assumptions; if the request reads two ways, ask. Every changed line traces to the request. Note anything else and ask."
2. `skills/incremental-implementation/SKILL.md` scope discipline: the same "every changed line traces to the request" test.
3. Tests: Always 9 keeps all three parts, and the Always list still has 13 rules.

**Files:** `templates/project-AGENTS.md` (edit), `skills/incremental-implementation/SKILL.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] Always 9 has assumptions, two readings and traceable lines
- [ ] No rule numbers change, so "Always 4 and 9–13" and "Always 10" references stay right

**Check:** `npm test`, `rg -n 'Always [0-9]' rules workflows skills templates`

### Step 6: Docs and full check
**Do:**
1. `licenses/README.md`: mattpocock/skills (`5beb35b`) and forrestchang/andrej-karpathy-skills (`2c60614`) as "Referenced, not copied".
2. README credits paragraph: add emilkowalski/skills, mattpocock/skills and the Karpathy guidelines.
3. `CHANGELOG.md`: an "Unreleased" section listing the six changes. No version bump or tag.
4. Try it on the sample app (`sample/`, gitignored): copy the changed playbook files into its `.agents/`, review its dashboard against `app-screens.md` and its invoice list against the worst-case and phone rules at 1440×900 and 390×844, and report what each finds. Don't change the sample's app code.
5. Review the branch with `skills/code-review-and-quality/SKILL.md` and fix every Critical and Required finding.

**Files:** `licenses/README.md` (edit), `README.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [ ] Every new source has a `licenses/README.md` row with its commit
- [ ] The CHANGELOG lists all six changes under Unreleased
- [ ] The sample review lists what the new rules catch, with screenshots
- [ ] The review has no open Critical or Required finding, and the full suite, plan checks and ShellCheck pass

**Check:** `npm test`, `node tools/plan.mjs check plans/reel-ideas.md`, `shellcheck install.sh tools/plan-editor/install.sh`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| Plan | 2026-10-23 | Dry run | Dry run: 4 questions (Impeccable checker, /retro, gallery toggle, checkpoints), none left. |
