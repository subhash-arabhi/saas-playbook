# Changelog

Each release is a `vX.Y.Z` tag. Its GitHub Release carries the `npm pack` tarball, its SHA-256, a provenance attestation, and the content checksum installs record in `.agents/playbook.json`. The release notes are the section below with the same version.

## Unreleased

- Optional CI for projects: the first push asks whether to run the automated pre-PR checks in GitHub Actions (`templates/ci.yml`: pinned, read-only, no secrets) and whether to require them on `main`. `AGENTS.md` records the choice, and "turn CI on/off" changes it. Deploys still never run from CI.
- Agents ask questions with the coding tool's question interface (`rules/asking.md`), and plans open in the plan view whenever they change (hooks for Cursor and Claude Code).
- Plans can be approved only when Open questions says exactly "None."; the plan template passes the checker.
- The build workflow commits every plan update with its step; a file outside a step's list needs an approved plan edit.
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
