# Observability Patterns
<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: language-agnostic pseudocode; cloud-agnostic; moved out of SKILL.md (trimmed). -->

Worked examples for the `observability-and-instrumentation` skill. Read only the section you need.

## Questions before instrumenting

```text
FEATURE: checkout payment retry
QUESTIONS I'LL ASK WHEN IT BREAKS:
1. What fraction of payments succeed on first attempt vs after retry?
2. When a payment fails permanently, why? (provider error? timeout? validation?)
3. Is the payment provider slower than usual?
→ Every signal must help answer one of these.
```

## Signals

| Signal | Answers | Cost profile | Example |
|---|---|---|---|
| Structured log | What happened in this case? | Per event; grows with traffic | `payment_failed` with provider error code |
| Metric | How often / how fast, in aggregate? | Fixed per series; cheap to query | p99 latency of provider calls |
| Trace | Where did time go across services? | Per request; sampled | One slow checkout, broken down by hop |

## Structured log line

```text
BAD:  log.info("Payment " + id + " failed for user " + user_id + " after " + n + " retries")
GOOD: log.warn("payment_failed", { paymentId: id, provider: "payments", errorCode: err.code, attempt: n })
```

## Correlation ID at the API boundary

```text
on every API request:
    trace_id = incoming "traceparent" header, or a new one
    request_log = log.with(requestId = trace_id)
    response.header("x-request-id", trace_id)
    every outbound HTTP call and queue message carries the trace context
```

## Entry point next to the correlation ID

A correlation ID identifies a run, not which code path started it. Without `entryPoint`, telling a scheduled run from a replay means cross-reading records that may be gone.

```text
function run_log(entry_point, run_id):        # "scheduler" | "replay_endpoint" | "cli"
    return log.with(entryPoint = entry_point, requestId = run_id)

scheduler tick           → run_log("scheduler", new_id())
POST /jobs/{id}/replay   → run_log("replay_endpoint", request.id)
manual command           → run_log("cli", env RUN_ID or new_id())
```

Both fields cross the same boundaries (queue metadata, HTTP headers), or a worker re-derives the entry point and guesses.

## Metric definition and labels

```text
metric http_request_duration_seconds (histogram)
    labels: method, route, statusClass       ← "2xx", not "200"
    buckets: 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5

OK as label:    route="/tasks/{id}"   statusClass="5xx"   provider="payments"
NEVER a label:  userId, email, requestId, full URL, error message text
```

Every unique label combination is a separate time series, and on most services a separate cost.

## OpenTelemetry startup

```text
At API startup, before anything else loads:
    configure OpenTelemetry (the monitoring service's distro, or the SDK plus its exporter)
        service name      = "<project>-api"
        exporter config   = from config (secret store / env)
        auto-instrument   = HTTP server, HTTP client, database client
        sampling          = keep a fraction of successful requests, all errors
```

## Symptom vs cause

```text
SYMPTOM (alert):                       CAUSE (dashboard only):
API error rate > 1% for 5 min          CPU at 85%
p99 latency > 2s for 10 min            one container restarted
/api/health failing (availability)     disk at 70%
queue age > 10 min
website JS error spike
```

Cause alerts fire when nothing is wrong and miss failures you didn't predict.

## Runbook entry

```markdown
### Alert: API error rate > 1%
**Severity:** notify me now
**Means:** a bad deploy, the database is unreachable, or an outside service is failing.
**First check:** the monitoring service's failures view, grouped by operation and exception type.
  If it started at the last deploy, roll back to the previous release.
**Fix:** depends on the failing dependency. See the "Outside services" table.
```

A five-step entry covering the three most common causes beats a twenty-step one that gets skimmed.
