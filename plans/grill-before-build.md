---
name: "Grill before build"
status: building
steps:
  - id: 1
    title: "Find and ask every question before approval"
    summary: "/plan does a dry run to list every question, asks them in rounds, repeats until none are left, and records approved risky actions"
    done: true
    checkpoint: false
  - id: 2
    title: "Build runs to the end"
    summary: "/build decides and logs small surprises and extra files, and stops only for checkpoints, unapproved risky actions and stuck checks"
    done: true
    checkpoint: false
  - id: 3
    title: "Tests, walk-through and docs"
    summary: "Tests for both workflows, a fixture walk-through, README and CHANGELOG"
    done: true
    checkpoint: false
---

# Plan: Grill before build

## What we're building
Before a plan is approved, the agent works out every question the build could need, by doing a dry run of each step, and asks them all. It repeats the dry run until none are left. Risky actions are approved up front and written into the plan. After approval, the build runs to the end: it decides and logs anything small the plan missed, and stops only for checkpoints, unapproved risky actions and checks it can't fix.

## Changes
- **Dry run before asking:** `/plan` walks every step as if building it, lists every point it would have to choose, guess or ask in Open questions, then asks them in rounds of up to 3, most consequential first.
- **Repeat until none left:** after the answers are written in, the dry run runs again; approval is offered only when it finds no questions. The build log's first line records "Dry run: N questions, none left".
- **Checklist:** the dry run covers goal and users, behaviour and edge cases, UI states, data and privacy, outside services and cost, risky actions, scope, how "done" is checked, and checkpoints.
- **Approved risky actions:** each one the steps need is asked during planning; an approved one becomes a Changes bullet `- **Approved: <action>:** <exactly what>`.
- **Build decides and logs:** an uncovered decision, an extra file a step needs, or an unclear detail gets the choice most consistent with the plan, logged as "Decided:" or "Also changed:" and listed in the final summary.
- **Build still stops:** for a checkpoint, a risky action without a matching `Approved:` bullet, a step's **Stop and ask if**, a check still failing after two different approaches, or unrelated uncommitted changes.

## Steps

### Step 1: Find and ask every question before approval
**Do:**
1. `skills/plan/SKILL.md`: add the dry run, the full list in Open questions, rounds of questions, the repeat and the build-log line between writing the draft and asking for approval.
2. `rules/planning.md`: a "Settle everything before approval" section with the checklist and the `Approved:` bullet rule.
3. `rules/asking.md`: allow consecutive rounds for the planning grill.
4. `skills/build/SKILL.md`: a draft is approved only after the grill has run.

**Files:** `skills/plan/SKILL.md` (edit), `rules/planning.md` (edit), `rules/asking.md` (edit), `skills/build/SKILL.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The plan skill finds every question before asking any, writes them all into Open questions, and repeats the dry run until none are left
- [x] The planning rule has the checklist and the `Approved:` rule

**Check:** `npm test`

### Step 2: Build runs to the end
**Do:**
1. `workflows/build-plan.md`: the scope rule changes and logs extra files; section 4 becomes "Decide and log" and "Stop and ask"; the final summary lists every "Decided:" and "Also changed:" line.
2. `skills/incremental-implementation/SKILL.md`: the same scope rule.
3. `templates/project-AGENTS.md`: Always 10 accepts risky actions approved in the plan.
4. `templates/plan.md`: an optional `Approved:` example bullet.

**Files:** `workflows/build-plan.md` (edit), `skills/incremental-implementation/SKILL.md` (edit), `templates/project-AGENTS.md` (edit), `templates/plan.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [x] The build stops only for the five listed reasons, and decides and logs everything else
- [x] A risky action counts as approved only with an `Approved:` bullet naming it exactly
- [x] The template still passes `plan.mjs check`

**Check:** `npm test`, `node tools/plan.mjs check templates/plan.md`

### Step 3: Tests, walk-through and docs
**Do:**
1. Tests in `tests/repo.test.mjs` for the plan skill, the planning and asking rules, and the build workflow.
2. Walk a fixture plan through both workflows: one risky action (a new secret), one extra file, an answer that raises a new question, and an unapproved destructive migration.
3. README `/plan` and `/build` rows, and a CHANGELOG entry.

**Files:** `tests/repo.test.mjs` (edit), `README.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [x] The tests fail if any part of the dry run, the rounds or the stop list is removed
- [x] The walk-through lists every question before the first card, the second dry run catches the new question, the build doesn't stop for the approved secret, logs the extra file, and stops for the migration
- [x] README and CHANGELOG describe the change

**Check:** `npm test`, `node tools/plan.mjs check`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| Plan | 2026-10-20 | Dry run | Dry run: 3 questions (risky actions, surprises, finding every question first), none left. |
| 1 | 2026-10-20 | Done | 62 tests (2 new, checking the dry-run phrases appear in order). A user's answer to the checkpoint question now counts as the user setting it. Added `tests/repo.test.mjs` to steps 1 and 2 so each step's behaviour is tested in its own commit. |
| 2 | 2026-10-20 | Done | 64 tests (2 new). Decided: work beyond the plan is logged as "Decided: not built" rather than asked. Also changed: `skills/debugging-and-error-recovery/SKILL.md` (its "no fixed attempt count" contradicted the two-approaches stop). |
| 3 | 2026-10-20 | Done | 65 tests (1 new walk-through test: an approved secret plan passes the checker, and no Approved: bullet names the migration). Removing any of 11 key phrases (dry run, rounds, repeat, stop list, summary, Always 10) fails a test. Walked a Stripe-checkout fixture by hand through the rules: plan skill 6.2 writes every question before 6.3's first card; an answer adding refunds is caught by the repeat dry run in 6.5; the build doesn't stop for the approved `STRIPE_SECRET_KEY`, logs an unlisted `lib/money.ts` as "Also changed:", and stops for an unapproved column drop under reason 2. The CHANGELOG's old "needs an approved plan edit" line is gone. |
