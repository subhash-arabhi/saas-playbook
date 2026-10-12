# Stack and hosting

## Choosing the stack
- **Fixed for every project:** Tailwind CSS for styling (`.agents/rules/frontend.md`).
- **Everything else is chosen per project.** For each project, **you pick the most suitable stack** within the project's cloud (named in `AGENTS.md` → Project-specific; if none is named, ask the user). That covers frontend framework, backend, database, auth, storage, queues and AI services.
- **Priorities, in order:**
  1. Fits the product's needs
  2. Low cost at small scale
  3. Managed services over self-run
  4. Few moving parts; one language across frontend and backend where natural
  5. Mature, well documented, well known to coding agents
- **Propose it with the project's first plan:** one **Changes** bullet names the stack, and the plan's first step writes it into `ARCHITECTURE.md` with a one-line reason per choice. The user's approval of that plan approves the stack.
- **Don't change the stack** without the user's approval.

## Hosting
- **The whole app runs in the project's cloud:** website, API, database, storage, jobs and AI calls.
- **One public address** for website and API: pages at `/…`, the API at **`/api/…`**, so there's no CORS. **By default it's the cloud app's own URL.** A custom domain, with Cloudflare in front, is set up on `/publish`, or earlier only when the user asks.
- **Every security check lives in the app.** Nothing in front of it is trusted to protect it.
