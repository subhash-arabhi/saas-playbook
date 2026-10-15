---
name: "Critical fixes from the lifecycle audit"
status: building
steps:
  - id: 1
    title: "Self-tests and CI"
    summary: "Add a dependency-free test suite and a CI workflow so every later fix is checked automatically"
    done: true
    checkpoint: false
  - id: 2
    title: "Plan approval and template"
    summary: "Approve plans only when Open questions is exactly None., and make the shipped template pass the checker"
    done: true
    checkpoint: false
  - id: 3
    title: "Build workflow commit order"
    summary: "Commit all plan state with each step so a build never ends with a dirty plan file"
    done: true
    checkpoint: false
  - id: 4
    title: "Deploy only the reviewed commit"
    summary: "No edits after the pre-PR check, prerequisites in the PR, revert on failure, compatible migrations"
    done: true
    checkpoint: false
  - id: 5
    title: "Installer ownership guard"
    summary: "Delete only files the playbook installed, back up local edits, and stop on unmanaged or colliding content"
    done: true
    checkpoint: false
  - id: 6
    title: "Separate maintainer and project AGENTS.md"
    summary: "Move the project template out of the root so agents working on the playbook get correct instructions"
    done: true
    checkpoint: false
  - id: 7
    title: "Safe fresh-clone bootstrap"
    summary: "Ask before remote install and verify a content checksum so a moved tag can't change what runs"
    done: false
    checkpoint: false
  - id: 8
    title: "Consistent Playwright safety guidance"
    summary: "Remove vendored examples that contradict the playbook's install, credential and browser rules, with a test"
    done: false
    checkpoint: false
  - id: 9
    title: "Repository governance and releases"
    summary: "Security policy, dependency updates, attested GitHub Releases with checksums, VSIX allowlist, protected main"
    done: false
    checkpoint: false
  - id: 10
    title: "Privacy decisions during planning"
    summary: "Record personal data purpose, retention and deletion when it's added, not first at publish"
    done: false
    checkpoint: false
  - id: 11
    title: "README claims match the playbook"
    summary: "Full-lifecycle coverage table, stated platform assumptions, a checked agent compatibility table and the missing images"
    done: false
    checkpoint: false
---
# Plan: Critical fixes from the lifecycle audit

## What we're building
Fix the critical and high-impact issues from the lifecycle audit so the playbook's own safeguards actually hold: tested, CI-checked tooling; workflows that never leave state uncommitted or deploy unreviewed changes; a safe installer and bootstrap; and browser-safety guidance that doesn't contradict itself. It also moves privacy decisions into planning and makes the README show, stage by stage, how much of the SaaS lifecycle is covered today. The missing lifecycle areas (billing and entitlements, SLOs and incidents, disaster recovery, analytics, support, GTM, sunset) are follow-up plans after this one.

## Changes
- **Self-tests and CI:** `node:test` suites for the installer, plan tools, plan viewer, skill metadata and links; `npm test`; a CI workflow with ShellCheck, Gitleaks, Semgrep and a package check.
- **Plan approval:** approval and non-draft statuses require Open questions to be exactly "None."; the shipped template passes `plan.mjs check`.
- **Build workflow:** every plan update is in the step's single commit; `status: done` is committed with the final docs; one scope rule for unlisted files.
- **Deploy workflow:** deploys only the reviewed SHA, stops before merge when prerequisites aren't in the PR, opens a revert PR on failure, and requires backward-compatible migrations.
- **Installer:** records installed files with hashes, deletes only those, backs up locally edited files, and stops on unmanaged `.agents/` content or skill-name collisions.
- **Project AGENTS.md template:** moves to `templates/project-AGENTS.md`; the root `AGENTS.md` becomes maintainer instructions for this repo.
- **Bootstrap:** the agent asks before running the remote install on a fresh clone; the installer verifies a content checksum per version.
- **Playwright guidance:** pinned project install, test-account-only auth state, no attaching to everyday browsers, no skips; a test blocks regressions; changes recorded in `licenses/README.md`.
- **Governance and releases:** `SECURITY.md`, Dependabot for Actions, tag-triggered GitHub Releases with tarball, SHA-256 and provenance, `CHANGELOG.md`, VSIX `files` allowlist, protected `main`.
- **Privacy timing:** personal data, new vendors and analytics get purpose, retention and deletion recorded in `ARCHITECTURE.md` when added; publish keeps legal pages and sign-off.
- **README:** keeps the full-lifecycle positioning with a coverage table per lifecycle stage, platform assumptions spelled out, an agent compatibility table, and the two plan-view images.

## Steps

### Step 1: Self-tests and CI
**Do:**
1. Add `node:test` suites with no dependencies: installer (fresh install, path with spaces, `--commit` / `--no-commit`, update keeps project skills and `AGENTS.md`), plan core (parse, check, approve, checkpoint, version conflict), plan viewer HTTP API (list, load, edit, path traversal), skill metadata against the Agent Skills spec, and local Markdown links outside code fences.
2. Extend the existing `npm test` (`node --test tests/*.test.mjs`, which already runs `tests/plan-open.test.mjs` and `tests/plan-hook.test.mjs`) with these suites.
3. Add `.github/workflows/ci.yml`: `npm test`, ShellCheck, Gitleaks, Semgrep and `npm pack --dry-run` on Ubuntu and macOS for supported Node versions, with every action pinned by commit SHA.
4. Fix anything ShellCheck reports in the two shell scripts.

**Files:** `tests/installer.test.mjs` (new), `tests/plan.test.mjs` (new), `tests/plan-viewer.test.mjs` (new), `tests/repo.test.mjs` (new), `package.json` (edit), `.github/workflows/ci.yml` (new), `install.sh` (edit), `tools/plan-editor/install.sh` (edit)

**Done when:**
- [x] `npm test` passes locally and covers each area in Do 1
- [x] ShellCheck reports no errors for both shell scripts
- [x] `actionlint` accepts `ci.yml`, and every command it runs passes locally

**Check:** `npm test`, `shellcheck install.sh tools/plan-editor/install.sh`, `actionlint .github/workflows/ci.yml`

**Stop and ask if:** a ShellCheck fix would change installer behaviour.

### Step 2: Plan approval and template
**Do:**
1. In `tools/plan.mjs`, treat Open questions as resolved only when its text, ignoring HTML comments and surrounding whitespace, is exactly `None.`. Use this for `canApprove` and for the check on `approved`, `building` and `done` plans.
2. Make `templates/plan.md` pass `plan.mjs check` by giving Step 2 the same full structure as Step 1.
3. In `rules/planning.md`, say text values use double quotes, and `status`, numbers and booleans don't (matching the template and the checker's output).
4. Add regression tests: a prose question, a bullet, a numbered item, a comment-only section, `None.`, and the template file itself.

**Files:** `tools/plan.mjs` (edit), `templates/plan.md` (edit), `rules/planning.md` (edit), `tests/plan.test.mjs` (edit)

**Done when:**
- [x] A plan whose Open questions is "Which provider should we choose?" can't be approved, and fails check when its status isn't `draft`
- [x] `node tools/plan.mjs check templates/plan.md` reports no errors
- [x] The new regression tests pass

**Check:** `npm test`, `node tools/plan.mjs check templates/plan.md`

### Step 3: Build workflow commit order
**Do:**
1. In `workflows/build-plan.md`, make step 6 write every plan update (ticks, `done: true`, the build-log line, and "checkpoint shown" when the step has a checkpoint) before the step's single commit. Remove the second commit and the post-commit log edit from the Checkpoints section.
2. In "When all steps are done", set `status: done` and run `plan.mjs check` before the final commit, and commit it together with the `ARCHITECTURE.md`, `README.md`, `.env.example` and API contract updates.
3. Replace the two conflicting scope rules with one: a file outside the step's **Files** needs a plan edit the user approves. State it the same way in `skills/incremental-implementation/SKILL.md`.

**Files:** `workflows/build-plan.md` (edit), `skills/incremental-implementation/SKILL.md` (edit)

**Done when:**
- [x] Following the workflow on a two-step fixture plan with a checkpoint on step 1 leaves `git status --porcelain` empty at the checkpoint and at the end
- [x] The plan file in the last commit matches the reported state (done flags, build log, status)
- [x] The scope rule appears once in the workflow and matches the skill

**Check:** walk a fixture project through `/build` twice (stop at the checkpoint, then finish) and run `git status --porcelain` after each run

### Step 4: Deploy only the reviewed commit
**Do:**
1. In `workflows/deploy.md`, before merging, check that everything the deploy needs is already in the PR: the budget in `infra/`, new setting and secret keys in `.env.example`, and new resources in `infra/`. If anything is missing, stop, list it, and tell the user to add it in a step and "push" again.
2. Remove every edit of committed files after the merge. Resource names and URLs created by the deploy go only into `.env.local`; any committed key or doc update goes into the next PR.
3. Before deploying, record the reviewed SHA, the previous image tags and the current schema version. Deploy exactly that SHA.
4. If the smoke check fails: roll back to the previous image tags, open a revert PR for the merge, and report. Local to production stays the default; no staging environment is added.
5. In `rules/deployment.md` and `rules/database.md`, require migrations to work with both the running and the new version (expand, deploy, then contract in a later deploy). Data-destroying migrations ship in a later deploy and need the user's OK.

**Files:** `workflows/deploy.md` (edit), `rules/deployment.md` (edit), `rules/database.md` (edit), `skills/deploy/SKILL.md` (edit)

**Done when:**
- [x] No step after the pre-PR check edits a committed file
- [x] A first deploy with no budget stops before the merge and lists exactly what to add
- [x] A failed smoke check ends with rolled-back images and an open revert PR
- [x] The expand/contract migration rule is in both `deployment.md` and `database.md`

**Check:** re-read `deploy.md` end to end against two scenarios (first deploy without a budget; a failed smoke check) and confirm each ends in the state above; confirm no step after "Merge" writes to tracked files

### Step 5: Installer ownership guard
**Do:**
1. Record every installed playbook file with its SHA-256 in `.agents/playbook.json` (using `shasum -a 256` or `sha256sum`, whichever exists).
2. On update, delete only the files listed there. If a listed file's hash has changed (a local edit), copy it to `.agents/.backup/<timestamp>/` first and say so.
3. If `.agents/` contains any of the playbook's folders but no `playbook.json`, stop without deleting anything, unless `--force` is given, which backs up first.
4. If a playbook skill name matches an existing skill folder that `playbook.json` doesn't list, stop and name it.
5. Add tests for each case and keep the existing installer tests passing.

**Files:** `install.sh` (edit), `tests/installer.test.mjs` (edit), `README.md` (edit, Install section)

**Done when:**
- [x] Installing into a repo with an unmanaged `.agents/rules/` stops and deletes nothing
- [x] A locally edited playbook file is backed up before it's replaced
- [x] A colliding project skill stops the install with its name
- [x] All installer tests pass on macOS and Linux

**Check:** `npm test`

**Stop and ask if:** an upgrade from v1.0.x installs can't be handled without `--force`.

### Step 6: Separate maintainer and project AGENTS.md
**Do:**
1. Move the project template from the root `AGENTS.md` to `templates/project-AGENTS.md`. It must not be named `AGENTS.md`, because agents apply nested `AGENTS.md` files inside `.agents/templates/`.
2. Make the installer copy `templates/project-AGENTS.md` to the project's `AGENTS.md`, and compare against it when writing `AGENTS.playbook.md`.
3. Rewrite the root `AGENTS.md` as maintainer instructions for this repo: run `npm test`, how releases work, rules for vendored content and licenses, no AI attribution.
4. Update README "What's inside" and the installer tests.

**Files:** `AGENTS.md` (rewrite), `templates/project-AGENTS.md` (new), `install.sh` (edit), `README.md` (edit), `tests/installer.test.mjs` (edit)

**Done when:**
- [x] A fresh install produces the same project `AGENTS.md` content as v1.0.2
- [x] The root `AGENTS.md` has no project placeholders and describes maintaining the playbook
- [x] No file named `AGENTS.md` is installed under `.agents/`
- [x] Installer tests pass

**Check:** `npm test`

### Step 7: Safe fresh-clone bootstrap
**Do:**
1. In `templates/project-AGENTS.md` → Setup, have the agent show the pinned install command from `playbook.json` and ask the user before running it.
2. Have the installer compute a content checksum over the playbook files it installs and store it with the version in `playbook.json`.
3. When the installed version equals the source version but the checksum differs (a moved or altered tag), stop with an explanation unless `--force` is given. Installing a different version records the new checksum.
4. Document deliberate updates in the README.

**Files:** `templates/project-AGENTS.md` (edit), `install.sh` (edit), `README.md` (edit), `tests/installer.test.mjs` (edit)

**Done when:**
- [ ] The Setup instruction tells the agent to ask before running the remote install
- [ ] Reinstalling the same version from altered source content stops with an explanation
- [ ] Updating to a new version records the new checksum
- [ ] Tests cover both installer cases

**Check:** `npm test`

### Step 8: Consistent Playwright safety guidance
**Do:**
1. In `skills/playwright-cli/SKILL.md`, replace the global `@latest` install with the project's pinned dev dependency run through `npx`, and move one section to `references/` so the file is under 500 lines.
2. In `references/storage-state.md`, keep auth-state reuse only for project test accounts with gitignored state files, and remove the cookie-injection roundtrip.
3. Remove the attach-to-a-running-browser sections from `references/session-management.md`.
4. Align `references/test-generation.md` (`test.fixme`) with the no-skip rule, and `references/pr-attachments.md` with the `pr-assets` rule in `rules/git.md`.
5. Add a repo test that fails if any skill contains `@latest`, `attach --cdp`, `attach --extension` or `gh pr create --attach`. Record each change in `licenses/README.md`, as Apache-2.0 requires.

**Files:** `skills/playwright-cli/SKILL.md` (edit), `skills/playwright-cli/references/storage-state.md` (edit), `skills/playwright-cli/references/session-management.md` (edit), `skills/playwright-cli/references/test-generation.md` (edit), `skills/playwright-cli/references/pr-attachments.md` (edit), `licenses/README.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The safety test passes, and fails when a forbidden example is planted
- [ ] `skills/playwright-cli/SKILL.md` is under 500 lines
- [ ] `licenses/README.md` lists the changes to the vendored files

**Check:** `npm test`

### Step 9: Repository governance and releases
**Do:**
1. Add `SECURITY.md`: private vulnerability reporting, supported versions, response times.
2. Add `.github/dependabot.yml` for GitHub Actions.
3. Add `.github/workflows/release.yml`: on a `vX.Y.Z` tag, run `npm test`, build the `npm pack` tarball, attest its provenance, and publish a GitHub Release with the tarball, its SHA-256, the Step 7 content checksum and notes from `CHANGELOG.md`.
4. Add a `files` allowlist and a real license field to `tools/plan-editor/package.json`.
5. Protect `main` with `gh api` (the user approved this): require a PR and the CI checks from Step 1.

**Files:** `SECURITY.md` (new), `.github/dependabot.yml` (new), `.github/workflows/release.yml` (new), `CHANGELOG.md` (new), `tools/plan-editor/package.json` (edit), `tools/plan-editor/README.md` (edit)

**Done when:**
- [ ] `actionlint` accepts `release.yml`, and its build steps pass locally
- [ ] Packaging the VSIX gives no allowlist warning and it contains only the extension files
- [ ] `SECURITY.md`, Dependabot and `CHANGELOG.md` are in place
- [ ] `main` requires a PR and passing CI

**Check:** `actionlint .github/workflows/release.yml`, package the VSIX in a temp folder and list its contents, `gh api repos/subhash-arabhi/saas-playbook/branches/main/protection`

**Stop and ask if:** branch protection needs settings beyond requiring a PR and the CI checks.

### Step 10: Privacy decisions during planning
**Do:**
1. In `rules/security.md` and `skills/security-and-hardening/SKILL.md`, replace "handled only on publish" and "At launch only": when a step adds personal data, a new outside service or analytics, record purpose, retention, deletion path and who it's shared with in `ARCHITECTURE.md`. Publish keeps legal pages, consent UI and final sign-off.
2. Add a "Personal data" table to `templates/ARCHITECTURE.md` (data, purpose, retention, deletion, shared with).
3. In `reviewers/security-auditor.md`, new personal data without a table entry is a High finding.
4. In `workflows/publish.md` and `skills/web-design-guidelines/SKILL.md`, critical or serious accessibility findings block the publish sign-off.

**Files:** `rules/security.md` (edit), `skills/security-and-hardening/SKILL.md` (edit), `templates/ARCHITECTURE.md` (edit), `reviewers/security-auditor.md` (edit), `workflows/publish.md` (edit), `skills/web-design-guidelines/SKILL.md` (edit)

**Done when:**
- [ ] No rule or skill defers privacy design to publish
- [ ] The ARCHITECTURE template has the Personal data table
- [ ] The security reviewer blocks new personal data without an entry
- [ ] Critical or serious accessibility findings block publish sign-off

**Check:** `rg -n 'only on "publish"|At launch only' rules skills` returns nothing; re-read the edited sections together for consistency

### Step 11: README claims match the playbook
**Do:**
1. Keep the full SaaS lifecycle positioning, and add a coverage table: one row per lifecycle stage (discovery, build, release, operations, billing, growth, support, sunset), what covers it today, and "planned" for stages that follow-up plans will add.
2. Replace "cloud, stack and language agnostic" with the assumptions the rules make: containers, infrastructure as code, a secret store with workload identity, Tailwind, and Cloudflare at publish.
3. Replace "every agent reads it the same way" with a compatibility table for Cursor, Claude Code, Codex and Copilot: skill discovery, manual-only commands and slash commands, each marked as checked against docs (with date) or tested.
4. Add `docs/plan-view-light.png` and `docs/plan-view-dark.png` from the plan viewer.

**Files:** `README.md` (edit), `docs/plan-view-light.png` (new), `docs/plan-view-dark.png` (new), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The coverage table marks every lifecycle stage as covered or planned, matching the playbook's actual files
- [ ] The README makes no "agnostic" or "same way" claim the playbook doesn't back
- [ ] The compatibility table says how each entry was checked
- [ ] Both README images exist, and the link test also checks images

**Check:** `npm test`, then view the README rendered on GitHub after the user pushes

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| 1 | 2026-10-15 | Done | 35 tests in 6 files; CI runs tests on Ubuntu and macOS (Node 20, 22, 24), ShellCheck, the plan check, Gitleaks and Semgrep. Also added `tests/helpers.mjs` (shared fixtures); ShellCheck was already clean, so the shell scripts are unchanged. |
| 2 | 2026-10-15 | Done | 38 tests. Also fixed viewer edits dropping the blank line after the front matter, and added the template to the CI plan check (`ci.yml`). |
| 3 | 2026-10-15 | Done | Walked a two-step fixture through the workflow (checkpoint on step 1): clean worktree at the checkpoint and at the end. From here on, unlisted files need an approved plan edit. |
| 4 | 2026-10-15 | Done | Walked both scenarios through the new `deploy.md`: no budget stops before the merge with the cap and missing items listed; a failed smoke check rolls back images and opens a revert PR. The deploy also requires `main` to be an ancestor of the reviewed commit, so the merged files match it. |
| 5 | 2026-10-15 | Done | 10 installer tests, also run with GNU coreutils, findutils, sed, tar and grep (Docker wasn't running); a real Linux run happens in CI after push. v1.0.x installs upgrade without `--force` (files that differ from the new version are backed up). `--force` also covers colliding skills; `/.backup/` is gitignored. Installs take about 0.2s (batched hashing, one `tar` copy). |
| 6 | 2026-10-15 | Done | `git mv` keeps the template byte-identical to the old root `AGENTS.md`; compared with v1.0.2 the only change is this session's question-tool rule. `package.json` still ships the root `AGENTS.md` in the package (harmless, not in this step's Files). |
