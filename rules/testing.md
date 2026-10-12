# Testing

## When
- **Every plan step adds tests** for the behaviour it adds. The step's **Check** runs them. Test-first is optional.
- **Every bug fix starts with a failing test** that reproduces the bug. Keep it.
- **Every changed behaviour has a test.** There is no coverage % target.

## What kinds
| Kind | Covers | Rules |
|---|---|---|
| Unit | Pure logic | No network, no database |
| API / integration | Real endpoints over HTTP, against a **real local database** (same engine as production, in Docker) | **Never mock the database.** Every user-owned resource has a test proving user A can't reach user B's data. |
| E2E (Playwright) | The **core user flows** (sign up, log in, the main action, billing) | Runs against the full app locally. Keep it small (about 5–15 flows). A step that changes a core flow updates its test. |
| UI check | Changed screens in a browser, desktop **and** mobile | In every step that changes UI, before it's ticked (`browser-testing-with-devtools` skill) |

## Rules
- Use the language's standard test runner.
- **Test data:** per-test builder functions (e.g. `make_user()`, `make_project(owner=user)`). No shared seed dataset. Each test starts from a known state.
- **Outside services** (LLMs, payments, email, cloud APIs) are **faked at their wrapper module** with realistic stored responses. Tests that call real sandboxes are tagged `live` and run only when the user asks.
- **A flaky test is a failing test.** Fix the cause now. Never add retries or skips to hide it.

## Localhost first
- **The whole app runs locally** (`docker compose up` plus the dev servers, or the production container), with the same database engine as production. `README.md` has the exact commands.
- **Every change is tested at `http://localhost` before it's pushed:** automated tests, E2E, and you opening the changed pages and flows in a browser at desktop and mobile sizes.
- **Every deploy is preceded by a local run of the production build:** the same container image that goes to the cloud, started locally, passing the smoke check at `http://localhost`.
- Never use production to try something out.

## Browser checks
- **Playwright CLI is the default browser tool** (`playwright-cli` skill), pinned as a dev dependency. The assistant's built-in browser is fine for a quick look; Chrome DevTools MCP (pinned, `--isolated`) only for deep performance work.
- **URLs:** only the local dev servers and the production URLs in `.env.local` (keys named in `ARCHITECTURE.md`). Production is read-only.

## Running
- During a build: each step's **Check**. On push: the full suite and E2E; any failure blocks. After deploy: the smoke check (`.agents/workflows/deploy.md`).
