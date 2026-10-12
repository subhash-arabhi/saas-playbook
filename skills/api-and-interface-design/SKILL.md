---
name: api-and-interface-design
description: Guides stable API and interface design. Use when designing or changing API endpoints, contracts between the website and the API, module boundaries, or any public interface.
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: default conventions (camelCase, <domain>/api/<resource>, no versioning, OpenAPI + generated client), deploy-window compatibility, auth/health rules, language-agnostic, trimmed; layered: general guidance here, playbook decisions in .agents/rules/. -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/backend.md` and `.agents/rules/deployment.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# API and Interface Design

Design interfaces that are stable and hard to misuse. Applies to the website's API, module boundaries, UI component inputs, and any surface where one piece of code calls another. Internal callers are still callers: give them a contract too.

## Defaults (a project's rules override these)

| Topic | Default |
|---|---|
| Base URL | `https://<domain>/api/<resource>`, same address as the website (no subdomain, no CORS) |
| Versioning | None. One version, changed only by adding. `/v1` only if outside customers call the API directly |
| Casing | JSON fields and query params camelCase; enums and error codes UPPER_SNAKE; booleans `is`/`has`/`can` prefix |
| Contract | OpenAPI spec generated from the code's request/response schemas, committed |
| Website client | Types and client generated from the spec, never hand-written. Regenerate on every API change |
| Auth | Every endpoint declares who may call it. Default deny. Public endpoints explicitly marked public |
| Health | `GET /api/health`, no auth, OK when the API can serve requests. Deploy smoke checks use it |
| Errors | One shape: `{ "error": { "code", "message", "details?" } }` |
| Lists | Paginated from the start, `pageSize` capped |

## The deploy window

When database, API and website deploy one after another, the live website briefly talks to the new API.
- Every API change must keep working with the website that's live now. Add fields and endpoints; never rename, remove or change the type of anything the live website uses in the same deploy.
- Remove or rename in two deploys: (1) add the new thing and switch the website to it; (2) once live, check nothing still calls the old one (logs or code search), then remove it.
- Migrations follow the same rule: the old API must still work with the migrated schema.

## Principles

- **Every observable behaviour is a contract** (Hyrum's Law): error text, ordering, timing, quirks. Expose only what you mean to; don't leak implementation details.
- **One version at a time.** Extend, don't fork.
- **Contract first.** Write the request/response schemas before the logic, so the spec and generated client exist first.
- **Addition over modification.** New input fields are optional. Never remove a field or change its type in place.
- **One response shape per endpoint.** Don't return different shapes depending on conditions. Don't mix throwing, returning null and returning `{ error }`.

## Errors

| Status | Meaning |
|---|---|
| 400 | Malformed request |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Not found, including a resource that belongs to someone else |
| 409 | Conflict: duplicate, version mismatch, in-flight idempotent request |
| 422 | Validation failed (`code: "VALIDATION_ERROR"`, field errors in `details`) |
| 429 | Rate limited |
| 500 | Server error; never expose internal details |

## Validate at boundaries only

Validate at: API route handlers; website forms (for UX only, the API still validates); outside-service responses (always untrusted: check shape and content before using them in logic or rendering); config loading (fail fast on missing required settings).

Don't validate between internal functions that share types, in utilities called by validated code, or on data from your own database. After validation, internal code trusts the typed value.

## REST patterns

- Plural nouns, no verbs: `GET/POST /api/tasks`, `GET/PATCH/DELETE /api/tasks/{id}`, sub-resources as `/api/tasks/{id}/comments`.
- Scope user-owned resources to the caller: someone else's `{id}` returns 404, lists return only the caller's data. Add a test that proves it.
- Pagination: page-based by default (`?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc` → `{ data, pagination: { page, pageSize, totalItems, totalPages } }`). Use cursors (`?cursor=` → `nextCursor`) for very large or constantly changing lists.
- Filters are query params: `?status=IN_PROGRESS&createdAfter=2025-01-01`.
- Updates use PATCH with partial objects: only provided fields change.
- `DELETE` is idempotent: succeeds even if already deleted.

## Types

- Model distinct states as explicit variants (tagged union or a `type` field), not one shape full of optional fields. Code handling them must cover every variant; a compiler or test catches a missing case.
- Separate input from output types. Never accept server-owned fields (`id`, `createdAt`, `ownerId`) from the caller.
- Give each kind of ID its own type where the language allows, so a `UserId` can't pass as a `TaskId`.

## Idempotency

State-changing endpoints either honour an idempotency key or are documented as unsafe to retry. Design for at-least-once delivery: no queue gives exactly-once across a consumer crash. When implementing an idempotency key (payments, external side effects, queue consumers), read `references/idempotency.md`.

## Done when

- OpenAPI spec regenerated and committed; website client regenerated from it.
- Changes are additive; the live website still works with the new API.
- `GET /api/health` still works.
