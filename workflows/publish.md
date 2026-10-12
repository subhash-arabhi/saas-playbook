# Workflow: Publish

Trigger: **`/publish`**, meaning the app is about to be offered to real users (rare). Follow every step in order. This does not deploy anything.

1. **Go through `.agents/references/publish-checklist.md`** against the running app and the code: legal pages, consent, data, honest product, accessibility, asset licenses, domain and Cloudflare.
   - For the domain and Cloudflare: if the user hasn't bought a domain or set up Cloudflare yet, list what they need to do first (buy the domain, create the account, add a scoped API token to `.env.local`). Never buy or sign up yourself.
   - For accessibility, run `.agents/skills/web-design-guidelines/SKILL.md` in **publish mode** (all rules, including `[a11y]`), plus an accessibility scanner (e.g. axe-core) over the core flows, at desktop and mobile sizes.
2. **Report** each checklist item as **done**, **missing** (what's needed) or **not applicable** (why).
3. **Write a plan** for the gaps in `plans/publish-<date>.md`. Don't fix anything yet. Legal pages and consent need the user's input (business details, countries, refund terms). The domain and Cloudflare setup is its own step, deployed with `/deploy` like any other change.
4. Policies you draft are drafts. Tell the user to have a lawyer review them once real money or sensitive data is involved.
5. After the fixes are deployed, **re-run the checklist** and record the sign-off date in `ARCHITECTURE.md` → "Known gaps and decisions".
