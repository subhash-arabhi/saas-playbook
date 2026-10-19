# Workflow: Build a plan

Trigger: **`/build [plans/<name>.md]`**. Follow every step in order.

## 1. Before starting
1. Open the plan and run `node .agents/tools/plan.mjs check <plan>`. If it fails, or `status` isn't `approved`, or **Open questions** isn't "None.", stop and tell the user.
2. Run `git status`. If there are unrelated uncommitted changes, stop and ask.
3. If you're on `main`, create the working branch (`.agents/rules/git.md`). Otherwise stay on the current working branch.
4. Read `ARCHITECTURE.md`, and `DESIGN.md` if the plan touches UI.
5. Set `status: building` in the front matter.

## 2. For each step, in order
Skip steps with `done: true` in the front matter, so the build can resume.
1. Read the step's **Do**, **Files**, **Done when** and **Check**. Read the rules for every area it touches (`AGENTS.md` → Areas).
2. Do exactly what **Do** says. **Scope:** change only the files in the step's **Files**, plus any other file the step clearly needs to work. Note each extra file in the step's Build log line: "Also changed: <file> (why)". Don't widen the step beyond its **Do**.
3. Add tests for the behaviour the step adds.
4. If the step changes UI, check it in a browser at desktop and mobile sizes (`.agents/rules/frontend.md`).
5. Run the **Check** commands. Fix and re-run until every **Done when** item is true, and:
   - it works at runtime, not just compiles; edge cases and error paths are handled
   - all existing tests, lint, format and type checks pass
   - no dead code, debug output or unrelated changes
   - new critical paths log and measure what's needed to tell they work (`observability-and-instrumentation` skill)
6. Update the plan: tick the step's **Done when** boxes, set its `done: true` in the front matter, and add one line to the **Build log** with its "Decided:" and "Also changed:" notes (ending with "checkpoint shown" if the step has `checkpoint: true`). Run `plan.mjs check` (it must pass).
7. Commit the step's work and the plan file together, in one commit: `Step N: <title>`. Nothing is edited after this commit, so `git status` is clean.

## 3. Checkpoints
If the finished step has **`checkpoint: true`** (set by the user), after its commit:
1. Show the user what the step built: what to open at localhost, and what changed. Open the plan (`.agents/rules/planning.md` → plan view).
2. Stop, and ask with the question tool (`.agents/rules/asking.md`): continue with the next step, or stop here to review.

If the user chooses to continue, carry on as if they ran `/build`; otherwise the next `/build` continues from the next step with `done: false`. Never change `checkpoint` yourself.

## 4. Run to the end
Every question was settled before approval (`.agents/rules/planning.md` → Settle everything before approval), so the build runs to the end. The user reviews what you decided once, in the final summary.

**Decide and log, then keep going:**
- A decision the plan doesn't cover: choose the option most consistent with the plan, **Changes** and the rules. Note it in the step's Build log line: "Decided: <what> (why)".
- An extra file the step needs: see **Scope** in section 2.
- An unclear detail: take the reading that fits the plan's **What we're building**, and note it as "Decided:".
- Work beyond the plan (a new feature, a refactor): don't do it. Note it as "Decided: not built: <what>" for a later plan.

**Stop and ask only when** (report what happened in chat, then ask with the question tool, offering the realistic ways forward):
1. The finished step has a checkpoint (section 3).
2. A risky action (`AGENTS.md` → Always 10: secrets, auth or permissions, payments, deleting data, destructive migrations, production) isn't covered by an `- **Approved: …:**` bullet in **Changes** that names exactly this action. A similar approval doesn't count.
3. A step's **Stop and ask if** condition is hit.
4. A check still fails after two genuinely different approaches. Report what fails, what you tried and your best theory.
5. There are unrelated uncommitted changes (section 1).

## 5. When all steps are done
1. Check the whole plan works end to end.
2. Update `ARCHITECTURE.md`, `README.md`, `.env.example` and the API contract for everything the plan changed, and bump "Last updated".
3. Set `status: done` in the front matter and run `plan.mjs check` (it must pass).
4. Commit the doc updates and the plan file together: `Update ARCHITECTURE.md`. `git status` is now clean.
5. Summarise: steps finished, commits, files changed, tests added, anything skipped or flagged. Then list every "Decided:" and "Also changed:" note from the Build log, by step, so the user can review them in one place. Open the plan.
6. Tell the user it's committed locally. Nothing is pushed until they say "push".
