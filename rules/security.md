# Security

Detail: `.agents/skills/security-and-hardening/SKILL.md`. Checklist (manual reviews, package-manager matrix, install-script gate): `.agents/references/security-checklist.md`. Reviewer: `.agents/reviewers/security-auditor.md`.

- **Secrets** live in `.env.local` locally and in the cloud's secret store when deployed, read through managed identity (`.agents/rules/documentation.md` → Private values). Never in code, docs, logs, commits or browser-visible build variables (`VITE_*`, `NEXT_PUBLIC_*`).
- **Leaked secret:** rotate it first, then purge it from history.
- **The API enforces every check.** Never trust the browser or anything in front of the app.
- **CORS stays closed** (one origin, `.agents/rules/stack.md`).
- **Personalised responses** send `Cache-Control: private, no-store`, so no cache or proxy serves one user's data to another.
- **Validate every input at the boundary.** Parameterise every query. Encode output.
- **LLM output is untrusted input.** Never put secrets, other users' data or the full system prompt in an LLM context. Cap tokens and requests per user.
- **Personal data:** collect only what a feature needs; keep it out of logs, telemetry and LLM prompts.
- **Privacy is designed when the data is added.** When a plan step adds personal data, a new outside service that receives it, or analytics, record its purpose, retention, deletion path and who it's shared with in `ARCHITECTURE.md` → "Personal data", in that step. Deletion must really delete (stores and backups, not a flag).
- **Legal pages, consent UI and the final privacy sign-off** are done on "publish" (`.agents/workflows/publish.md`), from that table.
- **Security checks run on "push"** (`.agents/workflows/pre-pr.md`). Any Critical or High finding, or any secret, blocks the push.
