# Workflow: Deploy

Trigger: **`/deploy`**. Their "deploy" is the PR approval. This deploys **to production** (there's no staging). Follow every step in order. **Deploy exactly the commit the pre-PR check passed on. Nothing in this workflow edits a committed file**; any committed change it turns up goes into the next PR.

1. **Check the PR.** It's open for the working branch, has no merge conflicts, `git status` is clean, and its latest commit is the one the pre-PR check passed on. If commits were added since the last push, stop and ask the user to "push" first. `main` must be an ancestor of that commit (the branch is up to date); if it isn't, stop and ask the user to update the branch and "push" again.
2. **Record** the reviewed SHA (the PR's latest commit).
3. **Check the PR has everything the deploy needs**, before anything is merged:
   - a budget for the resource group in `infra/` (`.agents/rules/deployment.md` → Budget cap). If it's missing (usually the first deploy), **ask the user for the monthly cap**: with the question tool (`.agents/rules/asking.md`), offer 2–3 amounts based on `ARCHITECTURE.md` → Cost estimate, none marked recommended
   - every new setting and secret key in `.env.example`
   - every new cloud resource in `infra/`

   If anything is missing, stop. List exactly what to add (with the cap the user chose), and tell the user to add it in a step and "push" again. Don't merge.
4. **Ask first** if the deploy includes a migration that deletes or rewrites data, or a new secret whose value must be set in the cloud's secret store. List exactly what's needed in chat, then ask with the question tool whether to go ahead, and wait.
5. **Run the production build locally.** Build the images from the reviewed SHA, start them with `docker compose` against a local database (migrations applied), and run the smoke check at `http://localhost`: `/api/health` OK, homepage loads, website reaches the API. If anything fails, stop and report. Don't deploy.
6. **Check cloud access.** The cloud CLI's active account must be the one in `.env.local` → `CLOUD_ACCOUNT`. If it isn't, ask the user to log in or switch accounts. Never handle their credentials.
7. **Record the rollback point:** the image tags the API and website run now, and the database's current schema version.
8. **Merge** the PR into `main` with a merge commit, and check out the updated `main`. Its files must match the reviewed SHA (`git diff --quiet <reviewed SHA> HEAD`); if they don't, stop and report.
9. **Deploy the reviewed SHA with `infra/deploy.sh`** (the cloud's CLI), in this order:
   1. The budget, if it doesn't exist in the cloud yet
   2. Database migrations
   3. API: push the image tagged with the reviewed SHA, point the app at it
   4. Website: same

   If the deploy creates or changes a resource name or URL, write it to `.env.local` only. If a committed file needs updating (a key in `.env.example`, `ARCHITECTURE.md`), note it for the next PR.
10. **Smoke check** on the public URL (`.env.local` → `PUBLIC_URL`):
    - `/api/health` returns OK
    - the homepage loads
    - the website can reach the API
11. **If the smoke check fails:** don't attempt fixes on production.
    1. Point the API and website back at the recorded image tags, and check `/api/health` and the homepage again.
    2. Leave the migrations in place (they work with the previous version; `.agents/rules/database.md`). Roll one back only if it's safe and the user agrees.
    3. Open a revert PR: create a branch from `main`, run `git revert -m 1 <merge commit>`, push that branch and open a PR named `Revert <PR title>`.
    4. Report what failed, the rollback result and the revert PR link.
12. **Wrap up.** Delete the merged working branch and report the deployed SHA, URLs, smoke-check results, and anything noted for the next PR.
