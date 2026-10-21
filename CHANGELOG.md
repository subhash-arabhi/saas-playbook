# Changelog

Each release is a `vX.Y.Z` tag. Its GitHub Release carries the `npm pack` tarball, its SHA-256, a provenance attestation, and the content checksum installs record in `.agents/playbook.json`. The release notes are the section below with the same version.

## Unreleased

- Flow documents: the `flow-document` skill (`/flow-document [journey]`) maps the product's user journeys into a tree of numbered steps with branches, fills each step with how it works, real input and output, the processing steps in order, and measured or estimated time and cost, and renders `docs/flow/index.html` from `docs/flow/flow.json` with `templates/flow-document.html` (light and dark, phone layout, deep links, an outside-reader mode). The docs area names the skill, and a finished `/build` updates the flow document when the plan changed a journey.
- No AI attribution in projects: the installer turns off attribution in Claude Code, Codex and VS Code Copilot, and installs a `commit-msg` hook (`tools/strip-attribution.mjs`) that strips agent `Co-authored-by` trailers and "Generated with" / "Made with" lines from every commit, keeping human co-authors. The pre-PR check rewords unpushed commits that still carry attribution (never pushed ones) and blocks on it in files; `/push` removes tool footers from the PR description. Cursor's switch is per user, so the installer explains it.
- `/plan` asks everything before approval: a dry run of the steps lists every question in Open questions before the first card, asks them in rounds of up to 3, and repeats until a dry run finds none. Risky actions approved then become `Approved:` bullets in Changes.
- `/build` runs to the end. It decides and logs what the plan didn't cover ("Decided:", "Also changed:"), lists those notes in the final summary, and stops only for a checkpoint, a risky action without an `Approved:` bullet naming it exactly, a step's Stop and ask if, a check failing after two different approaches, or unrelated uncommitted changes.
- Agent sessions compact at about 500k tokens: the installer sets it for Claude Code (`autoCompactWindow`), Codex (`model_auto_compact_token_limit`, trusted projects) and VS Code Copilot, keeping any value already set. Cursor's point can't be configured; `/summarize` compacts sooner.
- Optional CI for projects: the first push asks whether to run the automated pre-PR checks in GitHub Actions (`templates/ci.yml`: pinned, read-only, no secrets) and whether to require them on `main`. `AGENTS.md` records the choice, and "turn CI on/off" changes it. Deploys still never run from CI.
- Agents ask questions with the coding tool's question interface (`rules/asking.md`), and plans open in the plan view whenever they change (hooks for Cursor and Claude Code).
- Plans can be approved only when Open questions says exactly "None."; the plan template passes the checker.
- The build workflow commits every plan update with its step.
- Deploys ship exactly the reviewed commit, stop before the merge when something they need isn't in the PR, open a revert PR when the smoke check fails, and require migrations that work with both versions.
- The installer records every file it installs with its SHA-256, deletes only those, backs up local edits, stops on unmanaged `.agents/` content or skill-name collisions (`--force` backs up and continues), and stops when a version's content changes.
- Fresh clones ask before running the remote install.
- The project's `AGENTS.md` template moved to `templates/project-AGENTS.md`; the root `AGENTS.md` is for maintaining the playbook.
- The Playwright skill no longer suggests global `@latest` installs, attaching to a running browser, reading auth cookies, `test.fixme` or `gh` uploads; a test keeps it that way.
- Self-tests and CI (tests on Ubuntu and macOS, ShellCheck, Gitleaks, Semgrep), a security policy, Dependabot for Actions, and attested releases.
- Privacy is designed when personal data is added: `ARCHITECTURE.md` gets a "Personal data" table, the security review flags a missing row, and publish blocks on critical or serious accessibility findings.
- The README shows which lifecycle stages are covered and which are planned, the platform assumptions the rules make, and how each agent was checked for compatibility.

## v1.0.2 (2026-10-12)

- Motion tooling: CSS first, Motion by default, GSAP only with approval.

## v1.0.1 (2026-10-12)

- Fixed an npm install warning; the package lists its files explicitly.

## v1.0.0 (2026-10-12)

- First release.
