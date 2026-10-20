# Git, push and deploy

- **Work on one working branch**, `work/<YYYY-MM-DD>-<topic>`, created from `main` when work starts on `main`. Keep using it across plans until "deploy" merges it, then start a fresh one from `main`.
- **Commits:** one per plan step, `Step N: <short imperative title>` (e.g. `Step 3: Add project creation endpoint`). Plus `Update ARCHITECTURE.md` at the end of a plan, and `Simplify <area>` from the pre-PR check. Outside a plan, use a short imperative message.
- **No AI attribution** in commit messages, PR descriptions, code comments or docs: no agent `Co-Authored-By` trailers, no "Generated with" lines, no agent as author. Tools add these themselves, so the `commit-msg` hook strips them from every commit (`.agents/tools/install-attribution.mjs` installs it when missing), the pre-PR check rewords unpushed commits and blocks on the rest (`.agents/workflows/pre-pr.md` → AI attribution), and push cleans the PR description. Never rewrite pushed commits without asking.
- **Commit locally only.** "push" → `.agents/workflows/push.md`; "deploy" (the PR approval) → `.agents/workflows/deploy.md`, merging with a merge commit (never squash).
- **PR screenshots** go on the `pr-assets` branch, which never merges into `main`. Don't use `gh pr create --attach`.
- Never commit `.env.local` (or any `.env*` except `.env.example`), databases, build output or test artefacts.
