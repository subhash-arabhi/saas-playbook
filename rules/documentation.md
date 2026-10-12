# Documentation

Keep docs minimal and **always current**, describing the current state, not history.

## Private values (strict)
Everything committed can be made public on GitHub. **Anything that shouldn't be public goes only in `.env.local`,** and committed files refer to it by key.
- **Private values include:**
  - secrets: API keys, passwords, tokens, connection strings (deployed copies live in the cloud's secret store; docs name the secret, never its value)
  - cloud account details: account, subscription, project and tenant names and IDs
  - cloud resource details: the resource group and resource names (many become public hostnames), resource IDs, URLs, hostnames and service endpoints (AI, database, storage, secret store, registry, etc.)
  - the production URL and any cloud app URLs, until the user publishes the product
  - cloud portal and dashboard links
  - personal details: names, emails, phone numbers (e.g. who receives alerts)
- **If in doubt, it's private.**
- **Never in committed files:** code, docs, plans, `infra/`, tests, commit messages, PR descriptions.
- **One UPPER_SNAKE key per value in `.env.local`** (gitignored), e.g. `CLOUD_ACCOUNT`, `CLOUD_RESOURCE_GROUP`, `PUBLIC_URL`, `AI_ENDPOINT`, `ALERT_EMAIL`. `.env.example` lists every key with a placeholder and a one-line comment.
- **Committed files refer to the key,** e.g. "Resource group: `.env.local` → `CLOUD_RESOURCE_GROUP`".
- **Code and `infra/` never hardcode them.** Code reads them from config. `infra/` takes names as parameters, and scripts read them from `.env.local`.
- **When you create or find a value, add it to `.env.local` straight away.** If one is missing, look it up with the cloud CLI or ask the user. Never guess.
- **Fine to commit:** `localhost` URLs, paths (`/api/health`), regions, service types and tiers, naming patterns (e.g. `<project>-rg`), and links to public docs.

| File | Contains | Update |
|---|---|---|
| `ARCHITECTURE.md` (`.agents/templates/ARCHITECTURE.md`) | The high-level design: every section of the template, kept true | **In every PR.** At minimum, bump "Last updated" |
| `DESIGN.md` (`.agents/templates/DESIGN.md`) | Themes, tokens and every UI component | Before or with every UI change that needs something new or looks different |
| `README.md` | What the project is, and how to install, run and test it | When run or test steps change |
| `.env.example` | Every setting the app reads and every private-value key, placeholder values only. Real values go in `.env.local` (gitignored) and the cloud's secret store | When a setting or key is added, renamed or removed |
| OpenAPI spec | The API contract, generated from code | When the API changes |

- Lasting decisions go in `ARCHITECTURE.md` → "Known gaps and decisions". Plans list changes only.
