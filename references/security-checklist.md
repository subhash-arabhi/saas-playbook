# Security Checklist
<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: language-agnostic pseudocode and tooling. -->

Quick reference for web application security, whatever language the project uses. Use alongside the `security-and-hardening` skill. Code examples are language-neutral pseudocode; translate them into your stack's idioms.

## Threat Modeling (Start Here)

Before reaching for controls, spend five minutes thinking like an attacker:

- [ ] Trust boundaries mapped (requests, uploads, webhooks, third-party APIs, LLM output, and local values written by processes you don't control)
- [ ] Assets named (credentials, PII, payment data, admin actions, money movement)
- [ ] STRIDE run per boundary (Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation)
- [ ] Abuse cases written next to use cases ("how would I misuse this?")

## Pre-Commit Checks

- [ ] No secrets in code (`git diff --cached | grep -i "password\|secret\|api_key\|token"`; Gitleaks in `scripts/pre-pr.sh` catches more)
- [ ] `.gitignore` covers: `.env`, `.env.local`, `*.pem`, `*.key`
- [ ] `.env.example` uses placeholder values (not real secrets)
- [ ] No secrets in browser-visible config (`VITE_` / `NEXT_PUBLIC_` variables ship to the client); deployed secrets come from the cloud's secret store via managed identity

## Authentication

- [ ] Passwords hashed with argon2, bcrypt (cost ≥ 12), or scrypt, from the standard library or a vetted package
- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] Session expiration configured (reasonable max-age)
- [ ] Rate limiting on login endpoint (≤10 attempts per 15 minutes), counted in a shared store (e.g. Redis) or at an API gateway
- [ ] Password reset tokens: time-limited (≤1 hour), single-use
- [ ] Account lockout after repeated failures (optional, with notification)
- [ ] MFA supported for sensitive operations (optional but recommended)

## Authorization

- [ ] Every protected endpoint checks authentication
- [ ] Every resource access checks ownership/role (prevents IDOR)
- [ ] Admin endpoints require admin role verification
- [ ] API keys scoped to minimum necessary permissions
- [ ] JWT tokens validated (signature, expiration, issuer)

## Input Validation

- [ ] All user input validated at system boundaries (API routes, form handlers) with a schema validator (e.g. Zod, Pydantic, JSON Schema)
- [ ] Validation uses allowlists (not denylists)
- [ ] String lengths constrained (min/max)
- [ ] Numeric ranges validated
- [ ] Email, URL, and date formats validated with proper libraries
- [ ] File uploads: type restricted, size limited, content verified
- [ ] SQL queries parameterized (no string concatenation)
- [ ] HTML output encoded (use framework/template auto-escaping)
- [ ] URLs validated before redirect (prevent open redirect)
- [ ] Server-side URL fetches allowlisted; private/reserved IPs blocked (prevent SSRF)
- [ ] Destructive path operations (delete/move/overwrite): symlinks resolved, allowlisted root, minimum depth, ownership evidence read before the call

### Destructive Path Operations

For deleting or overwriting a path derived from data, use the containment pattern in `.agents/skills/security-and-hardening/references/hardening-patterns.md` → "Destructive Operations on Derived Paths".

## Security Headers

Set via security-headers middleware (e.g. helmet, your framework's secure-headers support) or at the edge/gateway:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  (disabled, rely on CSP)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## CORS Configuration

```text
# Restrictive (recommended): explicit origins from config
cors:
  allowed_origins:   ["https://yourdomain.com", "https://app.yourdomain.com"]
  allow_credentials: true
  allowed_methods:   [GET, POST, PUT, PATCH, DELETE]
  allowed_headers:   [Content-Type, Authorization]

# NEVER in production:
cors:
  allowed_origins: "*"    # allows any origin
```

## Data Protection

- [ ] Sensitive fields excluded from API responses (password hashes, reset tokens, etc.)
- [ ] Sensitive data not logged (passwords, tokens, full CC numbers)
- [ ] PII encrypted at rest (if required by regulation)
- [ ] HTTPS for all external communication
- [ ] Database backups encrypted
- [ ] Personal data is classified, collected against a stated purpose, and minimized
- [ ] Personal data has a retention limit and a working deletion path (incl. backups, caches, indexes)
- [ ] Export/delete (data-subject) requests are supported where required; third-party sharing has consent and a data-processing agreement

## Dependency Security

First locate the **installation boundary**. If the package belongs to a workspace declared by a parent (npm/pnpm/Yarn workspaces, a uv or Cargo workspace, a Go workspace), use that workspace root; otherwise use the nearest project root that owns both its manifest and dependency graph. At that boundary, corroborate the declared manager/toolchain (e.g. the `packageManager` field, a pinned tool version), the lockfile, and CI commands. Stop if they disagree or competing lockfiles for the same ecosystem exist there. A nested project is independent only when it is outside the parent workspace; independent subprojects may legitimately use different managers.

| Manager/version signal | Frozen/locked CI install | Known-advisory audit |
|---|---|---|
| npm (`package-lock.json` or `npm-shrinkwrap.json`) | `npm ci` | `npm audit` |
| pnpm | `pnpm install --frozen-lockfile` | `pnpm audit` |
| Yarn 2+ | `yarn install --immutable` | `yarn npm audit -A -R` |
| Yarn 1 | `yarn install --frozen-lockfile` | `yarn audit` |
| uv (`uv.lock`) | `uv sync --locked` | `pip-audit` |
| pip (`requirements.txt` with hashes) | `pip install --require-hashes -r requirements.txt` | `pip-audit -r requirements.txt` |
| Go modules (`go.sum`) | `go mod download && go mod verify` | `govulncheck ./...` |
| Cargo (`Cargo.lock`) | `cargo build --locked` | `cargo audit` |
| Any lockfile | (as above) | OSV-Scanner (runs in `scripts/pre-pr.sh`) |

For an unlisted manager or version, consult its official documentation; do not substitute another manager's commands or newer defaults.

### Install-Script Gate

Principle: install-time scripts and build hooks run arbitrary dependency code on the developer machine and in CI. Block or review them before their first execution, and install only from a frozen/locked lockfile. Never discover dependency lifecycle scripts or build hooks by first executing an ordinary install on a client whose defaults have not been verified.

1. Bootstrap with dependency scripts/builds disabled, or with a documented default-deny policy plus fail-closed enforcement.
2. Inspect the exact script or build source and package version before approval.
3. Record the narrowest native allow/deny policy at the installation boundary and commit it.
4. Run a clean frozen/locked install with that policy and verify the required packages still build.

**Point-in-time snapshot:** Package-manager defaults and command names change quickly. Verify these against the pinned client's current official documentation before relying on them.

| Ecosystem / manager | Native policy |
|---|---|
| npm | Without verified granular approvals: bootstrap with `npm ci --ignore-scripts`, or persist `ignore-scripts=true` for project-wide blocking, until you deliberately upgrade. 11.18.x (verified 11.18.0): unreviewed scripts run with a warning by default, so enforce `strict-allow-scripts=true` before a normal install, then review with the workspace-unaware `npm install-scripts ls` from the installation boundary; keep approvals version-pinned and denials name-wide. 12.x (verified 12.0.1): unreviewed scripts are skipped by default and `strict-allow-scripts=true` fails the install before execution; same review flow. |
| pnpm | 11+: `pnpm approve-builds`, commit `allowBuilds`; `strictDepBuilds` defaults to `true`. 10.26–10.x: configure `allowBuilds` (or `approve-builds` with legacy `onlyBuiltDependencies` / `ignoredBuiltDependencies`) and set `strictDepBuilds: true` (v10 default `false`). 10.1–10.25: `approve-builds` records the legacy lists; enable `strictDepBuilds` where supported (10.3+). Older/unknown: `pnpm install --frozen-lockfile --ignore-scripts` and keep scripts disabled. |
| Yarn | 4.14+: dependency postinstalls disabled by default. 2–4.13: set `enableScripts: false` in `.yarnrc.yml`. Both: grant only required exceptions with top-level `dependenciesMeta.<package>.built: true`; never enable scripts globally. Yarn 1: `yarn install --ignore-scripts`, with each required exception reviewed under the pinned client's documented workflow. |
| Python (pip, uv) | Source distributions run build-backend code at install time. Install with `--require-hashes` (pip) or from `uv.lock` with `--locked`; prefer wheels (`pip install --only-binary :all:`, `uv sync --no-build`) and review any package that must build from source. |
| Go | Module downloads run no dependency code; `go generate` never runs automatically, so review generators before running them. |
| Rust | `build.rs` scripts and proc macros run at build time with no native block; review new or changed ones (e.g. `cargo vet`) or build in a sandbox. |

Authoritative checks: [npm install-scripts](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/), [install policy](https://docs.npmjs.com/cli/v11/commands/npm-install/), and [CLI releases](https://github.com/npm/cli/releases); [pnpm approve-builds](https://pnpm.io/cli/approve-builds) and [build settings](https://pnpm.io/settings#allowbuilds); [Yarn security](https://yarnpkg.com/features/security) and [manifest](https://yarnpkg.com/configuration/manifest#dependenciesMeta); [pip secure installs](https://pip.pypa.io/en/stable/topics/secure-installs/).

**Supply-chain hygiene** (advisory audits do not catch newly malicious packages):
- [ ] Exactly one authoritative lockfile per project/workspace root is committed and CI never rewrites it
- [ ] Critical/high findings are triaged for reachability; deferrals have a reason and review date
- [ ] Forced audit remediation (`npm audit fix --force`, `pip-audit --fix`, or equivalent) is never automatic; remediation diffs and changelogs are reviewed
- [ ] Registry signatures/provenance are verified where the manager supports it
- [ ] Dependency lifecycle scripts and build hooks are blocked before first execution and approved only through the pinned manager's native policy
- [ ] New dependencies are reviewed for ownership, maintenance, release age, provenance, transitive graph, and typosquatting

## AI / LLM Security

For any feature that calls an LLM (chatbots, summarizers, agents, RAG):

- [ ] Model output treated as untrusted — never into `eval`/SQL/shell/raw HTML (`innerHTML`, unescaped templates)/file paths
- [ ] Prompt injection assumed; permissions enforced in code, not in the system prompt
- [ ] Secrets, cross-tenant data, and full system prompts kept out of the context window
- [ ] Tool/agent permissions scoped; destructive or irreversible actions require confirmation
- [ ] Token, rate, and recursion/loop limits set (bound consumption)

## Error Handling

```text
# Production: generic error, no internals (log details server-side with a correlation id)
return 500 { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }

# NEVER in production:
return 500 {
  error: err.message,
  stack: err.stack,     # exposes internals
  query: err.sql        # exposes database details
}
```

## OWASP Top 10 Quick Reference

| # | Vulnerability | Prevention |
|---|---|---|
| 1 | Broken Access Control | Auth checks on every endpoint, ownership verification |
| 2 | Cryptographic Failures | HTTPS, strong hashing, no secrets in code |
| 3 | Injection | Parameterized queries, input validation |
| 4 | Insecure Design | Threat modeling, spec-driven development |
| 5 | Security Misconfiguration | Security headers, minimal permissions, audit deps |
| 6 | Vulnerable Components | The ecosystem's dependency audit (`npm audit`, `pip-audit`, `govulncheck`, ...) or OSV-Scanner across all lockfiles, keep deps updated, minimal deps |
| 7 | Auth Failures | Strong passwords, rate limiting, session management |
| 8 | Data Integrity Failures | Verify updates/dependencies, signed artifacts |
| 9 | Logging Failures | Log security events, don't log secrets |
| 10 | SSRF | Validate/allowlist URLs, restrict outbound requests |

## OWASP Top 10 for LLMs Quick Reference

For apps with LLM features. See the [OWASP GenAI Security Project](https://genai.owasp.org/llm-top-10/).

| ID | Risk | Prevention |
|---|---|---|
| LLM01 | Prompt Injection | Don't trust the system prompt as a boundary; enforce permissions in code |
| LLM02 | Sensitive Information Disclosure | Keep secrets/PII out of prompts; filter outputs |
| LLM03 | Supply Chain | Vet models, datasets, and plugins like any dependency |
| LLM04 | Data and Model Poisoning | Use trusted model sources, verify integrity; vet fine-tuning and RAG data |
| LLM05 | Improper Output Handling | Treat model output as untrusted; validate, parameterize, encode |
| LLM06 | Excessive Agency | Scope tool permissions; confirm destructive actions |
| LLM07 | System Prompt Leakage | Assume the system prompt can leak; put no secrets in it |
| LLM08 | Vector and Embedding Weaknesses | Partition RAG embeddings per tenant; validate documents before indexing |
| LLM09 | Misinformation | Ground answers with citations; validate critical claims; keep a human in the loop |
| LLM10 | Unbounded Consumption | Cap tokens, request rate, and loop/recursion depth |
