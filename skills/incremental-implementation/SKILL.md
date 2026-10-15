---
name: incremental-implementation
description: Delivers changes in thin, tested, committed steps. Use when building a plan step, implementing any change that touches more than one file, or when about to write a lot of code at once.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: slices = plan steps, tests in every step, language-agnostic, trimmed; layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/planning.md`, `.agents/rules/testing.md` and `.agents/rules/git.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Incremental Implementation

Build in thin steps: implement one piece, test it, verify it, commit it, move on. Never build a whole feature in one pass. Each step leaves the system working and tested.

- With a plan, the plan and its build process decide which step is next, when to stop and how to commit. This skill is how to do each step well.
- Without a plan, apply the same discipline in small steps.
- Skip it for single-file, single-function changes that are already minimal.

## The step cycle

1. **Implement** the smallest complete piece (in a plan, the step's **Do**). Never write more than ~100 lines before running tests.
2. **Test:** add tests for the behaviour this step adds, in the same step. Test-first is optional.
3. **Verify** with the repository's own commands: tests (new and existing), build, type check and lint where the stack has them. Repeat until the acceptance criteria are met (in a plan, its **Check**, until every **Done when** item is true).
4. **Commit:** one commit per step, short imperative message saying what changed (e.g. `Add project creation endpoint`), in the project's commit format if it has one.
5. **Next step:** carry forward, don't restart.

Run a check again only after code it covers has changed. Re-running on unchanged code adds nothing.

## Slicing

- **Vertical (preferred):** each step is one complete path through the stack (e.g. "create a task: DB + API + UI", then "list tasks", then "edit", then "delete"), working end to end.
- **Contract-first,** when frontend and API are built separately: define schemas and spec → API with tests → frontend against the contract → connect and verify end to end.
- **Risk-first:** do the most uncertain piece first (e.g. prove the real-time connection) so failure shows up before you invest in the rest.

## Rules

**Simplest thing that works.** Ask before coding; check after:
- Could it be fewer lines? Does each abstraction earn its complexity?
- Are you building for the current step or a hypothetical future?
- One function call beats an event bus for one notification; two components beat an abstract factory; three forms beat a form builder.
- Three similar lines beat a premature abstraction. Don't abstract before the third use. Don't create utility files for one-time operations.
- Write the naive, obviously correct version first. Optimize only after tests prove it correct.

**Scope discipline.** Touch only what the step needs. In a plan, change only the files in the step's **Files**; if another file must change, stop and propose a plan edit that adds it, and continue once the user approves. Without a plan, if a change elsewhere is clearly needed, make it and say so. Don't clean up adjacent code, reorder imports in files you aren't changing, remove comments you don't understand, add features not in the step, or modernize syntax in files you only read. Note anything else worth fixing and ask:

```text
NOTICED BUT NOT TOUCHING:
- utils/format has an unused import (unrelated to this step)
→ Add to the plan or a follow-up task, or leave it?
```

**One thing per step.** Don't mix a new component, a refactor of another and a build config change; make them three steps and three commits. Keep refactors separate from features.

**Keep it working.** After every step the project builds and all tests pass. Don't let large uncommitted changes pile up.

**Safe defaults.** New optional side effects are off unless asked for (e.g. `notify = false`); new permissions are denied unless granted.

**Rollback-friendly.** Each step can be reverted on its own:
- Prefer additive changes (new files, new functions).
- Keep edits to existing code minimal and focused.
- Give database migrations a matching rollback migration.
- Don't delete something and add its replacement in the same step.

## When all steps are done

The full suite passes, the build is clean, the feature works end to end as the plan or task describes, and nothing is left uncommitted. Nothing is pushed unless the user asked.
