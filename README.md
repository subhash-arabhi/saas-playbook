# SaaS Playbook

**Rules, workflows and skills that make any AI coding agent build SaaS apps the same way every time.**

Install it into a repo and your agent (Claude Code, Cursor, Codex, or anything that reads `AGENTS.md`) explores the idea first, plans before it builds, tests every step, checks security before every PR, and deploys to your cloud only when you say so.

```bash
npx github:subhash-arabhi/saas-playbook
```

## Highlights

- **One setup for every agent.** Claude Code, Cursor, Codex, GitHub Copilot and other agents read the same `AGENTS.md`, rules and skills, the same way. Switch tools mid-project without re-adapting anything.
- **Cloud, stack and language agnostic.** Nothing assumes a provider, framework or language. The agent picks the best stack for each project within the cloud you name, and the rules and skills apply unchanged. Tailwind is the one fixed choice, for consistent UI.
- **Six commands drive the whole lifecycle.** `/explore` → `/plan` → `/build` → `/push` → `/deploy` → `/publish`. The agent never pushes, deploys or publishes on its own.
- **Explore before you build.** Test the idea with a minimal local prototype, on the cheapest models, before any production work starts.
- **Plans you can read and edit.** Short plans with collapsible steps in a plan view inside Cursor or VS Code. Click a step's circle to make the build pause there, edit inline, then approve. A checker enforces the format.
- **A quality gate before every PR.** Simplification, full tests, Playwright E2E, Gitleaks, Semgrep, OSV-Scanner, a UI audit, a code review, a security review, and an LLM red-team when AI code changed. It runs in about 5–10 minutes.
- **Consistent design.** One `DESIGN.md` (tokens and every component) feeds the Tailwind theme. Every UI change is checked on desktop and mobile.
- **Deploys on your command.** Through your cloud's own CLI: infrastructure as code, one resource group per app, a budget cap with alerts at 50% and 75%, a smoke check and rollback on every deploy.
- **Private by default.** Secrets, cloud account and resource names and URLs live only in `.env.local`, and docs refer to them by key, so the repo is safe to make public.
- **AI features done right.** Models are researched and lightly tested per task, outputs are validated, and calls have timeouts, retries in one place and per-user cost caps.
- **Light on context.** About 2,300 tokens are loaded on every request. Rules hold the decisions; skills load only for the work at hand, and their detail sits in references read on demand.

## How it works

```text
 /explore ──► /plan ──► /build ──► /push ──────────► /deploy ──────────► /publish
 prototype    plan in    step by    pre-PR check,     merge, deploy,     legal, consent,
 locally,     plans/,    step, one  push, PR with     smoke check,       accessibility,
 decide       you        commit     before/after      rollback on        domain and
              approve    each       screenshots       failure            Cloudflare
```

| Command | What happens |
|---|---|
| `/explore <idea>` | Minimal local prototype to find out if the idea is worth building. Findings go in `EXPLORE.md` |
| `/plan [what]` | Writes a plan in `plans/`. After exploring, it first records the decision and switches to the build phase |
| `/build [plan]` | Builds an approved plan step by step, with tests and one commit per step. Run again to resume |
| `/push` | Your sign-off: runs the pre-PR check, pushes and opens the PR |
| `/deploy` | Merges the PR and deploys to production, then smoke-checks it |
| `/publish` | Readiness for real users (rare): legal pages, consent, privacy, accessibility, licenses, domain |

Typing the plain word ("push") works too. Large work outside a plan gets a suggestion to run `/plan`, and the agent asks when it's unsure.

### The plan view

Plans are plain markdown in `plans/`, shown as an editable view in Cursor and VS Code, or in the browser from any tool. Expand a step to read or edit it, click a circle to make the build pause after that step, and approve when there are no open questions.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/plan-view-dark.png">
  <img alt="The plan view: a plan with six steps, two done, one expanded with its Do, Files, Done when and Check, and a checkpoint set on step 3" src="docs/plan-view-light.png" width="800">
</picture>

## Install

### The full playbook (recommended)

Run in the root of your project (Node 18+, git and bash):

```bash
npx github:subhash-arabhi/saas-playbook
```

Or from a clone: `./install.sh /path/to/project`.

It adds:

| Path | What it is | Committed |
|---|---|---|
| `AGENTS.md` | The mandatory rules, commands and areas table. Fill in its "Project-specific" section | Yes |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code reads it | Yes |
| `.claude/skills` → `.agents/skills` | Link for Claude Code's skill discovery | Yes |
| `.agents/playbook.json` | The installed version, its reinstall command, and the playbook's skill list | Yes |
| `.agents/.gitignore` | Keeps the playbook's own files out of git | Yes |
| `.agents/` rules, workflows, reviewers, references, templates, tools and skills | The playbook itself | **No**, reinstalled from `playbook.json` |
| `.agents/skills/<your-skill>/` | Your project's own skills, side by side with the playbook's | Yes |
| `plans/` | Where plans go | Yes |

Commit, then start a session with: *"Read AGENTS.md and follow it strictly."*

**Your skills and the playbook's stay separate.** The playbook's skills are listed in `.agents/playbook.json` and gitignored; every other folder in `.agents/skills/` is yours, committed with the project and never touched by updates. Name your skills in `AGENTS.md` → Project-specific.

**Fresh clones set themselves up.** `AGENTS.md` tells the agent to run the pinned install command from `playbook.json` when `.agents/rules/` is missing, so teammates and cloud agents get exactly the same version. To keep the playbook in git instead, install with `--commit` (the choice is remembered).

**Update** with `npx github:subhash-arabhi/saas-playbook` (latest) or `#vX.Y.Z` (a specific release). It replaces the playbook's files, removes skills the playbook dropped, keeps yours, and never overwrites your `AGENTS.md`; if the playbook's `AGENTS.md` changed, it writes `AGENTS.playbook.md` for you to merge.

**Plan view in Cursor or VS Code** (optional): `bash .agents/tools/plan-editor/install.sh`, then open any `plans/*.md`. Elsewhere, `node .agents/tools/plan.mjs view` serves it at http://localhost:4600.

### Single skills

The general skills also work on their own, in any project:

```bash
npx skills add subhash-arabhi/saas-playbook
npx skills add subhash-arabhi/saas-playbook --skill security-and-hardening
```

Each skill follows the playbook's rules when `.agents/rules/` exists, and stands on its own when it doesn't. The command skills come only with the full playbook.

## Skills

| Skill | What it does |
|---|---|
| `incremental-implementation` | Builds in thin, tested, committed steps |
| `api-and-interface-design` | Stable APIs: contracts, errors, pagination, additive changes, idempotency |
| `frontend-ui-engineering` | Production UI from the design system, every state, desktop and mobile, no "AI look" |
| `design-motion-principles` | Purposeful motion: CSS first, Motion (formerly Framer Motion) when needed, restrained in apps, expressive on marketing pages |
| `browser-testing-with-devtools` | Checks pages in a real browser: console, network, layout, performance |
| `playwright-cli` | Browser automation and Playwright tests (vendored from Microsoft) |
| `security-and-hardening` | OWASP Top 10 and LLM Top 10, secrets, auth, uploads, supply chain |
| `observability-and-instrumentation` | Structured logs, metrics, traces and alerts that answer real questions |
| `debugging-and-error-recovery` | Root-cause debugging, starting from a failing test |
| `code-review-and-quality` | Five-axis review: correctness, readability, architecture, security, performance |
| `code-simplification` | Simpler code with the same behaviour |
| `web-design-guidelines` | UI audit against interface guidelines and design tokens |

## What's inside

| Folder | Contents |
|---|---|
| `AGENTS.md` | Phase, the Always rules, commands, and which rules and skills each area needs |
| `rules/` | The decisions: planning, stack, system design, AI, repo structure, backend, frontend, database, testing, security, documentation, git, deployment |
| `workflows/` | Exactly what happens on explore, build, push (with the pre-PR check), deploy and publish |
| `skills/` | The 12 skills above, plus the six command skills |
| `reviewers/` | Code reviewer, security auditor, test engineer |
| `references/` | Security, accessibility and publish checklists; reference design systems |
| `templates/` | `plan.md`, `ARCHITECTURE.md`, `DESIGN.md`, PR description |
| `tools/` | Plan checker and viewer (`plan.mjs`), and the plan editor extension |

The agent creates the per-project files as it goes: `ARCHITECTURE.md`, `DESIGN.md`, `infra/`, `scripts/pre-pr.sh` and `docker-compose.yml`.

## Customising

- **Project rules** go in the "Project-specific" section of the project's `AGENTS.md`. They override the playbook's rules.
- **Project-only skills** go in `.agents/skills/<name>/`, under a name the playbook doesn't use. Updates keep them.
- **Don't edit the playbook inside `.agents/`;** change the source and re-install.
- **If the agent skips a step,** name it: "You skipped step 4 of push.md. Redo it." Exact references work better than general reminders.

## Requirements

- An agent that reads `AGENTS.md` or Agent Skills: Claude Code, Cursor, Codex, GitHub Copilot and others
- Node 18+, git and bash
- Docker, for the local database
- Your cloud's CLI, already logged in, when you deploy

## Credits

Several skills, reviewers and checklists are adapted from excellent open-source work: [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills), [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli), [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines), [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles), [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) and [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md). The `DESIGN.md` format is from [google-labs-code/design.md](https://github.com/google-labs-code/design.md). Pinned commits and changes are listed in [`licenses/README.md`](licenses/README.md).

## License

[MIT](LICENSE). Third-party content keeps its own license (MIT, or Apache-2.0 for `playwright-cli`); the license files are in [`licenses/`](licenses/).
