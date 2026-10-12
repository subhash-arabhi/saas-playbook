# Browser Debugging Workflows

## UI bugs

```text
1. REPRODUCE  Navigate to the page, trigger the bug, screenshot the visual state
2. INSPECT    Console errors/warnings, the element, computed styles, accessibility tree
3. DIAGNOSE   Actual vs expected structure and styles; is the right data reaching
              the component? Root cause: markup, CSS, script or data?
4. FIX        In source code (start with a failing test where possible)
5. VERIFY     Reload, screenshot (compare with step 1), console clean, run the automated tests
```

## Network issues (website ↔ API)

```text
1. CAPTURE   Open the network view, trigger the action
2. ANALYZE   URL: expected origin and API path (e.g. same origin, under /api)?
             Method, headers (auth, traceparent), payload
             Status and body (the API's error shape, e.g. { error: { code, message } })
             Timing: slow? timing out?
3. DIAGNOSE  4xx → website sends wrong data, wrong URL, or missing auth
             5xx → API error (find it in the API logs or monitoring by request ID)
             Not reaching the API → routing of the API path in the app or its ingress
             Timeout → API response time / payload size
             Missing request → is the code actually sending it?
4. FIX & VERIFY  Fix, replay the action, confirm the response
```

## Performance issues

```text
1. BASELINE  Record a performance trace of the current behavior
2. IDENTIFY  Targets for "good": LCP < 2.5 s, CLS < 0.1, INP < 200 ms;
             long tasks (> 50 ms); unnecessary re-renders or repeated work
3. FIX       Address the specific bottleneck
4. MEASURE   Record another trace, compare with the baseline
```

## Reading the console

```text
ERROR  Uncaught exceptions → bug in code
       Failed network requests → API or auth issue
       Framework warnings promoted to errors → component issues
       Security errors → CSP violations, mixed content
WARN   Deprecation → future compatibility; performance → bottleneck; accessibility → a11y issue
LOG    Debug output → should not be in production builds
```

## Test plan for a complex UI bug

Write a structured plan the agent can follow in the browser. If the flow is a core flow, turn it into a Playwright E2E test afterwards.

```markdown
## Test Plan: Task completion animation bug

### Setup
1. Open the local website, logged in as a test account
2. Ensure at least 3 tasks exist (create them with the test-data builders)

### Steps
1. Click the checkbox on the first task
   - Expected: strikethrough animation, task moves to "completed"
   - Check: no console errors; PATCH /api/tasks/{id} with { "status": "COMPLETED" }
2. Click undo within 3 seconds
   - Expected: task returns to the active list with reverse animation
   - Check: no console errors; PATCH /api/tasks/{id} with { "status": "PENDING" }
3. Rapidly toggle the same task 5 times
   - Expected: no visual glitches, consistent final state, exactly one instance of the task
   - Check: no console errors, no duplicate network requests
```
