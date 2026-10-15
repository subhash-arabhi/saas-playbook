# Repo structure

## Fixed in every project
```text
AGENTS.md  CLAUDE.md      agent instructions (CLAUDE.md only contains "@AGENTS.md")
.agents/                  this playbook (gitignored, reinstalled from playbook.json) + project skills (committed)
EXPLORE.md                findings and decision from the explore phase (.agents/workflows/explore.md)
ARCHITECTURE.md           system overview (.agents/templates/ARCHITECTURE.md)
DESIGN.md                 design contract, apps with a UI (.agents/templates/DESIGN.md)
README.md                 what it is, how to run and test
.env.example              every setting and private-value key, placeholders only (committed)
.env.local                secrets and every other private value (gitignored, never committed)
plans/                    plans (.agents/templates/plan.md)
infra/                    infrastructure as code + infra/deploy.sh
scripts/pre-pr.sh         automated pre-PR checks for this project's stack
.github/workflows/pre-pr.yml  runs scripts/pre-pr.sh on every PR, only when AGENTS.md → CI is github-actions
docker-compose.yml        local services (database, storage emulator, …)
```

## Everything else
- **You choose the app layout for the stack**, e.g. `apps/web` + `apps/api` + `packages/shared`, or one app.
- **Organise code by feature** (`auth/`, `projects/`, `billing/`), with shared code in one clearly named place (`lib/` or `packages/shared`). Don't organise only by technical layer.
- **Record the layout** in `ARCHITECTURE.md` → "Project structure": where code, tests, E2E tests, migrations and generated code live.
- **Gitignore:** `.env*` (except `.env.example`), build output, `.playwright-cli/`, screenshots, videos, traces.
