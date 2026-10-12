---
name: code-simplification
description: Simplifies code for clarity without changing behavior. Runs before a PR over the branch's changes, or on request. Use when code works but is harder to read, maintain or extend than it should be.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: a short pass before each PR, separate steps/commits instead of separate PRs, project conventions, language-agnostic examples, trimmed; layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/git.md` and `.agents/rules/repo-structure.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Code Simplification

> Inspired by the [Claude Code Simplifier plugin](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md).

Make code easier to read, change and debug while keeping its behaviour exactly the same. The goal is faster comprehension, not fewer lines. Test for each change: would someone new understand it faster than the original?

## When it runs

- **Before a PR:** a short pass over code changed on the branch (`git diff <base>...HEAD`), before tests and review (in the playbook, step 1 of the pre-PR check).
- **On request:** when the user asks, or acts on a review recommendation.

Don't simplify code that is already clean, code you don't yet understand, performance-critical code where the simpler version is measurably slower, or code outside the branch's changes unless asked.

## Before a PR

1. **Scope:** only code changed on the branch. Never tests, generated code (e.g. the OpenAPI client), migrations already applied anywhere, or config.
2. **One simplification at a time**, running the relevant tests after each.
3. **Commit what passes** separately from other work, e.g. `Simplify <area>` (one per area, or one for a small pass).
4. **If a test fails, revert** that simplification and move on. Simplification never blocks the PR.
5. **Keep it short:** a few minutes, never longer than the reviews. Only obvious, high-value changes. Judgement calls (restructuring UI data flow, splitting a module, changing a public interface) go in the report as suggestions, not applied.
6. **Run the full suite**, build and linter afterwards: all pass, no new warnings, tests unmodified.
7. **Report** what was simplified (commits) and what was reverted or only suggested.

## Rules

- **Preserve behaviour exactly:** same output for every input (including empty, null, zero), same errors, same side effects and ordering. If unsure, don't.
- **If a test needs changing, you changed behaviour.** Revert.
- **Never remove or weaken error handling** to make code look cleaner.
- **Follow project conventions,** not your preferences. Read agent instructions, rules and linter config; copy how neighbouring code handles imports, function style, naming, errors and type annotations. Don't rename things to suit your taste.
- **Clarity over cleverness.** A compact expression that needs a mental pause loses to explicit code.
- **Don't over-simplify:** don't inline a helper that names a concept, merge unrelated functions, remove the wrapper tests fake around an outside service, or chase line count.
- **Remove speculative abstractions** that nothing uses now.
- **Leave no dead code** behind (unused imports, unreachable branches).
- **Keep refactoring separate** from feature or bug-fix work: separate steps and commits. The diff contains only simplifications.
- **Rule of 500:** a refactor touching more than 500 lines uses automation (codemods, AST transforms, scripted replacements) and is its own piece of work (its own plan), not part of a pre-PR pass.

## Process

1. **Understand first (Chesterton's Fence).** Know the code's responsibility, its callers and callees, edge cases and error paths, the tests that define it, and why it was written this way (check git blame and the plan or issue). If you can't answer these, read more.
2. **Find opportunities:**
   - Nesting 3+ levels → guard clauses or helpers.
   - Functions 50+ lines with several jobs → split into named functions.
   - Nested ternaries → if/else, switch/match, or a lookup table.
   - Boolean flag params (`do_thing(true, false)`) → named options or separate functions.
   - Same check in several places → a named predicate.
   - Same 5+ lines in several places → a shared function.
   - Generic, abbreviated or misleading names → descriptive names (universal abbreviations like `id`, `url` are fine).
   - Comments saying *what* → delete. Comments saying *why* → keep.
   - Dead code, pass-through wrappers (unless tests fake them), one-strategy patterns, redundant casts → remove.
3. **Apply incrementally:** change, test, keep or revert. Never batch untested changes.
4. **Step back:** is the result genuinely easier to read, consistent with the codebase, and a clean diff a reviewer would approve? If not, revert.

For before/after examples of each pattern, read `references/patterns.md`.
