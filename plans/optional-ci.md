---
name: "Optional CI for projects"
status: draft
steps:
  - id: 1
    title: "CI workflow template"
    summary: "A GitHub Actions template that runs scripts/pre-pr.sh on every PR, pinned and read-only"
    done: false
    checkpoint: false
  - id: 2
    title: "Ask, record and change the choice"
    summary: "The first push asks whether to add CI, AGENTS.md records the answer, and the user can switch it later"
    done: false
    checkpoint: false
  - id: 3
    title: "Rules and docs"
    summary: "Deployment and repo-structure rules, README and CHANGELOG describe optional CI"
    done: false
    checkpoint: false
---

# Plan: Optional CI for projects

## What we're building
Projects that install the playbook can choose whether their pull requests also run the automated pre-PR checks in GitHub Actions. The agent asks once, the first time it creates `scripts/pre-pr.sh`, records the answer in `AGENTS.md`, and adds or removes the workflow when the user changes their mind. The local pre-PR check on "push" stays as it is, and deploys still never run from CI.

## Changes
- **CI template:** `templates/ci.yml` runs the project's `scripts/pre-pr.sh` on every pull request, with actions pinned by commit SHA, read-only permissions and no secrets.
- **The choice:** on the first "push", alongside creating `scripts/pre-pr.sh`, the agent asks with the question tool: GitHub Actions or local only. No option is marked recommended, because private repos spend Actions minutes.
- **Recorded in `AGENTS.md`:** a new **CI** line in Project-specific (`not chosen`, `github-actions` or `local only`). Saying "turn CI on" or "turn CI off" later adds or removes the workflow and updates the line.
- **Branch protection, if wanted:** after choosing GitHub Actions, a second question offers to make the check required on `main`; repo settings change only on "yes".
- **CI-aware script:** when `CI=true`, steps that need `.env.local` (the private-value search) print `SKIPPED` instead of failing; Gitleaks still runs.
- **Rules:** deploys stay local; CI only checks. Non-GitHub hosts keep local only.

## Steps

### Step 1: CI workflow template
**Do:**
1. Add `templates/ci.yml`: `on: pull_request`, `permissions: contents: read`, `actions/checkout` pinned by SHA with `persist-credentials: false`, then placeholder setup steps for the stack and `CI=true scripts/pre-pr.sh`.
2. Add a test that the template pins every action by a 40-character SHA, grants only read permissions, runs `scripts/pre-pr.sh`, and has no `secrets.` reference or deploy step.

**Files:** `templates/ci.yml` (new), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The template exists and passes the new test
- [ ] The test fails when an action is pinned by tag, or a `secrets.` reference is added (checked once by hand)

**Check:** `npm test`

### Step 2: Ask, record and change the choice
**Do:**
1. In `workflows/pre-pr.md` → The project script: when creating `scripts/pre-pr.sh`, also ask the CI question if `AGENTS.md` says `not chosen`. On "github-actions", copy `templates/ci.yml` to `.github/workflows/pre-pr.yml`, fill in the stack's setup steps, and commit it with the script. Make the script print `SKIPPED` for the `.env.local` search when `CI=true`.
2. Add `- **CI:** not chosen <!-- not chosen | github-actions | local only -->` to Project-specific in `templates/project-AGENTS.md`, and a line under Commands: "turn CI on/off" adds or removes `.github/workflows/pre-pr.yml` and updates the CI line, through a PR like any other change.
3. After "github-actions", ask a second question: make the CI check required on `main`? Change branch protection only on "yes", after the workflow has run once so the check exists; otherwise mention the option in the report.
4. If the repo isn't on GitHub, say CI isn't supported there yet and record `local only`.
5. Add tests that the project template has the CI line and that `pre-pr.md` names `templates/ci.yml` and both questions.

**Files:** `workflows/pre-pr.md` (edit), `templates/project-AGENTS.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] A walk-through of the first "push" on a fixture project asks once, and with "github-actions" produces a committed `.github/workflows/pre-pr.yml`
- [ ] The branch-protection question follows only "github-actions", and settings change only on "yes"
- [ ] With "local only", no workflow file is created and the next push doesn't ask again
- [ ] "turn CI off" removes the workflow and updates the CI line

**Check:** `npm test`, plus the walk-through above

### Step 3: Rules and docs
**Do:**
1. `rules/deployment.md`: replace "There's no CI/CD pipeline" with "Deploys never run from CI. Optional CI (`AGENTS.md` → CI) only runs the automated pre-PR checks."
2. `rules/repo-structure.md`: list `.github/workflows/pre-pr.yml` as present when CI is on.
3. README: one sentence in How it works and a row in the Install table; `CHANGELOG.md` Unreleased entry.

**Files:** `rules/deployment.md` (edit), `rules/repo-structure.md` (edit), `README.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [ ] No playbook file still says projects have no CI
- [ ] README and CHANGELOG describe the choice and that deploys stay local

**Check:** `npm test`, `rg -n -i 'no CI' rules workflows templates README.md`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
