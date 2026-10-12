---
name: code-review-and-quality
description: Conducts multi-axis code review (correctness, readability, architecture, security, performance). Use before merging any change, when reviewing code from yourself, another agent or a human, or when asked to review a diff or pull request, even one pasted inline.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: plan-based context, commit-by-commit review, solo-dev adaptations, language-agnostic, trimmed; layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/git.md` and `.agents/rules/testing.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Code Review and Quality

Every change is reviewed before merge. AI-written code gets more scrutiny, not less. **Approve when the change clearly improves code health and follows project conventions**, even if it isn't how you'd write it.

## Process

1. **Context.** What is the change for? Read the plan step, spec or issue and its acceptance criteria (in a plan, each step's "Done when").
2. **Tests first.** Do tests exist, test behaviour (not implementation), cover edge cases, have descriptive names, and catch a regression? A bug fix must include a regression test. For critical logic (auth, money, permissions, data deletion), prove it: invert one condition the change adds, run the suite, restore the file from a copy. A mutation that stays green is a finding: name the missing test case.
3. **Implementation**, file by file, on the five axes below. Review a large PR commit by commit.
4. **Label and order findings** (table below). Correctness and security first, then structural regressions and missed simplifications, then the rest. A few high-conviction comments beat a long list.
5. **Check the verification story:** which tests ran, build passed, manual check done, screenshots or before/after for UI changes.

## The five axes

**1. Correctness:** matches the spec; edge cases (null, empty, boundaries); error paths; off-by-one, race conditions, inconsistent state; tests test the right thing.

**2. Readability and simplicity**
- Descriptive names in project style (no bare `data`, `temp`, `result`).
- Straightforward control flow: no nested ternaries, deep callbacks or clever tricks.
- Could it be far shorter? Abstractions must earn their place; don't generalize before the third use.
- Comments explain non-obvious intent only.
- No dead artifacts: `_unused` variables, compat shims, `// removed` comments.
- A new conditional bolted onto an unrelated flow is a design problem, not a nit. Repeated conditionals on the same shape mean a missing model or dispatcher.

**3. Architecture**
- Follows existing patterns; a new pattern must be justified.
- Clean module boundaries, no circular dependencies, no duplication that should be shared.
- Does a refactor reduce complexity or just move it? Count the concepts a reader must hold. Prefer changes that make branches, modes or layers disappear; prefer deleting an abstraction to polishing it.
- Feature logic stays in its owning module, not a shared one. Reuse the canonical helper, not a near-duplicate.
- Explicit type boundaries: question loose catch-all types, unchecked casts, needless optionals, silent fallbacks hiding an unclear invariant.

**4. Security (quick pass;** deep review is separate: the `security-and-hardening` skill if installed). Flag unvalidated input, secrets in code or logs, missing auth checks, unparameterized SQL, unencoded output (XSS), untrusted dependencies, and external data (APIs, logs, user content, config) used without boundary validation.

**5. Performance.** N+1 queries, unbounded loops or fetches, sync work that should be async, needless re-renders or recomputation, unpaginated lists, large objects in hot paths. Measure before claiming a non-obvious slowdown.

## Propose the fix, not just the problem

Name a restructuring: replace a conditional chain with a typed model or dispatcher; collapse duplicate branches; separate orchestration from business logic; move feature logic to its owning module; reuse the canonical helper; make a type boundary explicit; delete a pass-through wrapper; extract a helper or split a large file. Prefer the remedy that removes moving pieces.

**Presumptive blockers:** surface and propose the simpler design for each; escalate to Required only when the change actively makes structure worse: a refactor that relocates complexity; a file pushed past the size boundary with no decomposition; feature logic in a shared module; a near-duplicate of a canonical helper; a silent fallback hiding an unclear invariant.

## Severity labels

| Prefix | Meaning |
|---|---|
| **Critical:** | Blocks merge: security hole, data loss, broken functionality |
| *(none)* | Required: fix before merge, or the user explicitly accepts or defers it |
| **Optional:** / **Consider:** | Suggestion |
| **Nit:** | Minor style; author may ignore |
| **FYI** | Context only |

## Change size and descriptions

- One commit = one testable chunk (one plan step). Refactors and behaviour changes go in separate commits; small renames can ride along.
- Over ~1000 changed lines: say so in the PR description and review commit by commit. Whole-file deletions and automated refactors may be large.
- ~1000 total lines in one file is a signal. If a change materially grows a large file, decompose first, then add.
- Commit first line: short, imperative, standalone ("Delete the FizzBuzz RPC"); a `Step N:` prefix is fine if the rest describes the change. Body: what and why, context not in the code, known shortcomings. Never "Fix bug", "Phase 1", "Moving code".

## Dead code

After a refactor, list code that is now unused or unreachable and ask before deleting: "Should I remove these now-unused elements: [list]?"

## Dependencies

Prefer the standard library and existing utilities. When a change adds or upgrades a dependency, read `references/dependencies.md`.

## Conduct and final say

- No rubber-stamp "LGTM". Don't soften real bugs. Quantify ("adds ~50ms per item"). Push back on clear problems with alternatives.
- Comment on code, not people. If the author has full context and disagrees, defer.
- Facts beat opinions; project conventions settle style unless they harm code health.
- The user makes the final call on anything not Critical. Deferred work needs a record (plan or issue), not "I'll clean it up later".
- Done when: all Critical resolved, all Required resolved or explicitly accepted/deferred by the user, tests and build pass.

For a written review or a prompt to a second reviewer model, use `references/review-template.md`.
