# Workflow: Push

Trigger: **`/push`** (the user's sign-off). This pushes the working branch to GitHub and opens (or updates) its PR. Follow every step in order.

1. **Check the state.** The working tree is clean, you're on the working branch (not `main`), and no plan step is half-done. Otherwise stop and ask.
2. **Docs:** if anything on the branch isn't reflected in `ARCHITECTURE.md`, `README.md`, `.env.example` or the API contract, update it, bump "Last updated", and commit.
3. **Run the pre-PR check** (`.agents/workflows/pre-pr.md`). If anything blocks, stop and report. Don't push.
4. **Screenshots, if the UI changed:**
   - For every page whose look changed, capture **before** (from `main`) and **after** (from the branch).
   - Capture at **both desktop 1440×900 and mobile 390×844**.
   - Use Playwright CLI, with each version running locally (e.g. a git worktree for `main`) and the same test data.
   - Never capture secrets or real personal data.
   - Commit the images to the `pr-assets` branch under `pr-<branch-name>/`, and push that branch.
5. **Push the working branch.**
6. **Open the PR to `main`**, or update the existing one, with a description from `.agents/templates/pr-description.md`: a simple list of changes, plans included, the screenshot table, pre-PR results, and anything needed before deploying. Then read the description back (`gh pr view --json body -q .body > <tmp>`): some tools append a footer such as "Made with Cursor". If `node .agents/tools/strip-attribution.mjs --check <tmp>` finds one, run `node .agents/tools/strip-attribution.mjs <tmp>`, `gh pr edit --body-file <tmp>`, and check again.
7. **Report** the PR link and the pre-PR summary. Tell the user that "deploy" will merge and deploy it.
