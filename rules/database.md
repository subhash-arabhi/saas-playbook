# Database and auth

Stack: the database and sign-in method are chosen per project (`.agents/rules/stack.md`).

- **Every user-owned table** has an owner column and created/updated timestamps.
- **Every query on user-owned data is scoped to the caller** (tested per `.agents/rules/testing.md`).
- **Store personal data so it can be found by user**: in tables keyed by user, not inside free-text blobs or other users' records.
- **Migrations** are versioned files in the repo, each with a rollback. They run first on "deploy". Ask before any migration that deletes or rewrites data.
- **Locally**, the same database engine runs in Docker (`docker-compose.yml`).
- **Sessions:** cookies are host-only, `Secure`, `HttpOnly` and `SameSite=Lax` (or `Strict`). Never store auth tokens in localStorage.
- **Rate-limit sign-in and expensive endpoints** using a shared store (e.g. Redis) or an API gateway, never in-memory counters.
