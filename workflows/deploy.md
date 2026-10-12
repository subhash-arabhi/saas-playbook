# Workflow: Deploy

Trigger: **`/deploy`**. Their "deploy" is the PR approval. This deploys **to production** (there's no staging). Follow every step in order.

1. **Check the PR.** It's open for the working branch, has no merge conflicts, and its latest commit is the one the pre-PR check passed on. If commits were added since the last push, stop and ask the user to "push" first.
2. **Ask first** if the deploy includes a migration that deletes or rewrites data, or a new setting or secret that must exist in the cloud or its secret store. List exactly what's needed and wait.
3. **Run the production build locally.** Build the exact image that will be deployed, start it with `docker compose` against a local database (migrations applied), and run the smoke check at `http://localhost`: `/api/health` OK, homepage loads, website reaches the API. If anything fails, stop and report. Don't deploy.
4. **Check cloud access.** The cloud CLI's active account must be the one in `.env.local` → `CLOUD_ACCOUNT`. If it isn't, ask the user to log in or switch accounts. Never handle their credentials.
5. **Check the budget cap.** The project's resource group must have a monthly budget with alerts at 50% and 75% (`.agents/rules/deployment.md` → Budget cap). If it's missing (usually the first deploy), **ask the user for the monthly cap and wait.** Add it to `infra/` and create it before anything else is deployed.
6. **Merge** the PR into `main` with a merge commit, and check out the updated `main`.
7. **Deploy with `infra/deploy.sh`** (the cloud's CLI), in this order:
   1. Database migrations
   2. API: build and push the image tagged with the commit SHA, point the app at it
   3. Website: same

   Note the previous image tags first, for rollback. If the deploy creates or changes a resource, name or URL, update `.env.local` (and the key in `.env.example` and `ARCHITECTURE.md`).
8. **Smoke check** on the public URL (`.env.local` → `PUBLIC_URL`):
   - `/api/health` returns OK
   - the homepage loads
   - the website can reach the API
9. **If the smoke check fails:** roll back (previous image tags; migrations only if safe) and report. Don't attempt fixes on production.
10. **Wrap up.** Delete the merged working branch and report the deployed commit, URLs and smoke-check results.
