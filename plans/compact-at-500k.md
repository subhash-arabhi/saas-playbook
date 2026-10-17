---
name: "Compact sessions at 500k tokens"
status: building
steps:
  - id: 1
    title: "Compaction settings in the installer"
    summary: "The installer sets a 500k compaction point for Claude Code, Codex and VS Code Copilot, keeping any value the user already set"
    done: true
    checkpoint: false
  - id: 2
    title: "Docs"
    summary: "README compatibility row and Install table, maintainer AGENTS.md and CHANGELOG"
    done: false
    checkpoint: false
---

# Plan: Compact sessions at 500k tokens

## What we're building
In every project that installs the playbook, the agent's session compacts (summarises older history) once the context reaches about 500k tokens, wherever the coding tool allows it. An agent can't compact itself from an instruction, so the installer writes each tool's own setting. Cursor fixes its compaction point on its servers (about 90% of the model's window), so there the README points to `/summarize` instead.

## Changes
- **Claude Code:** `.claude/settings.json` gets `"autoCompactWindow": 500000`, which Claude Code compacts just before.
- **Codex:** `.codex/config.toml` gets `model_auto_compact_token_limit = 500000`. Codex reads it only in projects the user has trusted.
- **VS Code Copilot:** `.vscode/settings.json` gets `"github.copilot.chat.advanced.summarizeAgentConversationHistoryThreshold": 500000`, an advanced setting that VS Code's public settings reference doesn't list.
- **Respects existing settings:** a value the user already set is kept, and a file that can't be parsed (for example JSON with comments) is left alone with a message saying what to add.
- **Cursor:** not configurable; the installer and README say so and point to `/summarize`.
- **Smaller models:** models with windows under 500k are unaffected; each tool compacts earlier on its own.

## Steps

### Step 1: Compaction settings in the installer
**Do:**
1. Add `tools/install-compaction.mjs` with one constant, `COMPACT_AT = 500000`, and `installCompaction(dir)`. It sets the three settings above if they're missing and returns one line per tool, plus one for Cursor.
2. For `.codex/config.toml`, add the key at the top of the file (top-level keys must come before any `[table]`), or create the file.
3. Call it from `install.sh` after the hooks.
4. Tests: it creates missing files, keeps the user's own value, keeps other settings, adds nothing twice, puts the TOML key before the first table, and leaves unparseable JSON untouched. Installer test: a fresh install has all three settings.

**Files:** `tools/install-compaction.mjs` (new), `install.sh` (edit), `tests/compaction.test.mjs` (new), `tests/installer.test.mjs` (edit)

**Done when:**
- [x] A fresh install has the 500k setting in `.claude/settings.json`, `.codex/config.toml` and `.vscode/settings.json`
- [x] Reinstalling changes nothing, and a user's own value survives
- [x] The installer's output says Cursor can't be configured and names `/summarize`

**Check:** `npm test`, `shellcheck install.sh`

### Step 2: Docs
**Do:**
1. README: a "Compacts at about 500k tokens" row in the agent compatibility table (each entry checked against docs, 2026-10-17), and the new files in the Install table.
2. Maintainer `AGENTS.md` → What's where: list `install-compaction.mjs`. `CHANGELOG.md` Unreleased entry.

**Files:** `README.md` (edit), `AGENTS.md` (edit), `CHANGELOG.md` (edit)

**Done when:**
- [ ] The README says how each tool was checked, and that Cursor can't be configured
- [ ] CHANGELOG describes the change

**Check:** `npm test`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
| 1 | 2026-10-17 | Done | 60 tests (5 new). VS Code settings often contain comments; those files are left alone with the exact line to add. The installer's "Commit …" hint now lists `.codex/config.toml` and `.vscode/settings.json`. |
