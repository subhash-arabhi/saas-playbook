---
name: "Flow document"
status: done
steps:
  - id: 1
    title: "Add the flow-document skill"
    summary: "skills/flow-document/SKILL.md from the handover, with installed paths and the repo as the default place for the page, tested"
    done: true
    checkpoint: false
  - id: 2
    title: "Add the flow page template"
    summary: "templates/flow-document.html: no tool-specific tags, a valid document, a made-up example, tested and checked in a browser"
    done: true
    checkpoint: false
  - id: 3
    title: "/flow-document command and docs area"
    summary: "A /flow-document row in Commands and flow-document in the docs row of Areas in templates/project-AGENTS.md, tested"
    done: true
    checkpoint: false
  - id: 4
    title: "Build keeps the flow document current"
    summary: "build-plan.md section 5 updates docs/flow/flow.json and renders it again when a plan changed a journey, tested"
    done: true
    checkpoint: false
  - id: 5
    title: "Installer check, README and CHANGELOG"
    summary: "An installer test that flow-document lands in playbook.json, the README skills list and counts, and a CHANGELOG entry"
    done: true
    checkpoint: false
  - id: 6
    title: "Prepare release v1.1.0"
    summary: "Bump package.json to 1.1.0 and turn CHANGELOG's Unreleased section into v1.1.0; the tag waits until this branch is on main"
    done: true
    checkpoint: false
---

# Plan: Flow document

## What we're building
Projects get a `flow-document` skill. It maps a product's user journeys into a tree of numbered steps with branches, fills each step with its real input, output and processing steps, and gives the time and cost of each. It renders the result as one HTML page from a template that draws everything from a JSON block, so a project supplies only data. Users run it with `/flow-document`, the docs area points to it, and the build keeps the page current when a plan changes a journey.

## Changes
- **flow-document skill:** `skills/flow-document/SKILL.md` from the handover, with all five of its rules kept: real examples only, estimates labelled, no mixing of measurements from before and after a provider change, queue time disclosed, no private values.
- **Installed paths:** the skill names the template as `.agents/templates/flow-document.html`. Project files stay as they are (`ARCHITECTURE.md`, `docs/flow/flow.json`).
- **The page lives in the repo by default:** `docs/flow/index.html` and `docs/flow/flow.json`, committed with the plan's next commit; somewhere else only if the user asks. No "published page" that only one agent has.
- **Page template:** `templates/flow-document.html` from the handover, installed to `.agents/templates/`, without the `claude:viewport-fit-sides` meta tag and with `<!doctype html>` and `<html lang="en">`.
- **Made-up example:** the template's real product-research example becomes a made-up product in the same shape (4 steps, 2 branches), marked as made up.
- **playbook.json:** no hand edit. `install.sh` writes the skill list from `skills/` and the file checksums from what it copies, so HANDOVER.md's step 2 happens automatically. A test proves it.
- **/flow-document command:** a `/flow-document [journey]` row in the Commands table of `templates/project-AGENTS.md`, with the description HANDOVER.md gives. The skill folder is the command, so no extra skill.
- **Docs area:** `flow-document` added to the Skills column of the "Docs, `.env.example`, private values" row.
- **Build keeps it current:** one line in `workflows/build-plan.md` → "When all steps are done": if `docs/flow/flow.json` exists, update the steps the plan changed (`flow-document` skill).
- **Docs:** README Skills table row and skill counts, and a CHANGELOG bullet.
- **Release v1.1.0:** `package.json` version 1.1.0 and a `## v1.1.0 (2026-10-21)` CHANGELOG section holding everything now under Unreleased (new features, so a minor bump).
- **Approved: release tag:** tag `v1.1.0` on `main` once this branch is merged there. Not done in this build: the branch must reach `main` through push and a PR first, and nothing is pushed unasked.

## Steps

### Step 1: Add the flow-document skill
**Do:**
1. Copy the handover's `SKILL.md` to `skills/flow-document/SKILL.md`. Its front matter already passes the spec (`name: flow-document`, quoted description, `metadata.internal: false`).
2. Change `templates/flow-document.html` to `.agents/templates/flow-document.html` (the intro and section 7).
3. Section 1 question 4 and section 9: the default is a file in the repo (`docs/flow/index.html` with `docs/flow/flow.json`), opened in a browser; another place only if the user asks.
4. Leave every other rule, the schema, the two SQL queries and the pitfalls as they are.
5. Tests in `tests/repo.test.mjs`: the skill names `.agents/templates/flow-document.html`, defaults to `docs/flow/`, and keeps the five rules HANDOVER.md lists and "continues at step N".

**Files:** `skills/flow-document/SKILL.md` (new), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The existing front-matter, link and 500-line tests pass for the new skill
- [x] No playbook path in the skill lacks its `.agents/` prefix, and it never mentions a published page
- [x] A test fails if any of the five rules, the template path or the `docs/flow/` default is removed

**Check:** `npm test`

### Step 2: Add the flow page template
**Do:**
1. Copy `flow-document.html` to `templates/flow-document.html`.
2. Remove `<meta name="claude:viewport-fit-sides" …>`; add `<!doctype html>` and `<html lang="en">` at the top. Keep the Google Fonts link: system fonts are the fallback, and the skill's section 7 swaps fonts for `DESIGN.md`'s.
3. Replace the example with a made-up product in the same shape (4 steps, 2 branches), using no real store, provider or model names, and say in the template's comment and the example's footer that it's made up.
4. Tests: the JSON in `<script id="flow-data">` parses; every node has `id`, `title` and `summary`; ids are lowercase-hyphenated and unique; branches go at most two levels deep; every step `kind` is AI, EXT, CODE or USER; the file names no coding tool.
5. Open it in a browser at 1280 px and 375 px, light and dark: no console errors, no sideways scrolling, Open all and Close all work, a branch's `#id` opens it and its parent, and `"audience": "outside"` hides triggers and cost chips.

**Files:** `templates/flow-document.html` (new), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The template is a valid HTML document with no tool-specific tags
- [x] The example names no real product, store, provider or model, and says it's made up
- [x] The schema test passes, and fails on a third branch level or an unknown kind
- [x] Every browser check passes at both widths and in both themes

**Check:** `npm test`, the template opened in a browser at 1280 px and 375 px

### Step 3: /flow-document command and docs area
**Do:**
1. `templates/project-AGENTS.md` → Commands: `| /flow-document [journey] | Writes or updates the product's flow document: the user journey as a tree, each step with how it works, input, output, time and cost |`. Keep every placeholder.
2. Areas: add `flow-document` to the Skills column of the "Docs, `.env.example`, private values" row.
3. Tests: the row and the docs entry exist; every command in the table and every skill named in the Areas table has a folder in `skills/`.

**Files:** `templates/project-AGENTS.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] `/flow-document` is in the Commands table and resolves to `skills/flow-document/`
- [x] The docs row names `flow-document`
- [x] A test fails if either is removed, or if the template names a skill that doesn't exist

**Check:** `npm test`

### Step 4: Build keeps the flow document current
**Do:**
1. `workflows/build-plan.md` → "5. When all steps are done", after the `ARCHITECTURE.md` item: "If the project has a flow document (`docs/flow/flow.json`), update the steps this plan changed (`.agents/skills/flow-document/SKILL.md`), render it again, and commit it with the doc updates."
2. Test that the line is there.

**Files:** `workflows/build-plan.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] Section 5 updates the flow document only when `docs/flow/flow.json` exists
- [x] A test fails if the line is removed

**Check:** `npm test`

### Step 5: Installer check, README and CHANGELOG
**Do:**
1. `tests/installer.test.mjs`: after an install, `.agents/playbook.json` lists `flow-document` in `skills` and records `skills/flow-document/SKILL.md` and `templates/flow-document.html` in `files`.
2. README: a `flow-document` row in the Skills table, `/flow-document` wherever the commands are listed, and skill counts that match `skills/`.
3. CHANGELOG "Unreleased": one bullet for the skill, the template, `/flow-document` and the build update.

**Files:** `tests/installer.test.mjs` (edit), `README.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [x] The installer test passes
- [x] README lists the skill and its counts match `skills/`
- [x] CHANGELOG has the entry

**Check:** `npm test`, `shellcheck install.sh tools/plan-editor/install.sh`

### Step 6: Prepare release v1.1.0
**Do:**
1. `package.json`: `version` 1.1.0.
2. `CHANGELOG.md`: rename `## Unreleased` to `## v1.1.0 (2026-10-21)`, the heading the release workflow reads.
3. Don't tag: the tag goes on `main` after this branch is merged (Approved: release tag).

**Files:** `package.json` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [x] `package.json` says 1.1.0 and CHANGELOG has a `## v1.1.0` section with every former Unreleased bullet
- [x] The release workflow's notes command finds the section

**Check:** `npm test`, `awk -v v="## v1.1.0" 'index($0, v) == 1 { found = 1; next } /^## / { found = 0 } found' CHANGELOG.md`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| Plan | 2026-10-21 | Dry run | Dry run: 8 questions (the handover files, how the command maps to the skill, where the page goes, the example data, the build update, release, checkpoints, the branch), none left. Local `main` fast-forwarded to `origin/main` (every work branch was already on it); building on `work/2026-10-21-flow-document`. |
| 1 | 2026-10-21 | Done | 76 tests (1 new). Decided: section 9 is now "Save and keep it current" and section 8 ends "then save it", so the skill never mentions publishing. The new test fails on the handover's original text (two bare `templates/` paths, "published page"). Known: `plan-open.test.mjs` fails in the full parallel run when ports 4600–4609 are busy with local plan viewers; it passes alone and predates this plan. |
| 2 | 2026-10-21 | Done | 3 new tests (template header, tool names and schema; the schema check catches a third branch level and an unknown kind). The example is "Receipt Desk": 4 steps, 2 branches, placeholders like `<store>` in place of values, every number an estimate. Checked in a browser at 1280 px light and 375 px dark: no sideways scrolling, Open all and Close all work, `#emailed-receipt` and `#export-rejected` open with their parents, and `"audience": "outside"` hides every trigger and cost. Decided: the tool-name test skips the CSS property `cursor:`. |
| 3 | 2026-10-21 | Done | 1 new test: it reads all 7 commands and every skill in the Areas table, and fails if any has no `skills/<name>/SKILL.md` or if `/flow-document` or its docs entry is removed. |
| 4 | 2026-10-21 | Done | 1 new test, which also checks section 5 stays numbered in order. Decided: the flow document is its own item 3 rather than a sentence inside the `ARCHITECTURE.md` item, and the commit item names it, so it goes into the same `Update ARCHITECTURE.md` commit. |
| 5 | 2026-10-21 | Done | 81 tests (1 new installer test), ShellCheck clean. The only failure is the known `plan-open.test.mjs` port test in the full parallel run; it passes alone and with the installer tests. Decided: README keeps "Six commands drive the whole lifecycle" and gives `/flow-document` its own line under the commands table, since it isn't a lifecycle stage; the `templates/` row names the flow page. |
| 6 | 2026-10-21 | Done | `package.json` 1.1.0; `## Unreleased` is now `## v1.1.0 (2026-10-21)`. The release workflow's notes command finds the section (17 bullets) and its version check matches `v1.1.0`. Not tagged: the tag goes on `main` after this branch is merged. |
| End | 2026-10-21 | Done | 6 steps, 81 tests (7 new), ShellCheck clean, every plan passes the checker. Built without stopping: four Decided notes (steps 1, 2, 4, 5), no Also changed. Remaining: push, merge to `main`, then tag `v1.1.0` there. |
