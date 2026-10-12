# Backend and API

Stack: chosen per project (`.agents/rules/stack.md`). Detail: `.agents/skills/api-and-interface-design/SKILL.md`.

## API conventions
- **URL:** `https://<domain>/api/<resource>`, on the same address as the website (no subdomain, so no CORS). Plural nouns, no verbs (`GET /api/tasks`).
- **No versioning.** Change the API only by **adding**. Never rename, remove or change the type of something the live website uses in the same deploy. Removals and renames take two deploys: add the new one and switch the website to it; once that's live, remove the old one. Migrations must keep the live API version working. Add `/v1` only if outside customers ever call the API directly.
- **JSON fields use camelCase**, in requests and responses. Backends in other languages convert at the boundary. Enums and error codes use UPPER_SNAKE.
- **One error shape:** `{ "error": { "code", "message", "details" } }`, with standard status codes (400, 401, 403, 404, 409, 422, 429, 500).
- **Contract:** an OpenAPI spec generated from the API's schemas and committed. The website's API client and types are **generated from it, never hand-written**. Regenerate both on every API change.
- **Auth:** every endpoint declares who may call it; **the default is deny.** Public endpoints are explicitly marked as public. User-owned resources are scoped to the caller. Someone else's resource returns 404.
- **Validate input at the API boundary** against schemas. Treat outside-service responses as untrusted.
- **Paginate every list endpoint** and cap `pageSize`.
- **`GET /api/health`** always exists, with no auth, and returns OK when the API can serve requests. The deploy smoke check uses it.
- **Slow or unreliable work runs in the background,** not in the request (`.agents/rules/system-design.md`).
- **Required config fails fast** at startup with a clear error. Never default a missing secret.
- **Outside services** are called only through one wrapper module per service, so tests can fake them.
