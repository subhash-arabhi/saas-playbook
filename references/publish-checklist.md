# Publish Checklist

**Use this only before releasing an app to real users** (`.agents/workflows/publish.md`). That's rare: most projects are personal tools and never need it. It is **not** part of normal building, push or deploy.

> This is a practical starting point, **not legal advice.** Requirements depend on where your users are (e.g. GDPR in the EU/UK, CCPA in California, the DPDP Act in India) and on what you sell. Generated policies are a draft. Have a lawyer review them once real money or sensitive data is involved.

Each item: **what to check**, then **how to do it**.

## 1. Legal pages
Link all of these from the website footer, and have them render without JavaScript (some providers, e.g. Google OAuth verification, check this).

- [ ] **Privacy policy** (`/privacy`):
  - What data you collect, why, and where it's stored (the cloud region).
  - Every third party it's shared with (use the "Outside services" table in `ARCHITECTURE.md`).
  - How long you keep it.
  - How users can export or delete it.
  - Contact details. A last-updated date.
- [ ] **Terms of service** (`/terms`):
  - Who can use the service, and acceptable use.
  - Account termination, liability limits, governing law.
  - How changes to the terms are announced.
- [ ] **Refund policy** (`/refunds`), if you take payments:
  - When refunds are given and how to request one.
  - Timelines.
  - Must match what the payment provider (Stripe or Razorpay) shows.
- [ ] **Cookie policy** (`/cookies`, or a section of the privacy policy):
  - Every cookie and local-storage item, its purpose, its duration, and whether it's essential.
- [ ] **Business details** on the site (footer or `/contact`):
  - Legal business name, registered address, contact email.
  - Tax or registration numbers where required (e.g. GSTIN in India, VAT in the EU).
  - Payment providers usually require these too.

## 2. Consent
- [ ] **Cookie consent banner**, if you use any non-essential cookies (analytics, ads, a monitoring browser SDK when it sets cookies):
  - No non-essential cookies before the user agrees.
  - "Reject" is as easy as "Accept".
  - The choice is remembered and can be changed later.
- [ ] **Form consents** are checked:
  - Checkboxes are unticked by default.
  - Marketing consent is separate from accepting the terms.
  - Each consent says exactly what it's for.
  - Record when and what each user agreed to.
- [ ] **Age consent:**
  - Decide a minimum age (commonly 13, or 16 in parts of the EU) and ask at signup.
  - If children could use it, check the stricter rules (COPPA in the US, parental consent under GDPR and India's DPDP Act) before launching.
- [ ] **Unsubscribe link in every marketing email.** One click, no login needed, honoured quickly. Transactional emails (receipts, password resets) are exempt but must not contain marketing.

## 3. Data
- [ ] **No unnecessary data:**
  - Every personal field has a stated purpose.
  - Remove fields and logs you don't need.
  - Personal data stays out of logs, telemetry and LLM prompts (`.agents/skills/security-and-hardening`).
- [ ] **Audit third-party SDKs and services:**
  - List every SDK, script and outside service, and what data each receives (analytics, monitoring, LLM providers, payments, email).
  - Each one is named in the privacy policy, has a data-processing agreement where required, and is actually needed.
  - Remove unused ones.
- [ ] **Data deletion requests:**
  - A user can delete their account and data, from the app or by a documented request.
  - Deletion really removes it from the database, file storage (Blob), caches, search indexes and analytics.
  - Backups age out within the stated retention period.
  - **Data export** works too, where required (GDPR).
- [ ] **Retention:** every store of personal data has a retention limit, and something actually deletes old data.

## 4. Honest product
- [ ] **No dark patterns:**
  - Cancelling is as easy as signing up.
  - No pre-ticked upsells, no "confirmshaming" ("No, I don't want to save money").
  - No fake urgency or countdowns.
  - No hidden auto-renewals.
- [ ] **No hidden fees:**
  - The full price, including taxes and any recurring charge, is shown before payment.
  - Trials state what happens when they end, and when the user will be charged.
- [ ] **No fake reviews or testimonials.** Only real ones, with permission. No invented user counts or logos of companies that aren't customers.
- [ ] **No unsupported claims.** Remove or prove claims like "#1", "100% secure", "guaranteed results", "bank-level encryption", or any health or financial promises. Be careful with what the AI features are said to do.

## 5. Accessibility
Target: **WCAG 2.2 level AA**. The full checklist is in [`accessibility-checklist.md`](accessibility-checklist.md). At minimum:
- [ ] **Alt text:** every meaningful image has a text description. Decorative images use `alt=""`.
- [ ] **Colour contrast:** text is at least 4.5:1 (3:1 for large text and UI controls). Colour is never the only signal.
- [ ] **Keyboard navigation:**
  - Everything works with Tab, Enter and Escape.
  - Focus is always visible.
  - Pop-ups hold focus while open and give it back on close.
- [ ] **Automated scan:** run an accessibility scanner (e.g. axe-core) over the core flows and fix serious violations. A manual keyboard-only pass covers what scanners miss.

## 6. Assets and licenses
- [ ] **License every asset:**
  - Fonts, images, icons, illustrations, video and music have licenses that allow commercial use.
  - Keep a record of where each came from.
  - AI-generated assets: check the generator's terms allow commercial use.
- [ ] **Open-source licenses:**
  - Dependencies' licenses allow your use.
  - Required attribution notices are included (e.g. a "Licenses" page or file).
  - Watch for copyleft licenses (GPL/AGPL) in anything you distribute.

## 7. Domain and Cloudflare
**The user** buys the domain, creates the Cloudflare account, and puts a scoped Cloudflare API token in `.env.local`. **The agent never buys a domain or signs up for anything.** Cloudflare changes are made with its API or CLI and recorded in `ARCHITECTURE.md`. The domain, zone ID and similar values go in `.env.local`, referenced by key.
- [ ] **Domain on Cloudflare DNS:** the domain's nameservers point to Cloudflare; DNSSEC on.
- [ ] **App on the custom domain:** the domain (and `www`, redirected to one canonical host) points to the cloud app. The domain is added to the app with a valid certificate. Cloudflare proxy is on (orange cloud).
- [ ] **TLS:** SSL mode **Full (strict)**, "Always use HTTPS" on, HSTS on once everything works, minimum TLS 1.2.
- [ ] **The origin can't be bypassed:** the app accepts traffic only from Cloudflare, by IP allowlist, Authenticated Origin Pulls, or a Cloudflare Tunnel. The old cloud URL is blocked or redirected.
- [ ] **Caching:** static assets cached at the edge. `/api/*` and anything personalised bypass the cache (the app's `Cache-Control: private, no-store` is respected).
- [ ] **Protection:**
  - Cloudflare's free managed WAF rules and DDoS protection on.
  - A rate-limiting rule on `/api/*`, stricter on sign-in and AI endpoints.
  - Bot protection on; Turnstile on sign-up and other public forms if bots are a problem.
- [ ] **Email DNS** (only if the app sends email): SPF, DKIM and DMARC records set for the sending service.
- [ ] **App config updated:** the app's public URL, allowed origins, OAuth redirect URLs, cookie settings, monitoring availability tests and smoke check all use the new domain.
- [ ] **`ARCHITECTURE.md` updated:** the `.env.local` keys for the domain and Cloudflare zone, the Cloudflare settings, how the origin is locked down, and the rollback (turning the proxy off).

## Sign-off
- [ ] Every item above is done, or marked "not applicable" with a reason
- [ ] `ARCHITECTURE.md` lists the legal pages and where consent and deletion are handled
- [ ] The user has reviewed the results and approved going live
