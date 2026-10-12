---
name: security-and-hardening
description: Hardens code against vulnerabilities. Use when handling untrusted input, authentication, sessions, data storage, file uploads, webhooks, outside services or LLM calls; when auditing a handler or login flow against the OWASP Top Ten; when auditing dependencies or assessing a new package; or when personal data is involved. Privacy compliance (GDPR, CCPA, DPDP) is handled when launching to real users, not while building.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: layered (general guidance here, playbook decisions in .agents/rules/); cloud-agnostic; web app baseline, secret store and managed identity, shared-store rate limiting, private file storage, pre-PR checks, privacy compliance at launch; trimmed (detail in references/). -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/security.md` and `.agents/rules/database.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Security and Hardening

Treat every external input as hostile. When you write code for a rule below, read its section in `references/hardening-patterns.md`.

## 1. Threat model first (five minutes)
1. **Map trust boundaries:** requests, uploads, webhooks, outside APIs, queues, **LLM output**, and local values another party wrote (process command lines, shared-volume filenames, job payloads). Trust follows who *wrote* a value.
2. **Name the assets:** credentials, personal data, payments, admin actions.
3. **Run STRIDE** over each boundary.
4. **Write abuse cases next to use cases;** the first test is "how would I misuse this?"

## 2. Web app baseline
- **The API is the security boundary.** All validation, authentication and authorization run there. Trust nothing the browser sends; never rely on a proxy, CDN or gateway for a check.
- `VITE_*` / `NEXT_PUBLIC_*` variables reach the browser: never secrets or privileged keys.
- Prefer one origin (API under `/api`), so no CORS. Otherwise allow exact origins from config only; never `*`.
- Session cookies: host-only, `Secure`, `HttpOnly`, `SameSite=Lax`/`Strict`, bounded `Max-Age`. No auth tokens in localStorage.
- Personalised responses: `Cache-Control: private, no-store`.
- Security headers on every response (CSP from `default-src 'self'`, only tightened; HSTS; frame protection; `nosniff`). Never disable them. HTTPS everywhere.
- Return an explicit public shape (never `passwordHash`, reset tokens). Error bodies are generic; stack traces go to server logs only.
- Never log passwords, tokens, card numbers or other sensitive data.

## 3. Ask the user first
Auth logic changes · new sensitive-data categories · new outside integrations · CORS changes · upload handlers · rate-limit changes · elevated roles.

## 4. Controls
- **Injection:** parameterize every query; never build SQL, NoSQL or shell commands from strings.
- **XSS:** framework auto-escaping; no `eval()`/`innerHTML` with user data; allowlist-sanitize unavoidable raw HTML.
- **Access control:** on every request, the user must own or be permitted on that specific resource (IDOR).
- **Passwords:** argon2, bcrypt (cost ≥ 12) or scrypt from a vetted library. Session secret from the secret store, never code.
- **Validation:** a schema at the boundary (shape, lengths, enums, formats); reject with 422 and details; use only the parsed value after.
- **Uploads:** allowlist MIME types, cap size, check magic bytes when it matters, store under a generated name.
- **File storage:** private buckets only. Users get minutes-long, read-only signed URLs for one object, after an ownership check, signed via managed identity (no long-lived account key). Per-tenant prefix (`<owner_id>/...`); the client never picks the full path.
- **SSRF** (server fetches a user-influenced URL): allowlist scheme and host, reject if **any** resolved IP is private or reserved (incl. `169.254.169.254`, IPv6), no redirects.
- **Destructive ops on derived paths:** before delete/move/overwrite, require the symlink-resolved target to be under an **allowlisted root**, at least one level **below** it, with **ownership evidence read beforehand**. A shape check is not authorization. On refusal, log and stop; never fall back to a broader path.
- **Rate limiting:** API generally, auth strictly (~10 attempts / 15 min), 429 with `Retry-After`. Multiple instances or serverless: shared store (e.g. Redis) or API gateway, never in-memory. LLM endpoints also get a per-user token/cost limit.

## 5. Secrets
- Deployed: the cloud's secret store via managed identity, not app settings or CI variables. Prefer identity-based auth over keys.
- Local: a gitignored env file; `.env.example` holds placeholders only.
- Check the staged diff before committing; a secret scanner (e.g. Gitleaks) runs before each PR.
- A secret that reached a remote is compromised: rotate first, then purge history.

## 6. Dependencies
- Use the package manager that the lockfile, `packageManager` and CI agree on; stop on disagreement or competing lockfiles.
- Block install scripts until reviewed; never blanket-approve.
- OSV-Scanner checks every lockfile before each PR. Triage critical/high by reachability; never auto-apply forced fixes; document deferrals with a review date.
- Audits only catch known advisories: review new packages and lockfile diffs (owner, age, provenance, typosquats).

Follow the reference procedure when adding or upgrading dependencies.

## 7. Personal data
- Collect only what a feature needs, for a stated purpose.
- Keep it out of logs, telemetry and LLM prompts.
- Keep it findable: tables keyed by user/owner, not free-text blobs. Classify fields as you add them.
- At launch only: privacy policy, consent, retention, export, real deletion (stores and backups, not a flag), vendor DPAs.
- A privacy incident starts the breach-notification clock; postmortem with `debugging-and-error-recovery`.

## 8. AI / LLM features (OWASP LLM Top 10)
- Model output is untrusted: never into `eval`, SQL, shell, `innerHTML` or file paths. Parse, schema-validate, encode.
- Untrusted text in context can hijack the prompt. The system prompt is not a boundary; enforce permissions in code.
- Keep secrets, other tenants' data and the full system prompt out of the context.
- Scope tools, validate every tool argument, confirm destructive actions.
- Cap tokens, rate and recursion depth. Partition RAG per tenant; validate documents before indexing.

## 9. Before every PR
- Gates pass: secret scan, code scan, dependencies (no reachable unmitigated critical/high), security review of the diff (no Critical/High), and an LLM red-team suite (e.g. promptfoo) when LLM code or prompts changed.
- Review the diff for auth, input, data and privacy, headers and CORS, dependencies, AI/LLM and errors (project security checklist if any). Confirm headers in a real response.
