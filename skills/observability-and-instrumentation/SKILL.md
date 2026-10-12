---
name: observability-and-instrumentation
description: Instruments code so production behavior is visible and diagnosable. Use when adding logging, metrics, tracing or alerting; when shipping a feature, endpoint, background job or integration that runs in production; or when an incident couldn't be diagnosed from the available data. Not for debugging a live failure (use debugging-and-error-recovery).
---

<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: layered (general guidance here, playbook decisions in .agents/rules/); cloud-agnostic; one monitoring service for API + website via OpenTelemetry, request ID across website→API, two alert severities, a runbook entry per alert, cost controls, language-agnostic; trimmed (examples in references/). -->

**Project rules first.** If the project has `.agents/rules/` (installed with the SaaS playbook), read `.agents/rules/deployment.md` and `.agents/rules/security.md` and follow them: they override this skill where they differ. Without them, follow this skill as written.

# Observability and Instrumentation

Write telemetry with the feature, like tests. For worked examples (log lines, entry-point logging, OpenTelemetry setup, metric labels, alert choices, runbook entry), read `references/observability-patterns.md`.

## Baseline setup
- **API:** OpenTelemetry logs, metrics and traces, exported to one monitoring service.
- **Website:** a browser SDK (the service's own or OpenTelemetry web) sending errors and page performance to the same service.
- **Website ↔ API:** the website sends W3C trace context (`traceparent`); the API returns the ID in an `x-request-id` header. One request is followable from browser to API to database.
- A browser SDK's ingestion key is usually not a secret and may sit in public config (check the service's docs). Every other secret rule still applies.
- In the browser SDK, turn off personal data collection: no user IP storage, no automatic form-value capture, no cookies unless consent rules allow them.
- **Cost:** set a daily ingestion cap; sample successful requests but keep 100% of errors; `debug` logging off in production.

## Process

### 1. Write the questions first
Before instrumenting, write 2–4 questions whoever runs the feature will ask when it seems broken (e.g. "Why do payments fail permanently?"). Every signal you add must answer one of them.

### 2. Pick the signal
- **Metric:** how often / how fast in aggregate (tells you *that* something is wrong).
- **Trace:** where time went across services (*where*).
- **Structured log:** what happened in one case (*why*).

### 3. Structured logging
- Log events, not prose: a stable event name plus structured fields (`log.warn("payment_failed", {paymentId, errorCode, attempt})`). Never build log lines by string concatenation.
- Levels: `error` = invariant broken, someone may need to act; `warn` = degraded but handled (retry, fallback); `info` = significant business event; `debug` = diagnostic, off in production.
- **Correlation ID on every line.** Accept incoming trace context (or create it) at the API boundary, attach it to every log line and span, pass it on every outbound call and queue message, and return it to the caller.
- **When several entry points (scheduler, replay endpoint, CLI) write one log,** stamp an `entryPoint` field where the run starts and propagate it with the correlation ID across the same boundaries. Use `entryPoint`, not `source` (reserved for network fields).
- **Never log secrets, tokens, passwords or full personal data.** Allowlist the logged fields; never log whole request bodies.

### 4. Metrics
- **RED** (rate, errors, duration) for every endpoint and outside dependency; **USE** (utilization, saturation, errors) for resources like queues and pools. OpenTelemetry auto-instrumentation covers RED for endpoints and outbound calls.
- Add custom metrics only for business questions (e.g. `payments_retried`), as counters or histograms.
- **Labels come from small fixed sets** (route template, status class `5xx`, provider). Never user IDs, emails, request IDs, raw URLs or error text: those go in logs and traces.
- Latency is a histogram read as p50/p95/p99. Never track averages.

### 5. Tracing
- Configure OpenTelemetry at API startup, before anything else loads: service name, exporter config from the secret store or env, auto-instrumented HTTP server, HTTP client and database client, sampling (fraction of successes, all errors).
- Add manual spans only around meaningful internal work (e.g. `charge_provider`), with the attributes you'll filter by.
- Propagate context across every async boundary (HTTP headers, queue metadata), or the trace stops there.
- With one origin (API under `/api`), browser trace headers reach the API without CORS setup.

### 6. Alerting
- Alert on **symptoms users feel** (error rate, latency, failing health check, queue age, website JS error spike), not causes (CPU, a restart, disk). Causes go on dashboards.
- **Every project has at least:** an availability test on the health endpoint (e.g. `/api/health`) and the homepage, through the public URL, from a few regions; an API error-rate alert; an API p95/p99 latency alert.
- Every alert is actionable (if the answer is "ignore it, it self-heals", delete it), has a runbook entry, and has a threshold and duration based on data or on what users would notice.
- **Two severities only:** *notify me now* (user-facing, act now; an interrupting channel like mobile push) and *show me later* (degradation, act this week; a channel read daily like email). No third tier.
- **Runbook entry per alert**, kept with the project docs (e.g. a "Monitoring and alerts" section in the architecture doc): what is happening, what to check first, how to fix or roll back. Keep it short; add steps only when the first check isn't enough. When an entry proves wrong in an incident, fix it with the next commit.

### 7. Verify the telemetry before production
Locally (or in staging), trigger the paths and look at real output:
- Force an error, find it by request ID, and confirm the fields are structured (no `[object Object]`) and contain no secrets or personal data.
- Send test traffic; confirm metrics appear with the expected labels and sane values.
- Follow one request from website through API in the trace view, with no broken spans.
- Fire each new alert once (temporarily lower the threshold); confirm it arrives on its channel and its runbook entry exists.
- Locate an induced failure from telemetry alone, without reading the source.
