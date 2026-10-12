# Hardening Patterns
<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: language-agnostic pseudocode and tooling; self-contained (worked destructive-path example included); cloud-agnostic; trimmed. -->

Detail for the `security-and-hardening` skill, as language-neutral pseudocode. Translate to your stack. Read only the section you need.

## Threat Modeling (STRIDE)

| Threat | Ask | Typical mitigation |
|---|---|---|
| **S**poofing | Can someone impersonate a user/service? | Authentication, signature verification |
| **T**ampering | Can data be altered in transit or at rest? | Integrity checks, parameterized queries, HTTPS |
| **R**epudiation | Can an action be denied later? | Audit logging of security events |
| **I**nformation disclosure | Can data leak? | Encryption, field allowlists, generic errors |
| **D**enial of service | Can it be overwhelmed? | Rate limiting, input size caps, timeouts |
| **E**levation of privilege | Can a user gain rights they shouldn't? | Authorization checks, least privilege |

## OWASP Top 10 Prevention Patterns

### Injection

```text
# BAD
query("SELECT * FROM users WHERE id = '" + user_id + "'")
# GOOD (placeholder syntax varies: ?, $1, %s, :id)
user = query("SELECT * FROM users WHERE id = ?", [user_id])
user = users.find_one(where: { id: user_id })   # ORM with bound parameters
```

Same rule for every interpreter: shell (argument list, never a concatenated string), LDAP, NoSQL filters, template engines.

### Broken Authentication

Never write your own hashing or comparison.

```text
hashed   = password_hash(plaintext)              # argon2id / bcrypt(cost=12) / scrypt
is_valid = password_verify(plaintext, hashed)    # constant-time

session_config:
  secret: from secret store, not code
  save_uninitialized: false     # no session until the user does something
  cookie: { HttpOnly: true, Secure: true, SameSite: Lax, Max-Age: 24h }
```

### Cross-Site Scripting (XSS)

```text
# BAD
element.innerHTML = user_input
render_unescaped(template, user_input)
# GOOD: auto-escaping (React, Jinja2, Go html/template, ...)
render(template, { text: user_input })
# Raw HTML only after a vetted sanitizer: DOMPurify (browser), nh3 (Python), bluemonday (Go)
clean = sanitize_html(user_input)
```

### Broken Access Control

```text
PATCH /api/tasks/{id}   (authenticated)
  task = tasks.find_by_id(id)
  if task is null or task.owner_id != current_user.id:
    return 403 { error: { code: "FORBIDDEN", message: "Not authorized to modify this task" } }
    # return 404 instead if revealing existence is itself a leak
  return 200 tasks.update(id, validated_body)
```

### Security Misconfiguration

Use security-headers middleware (e.g. helmet) or set headers at the edge.

```text
apply_security_headers(app)   # HSTS, nosniff, frame-ancestors, referrer policy, ...

Content-Security-Policy:
  default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';  # tighten if possible
  img-src 'self' data: https:; connect-src 'self'

cors:   # only if a separate client needs it
  allowed_origins: config.ALLOWED_ORIGINS   # explicit list; default to local dev origin only
  allow_credentials: true
```

### Sensitive Data Exposure

```text
to_public_user(user):            # explicit allowlist of returned fields
  return { id: user.id, name: user.name, email: user.email }

api_key = secrets.get("payments-api-key")      # secret store or env injected from it
if api_key is empty: fail_startup("payments-api-key not configured")   # fail fast
```

### Server-Side Request Forgery (SSRF)

```text
ALLOWED_HOSTS = { "hooks.example.com" }

assert_safe_url(raw):
  url = parse_url(raw)
  if url.scheme != "https": reject("https only")
  if url.host not in ALLOWED_HOSTS: reject("host not allowed")
  for ip in dns_resolve_all(url.host):           # A and AAAA; one bad address fails
    if not is_public_unicast(ip): reject("private/reserved IP")
  return url

http_get(assert_safe_url(request.body.webhook_url), follow_redirects: false)
```

`is_public_unicast` (stdlib or vetted helper) must cover loopback, link-local `169.254.169.254` (cloud metadata, the top SSRF target), private and unique-local ranges, IPv4 and IPv6.

**TOCTOU gap:** the HTTP client resolves DNS again after the check, so a short-TTL record can rebind to an internal IP. For high-risk surfaces, resolve once and connect to the pinned IP, or route through a filtering egress proxy or SSRF-filtering client (e.g. `request-filtering-agent` / `ssrf-req-filter` in Node).

## Input Validation Patterns

### Schema Validation at Boundaries

Use a schema validator (Zod, Pydantic, JSON Schema, go-playground/validator) at every entry point.

```text
CreateTask schema:
  title:       string, trimmed, length 1..200
  description: string, max length 2000, optional
  priority:    one of ["low", "medium", "high"], default "medium"
  due_date:    ISO 8601 datetime, optional
  (unknown fields rejected)

POST /api/tasks
  result = CreateTask.validate(request.body)
  if result.failed:
    return 422 { error: { code: "VALIDATION_ERROR", message: "Invalid input", details: result.errors } }
  return 201 tasks.create(result.data)    # typed, validated
```

### File Upload Safety

```text
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE = 5 MB
validate_upload(file):
  if file.content_type not in ALLOWED_TYPES: reject("File type not allowed")
  if file.size > MAX_SIZE: reject("File too large (max 5MB)")
  # Trust neither extension nor client-sent type: check magic bytes if critical
  # Store under a generated name, never the user-supplied filename
```

### Destructive Operations on Derived Paths

A shape check ("absolute path, at least one directory deep") proves well-formedness, not authorization; that is how a cleanup deletes the root instead of the leaf. Read ownership evidence *before* the operation and before any teardown removes it, or "absent" and "not mine" look the same.

```text
ALLOWED_ROOTS = ["/var/lib/myapp/sessions"]   # an allowlist, not a pattern
MIN_DEPTH = 1                                 # a root is never the target

resolve_deletable(candidate, expected_owner):
  target = real_path(absolute(candidate))     # symlinks resolved BEFORE the check

  in_root = any root in ALLOWED_ROOTS where:
    rel = relative_path(from: root, to: target)
    # Reject "" (the root), "..", anything starting with ".." + separator, or an absolute rel
    # (different drive). Not a plain starts_with(".."): that rejects a child named "..cache".
    rel is not "" and rel != ".." and not rel.starts_with(".." + SEP) and not is_absolute(rel)
    and count_segments(rel) >= MIN_DEPTH
  if not in_root: refuse("outside allowed roots", target)

  owner = read_file(join(target, ".owner")) or null
  if trim(owner) != expected_owner: refuse("unproven owner", target)
  return target
```

Limits of this check:
- **A marker inside the tree is self-attestation:** anything that can write there can write it. The expected owner must come from authenticated state, and the marker needs integrity protection (restrictive ownership, or a MAC) before it counts as authorization.
- **Resolve-then-operate-by-name is a check/use race** where an untrusted process can swap an ancestor. On a shared volume, hold the target by descriptor and use no-follow, beneath-the-root operations, or ensure the hierarchy can't change meanwhile.

## Dependencies and Supply Chain

1. **Find the installation boundary and manager.** Use the workspace root that owns the lockfile, or an independent nested project only when it is outside that workspace. Corroborate `packageManager` (when present), the lockfile and CI; stop on disagreement or competing lockfiles. Pin the manager version.
2. **Block dependency scripts before first execution.** Bootstrap with scripts disabled or a documented fail-closed policy, inspect the pending script source, approve only the minimum, commit the policy, then verify with a clean frozen/immutable install.
3. **Check before every PR.** OSV-Scanner checks every committed lockfile, any language. Triage critical/high by reachability (runtime, build, test, deploy paths) and fix availability. Never apply forced remediation (`npm audit fix --force`, bulk-upgrading everything to latest): it may cross declared ranges. Preview, read changelogs, test each upgrade.
4. **Review what audits can't see.** Audits match known advisories only, not a new malicious or typosquatted package (`cross-env` vs `crossenv`). Review new dependencies, lockfile diffs and script-policy changes together: ownership, maintenance, release age, provenance, transitive graph. Verify signatures or provenance where supported (`npm audit signatures`, hash-pinned Python installs, Go's checksum database); treat absence as a signal to investigate, not proof of compromise.

## Dependency Audit Triage

Audits (`npm audit`, `pip-audit`, `govulncheck`, `cargo audit`, OSV-Scanner) report known advisories; they don't prove reachability or trustworthiness.

```text
├── Critical or high
│   ├── Reachable in runtime, build, test or deploy paths? YES → fix now (update, patch, replace)
│   │                                                       NO (confirmed) → fix soon, not a blocker
│   └── Fix available? YES → update to patched version
│                      NO  → workaround, replace, or allowlist with a review date
├── Moderate: reachable in production → next release; dev-only → backlog
└── Low: fix in regular dependency updates
```

Ask: is the vulnerable function called (reachability tools like `govulncheck` help)? Runtime or dev-only? Exploitable in this deployment (e.g. a server-side flaw in a client-only app)? Document every deferral with a reason and a review date.

## Rate Limiting

```text
rate_limit("/api/*",      limit: 100, window: 15 min, key: client_ip or user_id)
rate_limit("/api/auth/*", limit: 10,  window: 15 min)
# send standard RateLimit-* headers (not legacy X-RateLimit-*); on exceed: 429 with Retry-After
```

In-memory counters give `limit × instances` behind a load balancer, and reset per invocation on serverless or edge (the auth limit may never fire). Use a shared store or an API gateway (which also works without a long-lived store connection):

```text
allowed = shared_limiter.check(key: "login:" + client_ip, limit: 10, window: 15 min)   # Redis-backed sliding window
if not allowed: return 429
```

## Secrets Management

```text
.env.example  → committed (placeholders)
.env.local    → NOT committed (real local secrets)

.gitignore: .env  .env.local  .env.*.local  *.pem  *.key
```

```bash
git diff --cached | grep -i "password\|secret\|api_key\|token"   # before every commit
```

If a secret is committed, deleting the line or rewriting history is not enough: revoke and reissue first, then purge history.

## Data Classification

| Class | Examples | Handling |
|---|---|---|
| **Non-personal** | Aggregates, anonymized counts | Normal |
| **Personal (PII)** | Name, email, IP, device/user IDs | Minimize, access-control, include in export/delete |
| **Sensitive** | Health, finance, location, biometrics, gov IDs, anything about minors | Extra basis to collect, stricter access, often encryption + audit logging |

## LLM Output Handling

```text
# BAD
query(llm.generate("Write SQL for: " + user_question))   # arbitrary query
element.innerHTML = llm.reply(user_message)                # stored XSS via the model

# GOOD: output is data — parse, validate, then encode
try:
  intent = CommandSchema.validate(parse_json(llm.reply_json(user_message)))
except (parse or validation error):
  reject("unexpected model output")
run_allowlisted_action(intent.action, intent.params)       # fixed allowlist of actions
element.textContent = llm.reply(user_message)              # text, never HTML
```

Optional runtime guard: a prompt-injection classifier (e.g. the cloud's AI content-safety service) can screen user input and retrieved documents before they reach the model. Defence in depth only, never a replacement for permissions in code.

OWASP LLM Top 10 (2025) mapping: output handling LLM05, prompt injection LLM01, sensitive data / system-prompt leakage LLM02 / LLM07, excessive agency LLM06, unbounded consumption LLM10, vector/embedding weaknesses LLM08, supply chain LLM03.
