# Deployment and monitoring

## Cloud account
- **The project's cloud** is named in `AGENTS.md` → Project-specific. Use its official CLI for everything in the cloud. The user is already logged in. Before any change, check that the active account is the one in `.env.local` → `CLOUD_ACCOUNT`. Never log in yourself or handle credentials.
- **Every SaaS gets its own new resource group** (or the cloud's equivalent: a project or account), named `<project>-rg` where the cloud allows, and saved as `CLOUD_RESOURCE_GROUP` in `.env.local`. All of the project's resources go in it.
- **The account, resource group, resource names, IDs and URLs** live only in `.env.local` (`.agents/rules/documentation.md` → Private values). `infra/deploy.sh` reads them from there and passes names to `infra/` as parameters.
- **If the CLI hangs or fails on the network**, stop and tell the user. A project-specific workaround (e.g. a wrapper script) is named in `AGENTS.md` → Project-specific.

## Budget cap
- **No deploy without a budget on the project's resource group.** Before the first deploy, **ask the user for the monthly cap** (an amount in the account's billing currency). Never choose it yourself.
- **Alerts at 50% and 75%** of the cap, on actual spend, sent by email to the same address as the other alerts.
- **Defined in `infra/`** with the other resources, using the cloud's budget feature, scoped to the resource group.
- **Change the cap only when the user asks.** Record it in `ARCHITECTURE.md` → Cost estimate.
- **A cloud budget only alerts; it doesn't stop spending,** and cost data arrives hours late. Per-use limits on paid calls (`.agents/rules/system-design.md`) are still required.

## Deploying
- **Straight to production.** There is no staging: local, then production.
- **Only when the user says "deploy"** (`.agents/workflows/deploy.md`), and only after the production build has passed a local smoke check at `http://localhost` and the resource group has its budget cap.
- **From this machine with the cloud's CLI**, through `infra/deploy.sh`. There's no CI/CD pipeline.
  - Build and push images to the cloud's container registry, tagged with the git commit SHA, then point the apps at the new tag.
- **Only the reviewed commit:** images are built from the commit the pre-PR check passed on and tagged with its SHA. Everything the deploy needs (budget, resources in `infra/`, keys in `.env.example`) is in the PR before the merge; the deploy never edits committed files.
- **Order:** database migrations, then API, then website.
- **Migrations work with both the running and the new version,** because the old API keeps serving while they run and after a rollback. Expand first (add columns, tables, indexes), deploy the code that uses them, and contract (drop or rename what's no longer used) in a later deploy. A migration that deletes or rewrites data ships in a later deploy than the code that stops using it, and only with the user's OK.
- **Infrastructure as code:** every cloud resource is defined in `infra/` (the cloud's own IaC tool, or Terraform/OpenTofu), so production can be recreated from the repo.
- **Rollback:** point the apps at the previous image tags and open a revert PR for the merge. Migrations stay in place (they work with the previous version); roll one back only if safe.

## Secrets in the cloud
- **Deployed secrets live in the cloud's secret store**, read by the app through the cloud's managed (workload) identity. No keys in app settings, images or `infra/`.

## Monitoring
Detail: `.agents/skills/observability-and-instrumentation/SKILL.md`.
- **The cloud's monitoring service** collects API logs, metrics and traces (sent with OpenTelemetry) and website errors (its browser SDK, or an OpenTelemetry web SDK). One request ID links them.
- **Every project has:**
  - an availability test on the public URL's `/api/health` and the homepage
  - an API error-rate alert
  - an API latency alert
- **Alerts:** email (address in `.env.local` → `ALERT_EMAIL`) for everything; email plus a mobile push (the cloud's mobile app) for "notify me now".
- **Runbook:** each alert has a short entry in `ARCHITECTURE.md` → "Monitoring and alerts".
- **Cost:** a daily ingestion cap on monitoring data, and sampling of successful requests.
