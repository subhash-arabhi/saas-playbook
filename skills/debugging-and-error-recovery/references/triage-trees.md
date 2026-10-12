# Triage Trees
<!-- Adapted from addyosmani/agent-skills@1401c8b (MIT, see licenses/). Changes: language-agnostic; cloud-agnostic; moved out of SKILL.md (trimmed). -->

Decision trees for the `debugging-and-error-recovery` skill. Read only the one you need.

## Can't reproduce on demand

```text
├── Timing-dependent?
│   ├── Add timestamps to logs around the suspected area
│   ├── Add artificial delays to widen race windows
│   └── Run under load or concurrency
├── Environment-dependent?
│   ├── Compare runtime/browser versions, OS, env variables and config
│   ├── Compare local vs deployed settings and secrets wiring
│   ├── Compare data (empty vs populated database)
│   └── Reproduce in a clean environment (fresh container or CI)
├── State-dependent?
│   ├── Look for leaked state between tests or requests
│   ├── Look for globals, singletons, shared caches
│   └── Run the scenario in isolation vs after other operations
└── Truly random?
    ├── Add defensive logging at the suspected location
    ├── Alert on the specific error signature
    └── Document the conditions; revisit when it recurs
```

## Which layer is failing?

```text
├── Website             → browser console, network tab
├── Website ↔ API       → wrong API path, cookie flags, auth headers
├── API                 → server logs / monitoring service, request and response
├── Database            → queries, schema, migrations, data integrity
├── Build tooling       → config, dependencies, runtime versions
├── Outside service     → connectivity, API changes, rate limits, sandbox vs live keys
└── Test itself         → is the test correct? (false failure)
```

## Bisect a regression

```bash
git bisect start
git bisect bad                     # current commit is broken
git bisect good <known-good-sha>   # this commit worked
git bisect run <command that runs only the failing test>
git bisect reset
```

## Failing test example

```text
# Bug: task titles with special characters broke search
test "finds tasks with special characters in the title":
    create_task(title = 'Fix "quotes" & <brackets>')
    results = search_tasks("quotes")
    assert length(results) == 1
    assert results[0].title == 'Fix "quotes" & <brackets>'
```

## Test fails after a code change

```text
├── Changed code the test covers? → is the test or the code wrong?
│   ├── Test outdated → update the test
│   └── Code bug → fix the code
├── Changed unrelated code? → likely a side effect: shared state, imports, globals
└── Flaky? → it's a failing test: timing, order dependence, shared data, unfaked outside service
```

## Build fails

```text
├── Type error       → read the error, check types at the cited location
├── Import error     → module exists, exports match, paths correct
├── Config error     → build config syntax/schema
├── Dependency error → manifest and lockfile; reinstall from the lockfile
└── Environment      → runtime version, OS compatibility, required env vars
```

## Runtime error

```text
├── Null / undefined / missing value → trace the data flow to its source
├── Network error (website → API)    → right API URL (same origin, or allowed by CORS)? reaches the API (API logs)?
├── Blank screen / UI crash          → browser console and the UI's error handling
├── 401 / 403                        → session/token, cookie domain, the permission check
└── Wrong behavior, no error         → log key points, verify data at each step
```

## Fail fast and degrade gracefully

```text
function require_config(key):            # required config: fail at startup
    value = read_config(key)
    if value is missing: stop_startup("Missing required config: " + key)
    return value

function show_chart(data):               # optional UI: degrade, don't crash
    if data is empty: show_empty_state("No data available for this period"); return
    try: render_chart(data)
    on error: log_error("Chart render failed", error); show_error_state("Unable to display chart")
```
