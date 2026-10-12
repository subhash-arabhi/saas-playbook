# Dependency review

Every dependency is a liability. Prefer the standard library and existing utilities.

## Before adding a dependency

1. Does the existing stack already solve this? (Often it does.)
2. How large is it? Install size, and bundle impact for frontend code.
3. Is it actively maintained? Last commit, open issues.
4. Known vulnerabilities? Run a dependency scanner (e.g. OSV-Scanner) before adding and before merge.
5. Is the license compatible with the project?

## Upgrading a dependency

An upgrade is a behaviour change you didn't write. Review it like any other change.

1. **Read the changelog**, not just the version number. A "patch" can change behaviour. For a major bump, read the migration notes and find what breaks.
2. **One dependency per change** (or a small related group). A bulk "bump deps" that breaks the build hides which package did it.
3. **Let the tests decide:** green suite before and after. If coverage around the dependency is thin, that's the finding: add a test first.
4. **Review the lockfile diff**, not just the manifest (`package.json`, `pyproject.toml`, `go.mod`, ...). One direct bump can pull in dozens of indirect changes.
5. **Keep the lockfile honest:** commit it, review its diff, never hand-edit it.

For audit findings and supply-chain risk (typosquatting, compromised maintainers), follow the `security-and-hardening` skill if installed. This file covers the upgrade workflow; that one gives the security verdict.
