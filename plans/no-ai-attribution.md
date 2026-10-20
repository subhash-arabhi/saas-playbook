---
name: "No AI attribution"
status: building
steps:
  - id: 1
    title: "Strip attribution from commit messages"
    summary: "A tool that removes agent trailers and 'Generated with' lines, and a commit-msg hook that runs it on every commit"
    done: true
    checkpoint: false
  - id: 2
    title: "Install it in every project"
    summary: "The installer turns attribution off in Claude Code, Codex and VS Code, installs the hook, and explains Cursor's per-user switch"
    done: true
    checkpoint: false
  - id: 3
    title: "Check before every PR"
    summary: "The pre-PR check removes attribution from unpushed commits and blocks on it in files; push cleans the PR description"
    done: false
    checkpoint: false
  - id: 4
    title: "Docs"
    summary: "README, CHANGELOG and the rules describe the change"
    done: false
    checkpoint: false
---

# Plan: No AI attribution

## What we're building
Projects that use the playbook never show an AI tool as an author: no "Co-authored-by: Cursor" trailers, no "🤖 Generated with Claude Code" lines, no "Made with Cursor" PR footers. The rule alone can't stop it, because the tools add these after the agent writes the message. So the installer turns attribution off in each tool that allows it per project, a git `commit-msg` hook strips whatever still gets added, and the pre-PR check catches anything that slips through. This repo's own history is out of scope.

## Changes
- **Strip tool:** `tools/strip-attribution.mjs` removes agent `Co-authored-by:` and `Claude-Session:` trailers, and "Generated with" / "Made with" lines naming an AI tool. Human co-authors stay.
- **commit-msg hook:** runs the strip tool on every commit, whoever or whatever makes it. Written to the repo's hooks folder (`git rev-parse --git-path hooks`).
- **Tool settings:** the installer turns attribution off in `.claude/settings.json`, `.codex/config.toml` and `.vscode/settings.json` (`git.addAICoAuthor`), keeping values already set.
- **Cursor:** has only a per-user switch. The installer prints how to turn it off and changes nothing outside the project; the hook and the PR check cover it meanwhile.
- **Fresh clones:** git hooks aren't cloned, so the project `AGENTS.md` setup line installs the hook when it's missing.
- **Pre-PR check:** rewords unpushed commits that carry attribution (logged in the report) and blocks on attribution in tracked files (except `.agents/`). Push reads the PR description back and removes any tool footer.

## Steps

### Step 1: Strip attribution from commit messages
**Do:**
1. `tools/strip-attribution.mjs`: `stripAttribution(text)` and `findAttribution(text)`; the CLI rewrites a commit message file in place (`node .agents/tools/strip-attribution.mjs <file>`) or, with `--check`, prints what it finds in stdin and exits non-zero.
2. Agents covered: Cursor, Claude / Claude Code, Codex / OpenAI, Copilot / GitHub Copilot, Gemini, Windsurf, Aider, Devin, Amazon Q, by name and noreply address.

**Files:** `tools/strip-attribution.mjs` (new), `tests/attribution.test.mjs` (new)

**Done when:**
- [x] Every known agent trailer and "Generated with" / "Made with" line is removed; human co-authors and other trailers stay
- [x] A real `git commit` in a temp repo with the hook has no agent trailer

**Check:** `npm test`

### Step 2: Install it in every project
**Do:**
1. `tools/install-attribution.mjs`: sets the three tools' settings like `install-compaction.mjs`, and writes the `commit-msg` hook. An existing hook that isn't the playbook's is left alone, and the installer prints the line to add to it.
2. `install.sh` runs it and prints how to turn Cursor's switch off (Cursor Settings → Git & PRs → Attribution; `attribution` in `~/.cursor/cli-config.json` for the CLI).
3. `templates/project-AGENTS.md`: the setup line installs the hook when it's missing (fresh clones).

**Files:** `tools/install-attribution.mjs` (new), `install.sh` (edit), `templates/project-AGENTS.md` (edit), `tests/attribution.test.mjs` (edit)

**Done when:**
- [x] A fresh install sets all three tools' settings and the hook, and keeps values already set
- [x] An existing commit-msg hook is left alone, with the line to add printed

**Check:** `npm test`, `shellcheck install.sh tools/plan-editor/install.sh`

### Step 3: Check before every PR
**Do:**
1. `workflows/pre-pr.md` step 5: unpushed commits with attribution are reworded with the strip tool before pushing (listed in the report); attribution in tracked files outside `.agents/` blocks. Already-pushed commits are never rewritten.
2. `workflows/push.md` step 6: after creating or updating the PR, read its description back and remove any tool footer with `gh pr edit`.
3. `rules/git.md`: the no-attribution rule names the hook and these checks.

**Files:** `workflows/pre-pr.md` (edit), `workflows/push.md` (edit), `rules/git.md` (edit), `tests/repo.test.mjs` (edit)

**Done when:**
- [ ] The pre-PR check rewords unpushed commits, never pushed ones, and blocks on attribution in files
- [ ] Push removes a "Made with Cursor" footer from the PR description

**Check:** `npm test`

### Step 4: Docs
**Do:**
1. README: the compatibility table and install output mention attribution.
2. CHANGELOG entry.

**Files:** `README.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [ ] README and CHANGELOG describe the change

**Check:** `npm test`, `node tools/plan.mjs check plans/no-ai-attribution.md`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| Plan | 2026-10-20 | Dry run | Dry run: 4 questions, none left. This repo's history is out of scope (your answer); the other three use defaults: reword unpushed commits, print Cursor's switch, leave an existing hook alone. |
| 1 | 2026-10-20 | Done | 4 tests (new `tests/attribution.test.mjs`), including a real commit through the hook and `--amend`. Decided: the direct-run check compares real paths, because on macOS `/var` is a symlink and the tool silently did nothing there. Decided: not built: `install-compaction.mjs` and `install-hooks.mjs` have the same check; they run from the playbook source, not a project. |
| 2 | 2026-10-20 | Done | 73 tests (4 new in `tests/attribution.test.mjs`, 1 extended in `tests/installer.test.mjs`). Decided: the hook is installed only at the repo root, so a project inside another repo never touches the outer repo's hooks. Also changed: `tests/installer.test.mjs` (checks `install.sh` end to end). |
