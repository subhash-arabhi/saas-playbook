# Workflow: Pre-PR check

Run by `.agents/workflows/push.md`. Follow every step in order. If a step **blocks**, stop: don't push, and report.

## The project script
`scripts/pre-pr.sh` runs the **automated** steps (3–11). It's different for every project because it depends on the stack.
- **If it doesn't exist, create it on the first "push":** use the project's real test, E2E, lint and build commands, plus Gitleaks, Semgrep and OSV-Scanner (pinned versions). Make it exit non-zero on any blocking failure and print one `PASS` / `BLOCK` / `WARN` / `SKIPPED` line per step. Commit it before running.
- **Keep it current** when the stack's commands change, and add step 5's attribution check if the script doesn't run it yet.
- **CI-aware:** when `CI=true`, the `.env.local` part of step 5 prints `SKIPPED` (there's no `.env.local` in CI); Gitleaks still runs. Diff-based steps compare against `BASE_REF` when it's set.
- Steps 1–2 and 12–16 are done by you, the agent, not the script.

## CI
The script can also run on every pull request in GitHub Actions. That's the user's choice, recorded in `AGENTS.md` → Project-specific → **CI** (a missing line counts as `not chosen`; add it).
- **When you create `scripts/pre-pr.sh`** and CI is `not chosen`, ask with the question tool: run these checks in GitHub Actions on every PR, or local only? Mark neither as recommended (private repos spend Actions minutes). If the repo's remote isn't on GitHub, don't ask: say CI isn't supported there yet and record `local only`.
- **On "github-actions":** copy `.agents/templates/ci.yml` to `.github/workflows/pre-pr.yml`, fill in the stack's setup steps (every action pinned by commit SHA, no secrets, read-only permissions), and commit it with the script. Then ask a second question: make this check required on `main`? Only on "yes", and only after the workflow has run once on the PR so the check exists, add it to `main`'s required status checks (`gh api`, keeping the existing protection); otherwise mention the option in the report.
- **On "local only":** create no workflow. Record the answer; don't ask again.
- **"Turn CI on" / "turn CI off"** later: add or remove the workflow and update the CI line. Turning it off doesn't change branch protection; if the check is required, say so and ask before removing it from `main`.
- **Local check still runs.** CI repeats only the script's steps; the agent's steps (1–2, 12–16) and the local run on "push" are unchanged. CI never deploys.

## AI attribution
Commits, PRs, code and docs never name an AI tool as author (`.agents/rules/git.md`). Before running the script:
- **Unpushed commits:** if `git log --format=%B <base>..HEAD | node .agents/tools/strip-attribution.mjs --check` finds anything, and none of the branch's commits is on a remote yet (`git branch -r --contains <oldest branch commit>` is empty), reword them: `git rebase --exec 'node .agents/tools/strip-attribution.mjs --amend' <base>`. The code doesn't change, only the messages. List the reworded commits in the report.
- **Never rewrite pushed commits.** If attribution is in a commit that's already on a remote, or the branch has merge commits, step 5 blocks: report it and ask, because fixing it needs a force-push.
- **Files:** attribution in a tracked file (a "Generated with" line in a doc or comment) is removed by editing the file and committing.

## Steps
| # | Step | How | Blocks when |
|---|---|---|---|
| 1 | Simplify the branch's changes | You: `.agents/skills/code-simplification/SKILL.md`, changed code only, one change at a time, tests after each, commit `Simplify <area>`; revert anything that breaks a test | Never |
| 2 | Local run | You: start the full app at localhost (`README.md` commands), open every page/flow changed on the branch at 1440×900 and 390×844 with Playwright CLI, and check the console and network | Anything broken, or the app doesn't start |
| 3 | Full test suite | Script: all tests except `live` | Any failure. Stop here if tests fail |
| 4 | E2E core flows | Script: Playwright against the full app running locally | Any failure |
| 5 | Secrets, private values and AI attribution | Script: Gitleaks on the branch, code and docs; then search all tracked files (except `.agents/`) and the branch's commit messages for every `.env.local` value and for the hostname suffixes the project's cloud uses for its services (list them in `scripts/pre-pr.sh`); then `git log --format=%B <base>..HEAD \| node .agents/tools/strip-attribution.mjs --check` and `git ls-files -z -- ':!.agents' \| xargs -0 node .agents/tools/strip-attribution.mjs --check` | Any secret or private value, or AI attribution in a commit or file |
| 6 | `ARCHITECTURE.md` updated | Script: `git diff --name-only <base>...HEAD` includes it | Not updated |
| 7 | Code scan | Script: Semgrep on changed files (OWASP + the repo's languages) | A high-severity finding that isn't a confirmed false positive |
| 8 | Vulnerable packages | Script: OSV-Scanner on every lockfile | A reachable critical/high vulnerability with no documented deferral |
| 9 | `DESIGN.md` lint (only if the project has UI) | Script: `npx @google/design.md@<pinned> lint DESIGN.md` | Any error (warnings are reported, not blocking) |
| 10 | Design coverage (only if the project has UI) | Script: `node .agents/tools/design-coverage.mjs`: every shared component in use is `approved` in `DESIGN.md` | A component that isn't `approved`, or no Approvals table ("run /front-end-design") |
| 11 | No arbitrary Tailwind values (only if the project has UI) | Script: ESLint with `eslint-plugin-better-tailwindcss` (`.agents/rules/frontend.md` → Styling) | Any `no-restricted-classes` error |
| 12 | UI audit (only if UI files changed) | You: `.agents/skills/web-design-guidelines/SKILL.md` on changed UI files: interface rules, `DESIGN.md` tokens and components, desktop + mobile layout | Never (warnings) |
| 13 | Code review | You: `.agents/reviewers/code-reviewer.md`, pre-PR mode, on the branch diff | A Critical finding, including an inaccurate `ARCHITECTURE.md`. Required findings are listed for the user to fix or accept |
| 14 | Security review | You: `.agents/reviewers/security-auditor.md`, pre-PR mode | A Critical or High finding, or any secret |
| 15 | LLM red-team (only if AI code or prompts changed) | You: run the project's promptfoo suite | Any failing injection, jailbreak or prompt-leak test |
| 16 | Report | You: one line per step (PASS / BLOCK / WARN / SKIPPED), simplification commits, then the code-review and security-review reports | — |

**The project has UI** when it has a `DESIGN.md` or a frontend package; otherwise steps 9–11 print `SKIPPED`.

Target runtime: about 5–10 minutes.
