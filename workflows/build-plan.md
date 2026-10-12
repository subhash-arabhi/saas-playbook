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
2. Do exactly what **Do** says. Touch only the listed files; if another must change, note it in the build log.
3. Add tests for the behaviour the step adds.
4. If the step changes UI, check it in a browser at desktop and mobile sizes (`.agents/rules/frontend.md`).
5. Run the **Check** commands. Fix and re-run until every **Done when** item is true, and:
   - it works at runtime, not just compiles; edge cases and error paths are handled
   - all existing tests, lint, format and type checks pass
   - no dead code, debug output or unrelated changes
   - new critical paths log and measure what's needed to tell they work (`observability-and-instrumentation` skill)
6. Tick the step's **Done when** boxes, set its `done: true` in the front matter, add one line to the **Build log**, and run `plan.mjs check` (it must pass).
7. Commit the step, including the plan file: `Step N: <title>`.

## 3. Checkpoints
If the finished step has **`checkpoint: true`** (set by the user):
1. Commit the step as usual.
2. Show the user what the step built: what to open at localhost, and what changed.
3. Add "checkpoint shown" to its Build log line.
4. Stop.

The next `/build` continues from the next step with `done: false`. Never change `checkpoint` yourself.

## 4. Stop and ask the user when
- A check keeps failing and you're going in circles. Report what fails, what you tried and your best theory.
- A step is unclear, or needs a decision the plan doesn't cover.
- A step's **Stop and ask if** condition is hit.
- The work touches secrets, auth or permissions, payments, deleting data, destructive migrations, or production.
- Something outside the plan seems needed. Propose a plan edit; don't do it.

## 5. When all steps are done
1. Check the whole plan works end to end. Update `ARCHITECTURE.md`, `README.md`, `.env.example` and the API contract for everything the plan changed, and bump "Last updated". Commit `Update ARCHITECTURE.md`.
2. Set `status: done` in the front matter and run `plan.mjs check`.
3. Summarise: steps finished, commits, files changed, tests added, anything skipped or flagged.
4. Tell the user it's committed locally. Nothing is pushed until they say "push".
