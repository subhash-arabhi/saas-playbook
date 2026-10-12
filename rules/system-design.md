# System design principles

These principles apply to any backend, whatever the language, framework or cloud. Use them when designing or changing how the system is structured. The resulting design is recorded in `ARCHITECTURE.md`.

## Shape
- **Start simple.** One deployable application and one database, until there's a real reason for more.
- **Split only for a concrete need:** different resources, a different scaling pattern, a security boundary, or work that would block everything else. Never split for its own sake.
- **Draw boundaries around business capabilities**, not technical layers. Each part owns its data and exposes a small, deliberate interface to the rest.
- **Prefer proven, boring technology.** Every new kind of component must earn its place, because each one adds cost, failure modes and things to learn.

## Structure
- **Separate concerns:** handling requests, business logic, and talking to the outside world are different responsibilities.
- **Business rules live in one place** and don't depend on frameworks, transport or storage details.
- **Hide every external system behind an interface you own,** so it can be replaced, faked in tests, or changed without touching business logic.
- **Prefer a few deep modules over many thin layers.** A layer that only passes calls through adds complexity without value.

## Time and work
- **Keep the request path fast.** Work that is slow, unreliable, or needs retrying happens in the background. The user gets an immediate acknowledgement and can see progress.
- **Assume any work can run more than once.** Make operations idempotent, so repeating them is harmless.
- **Never lose work.** Record the intent to do something together with the change that caused it, so a crash can't drop it.
- **Know the platform's limits** (request timeouts, connection limits, memory), and design well inside them.

## Dependencies
- **Every external call can be slow, fail, or end in an unknown state.** Design for all three.
- **Bound every wait.** Nothing waits forever.
- **Retry with care:** only operations that are safe to repeat, with growing delays, and in one place only.
- **When a dependency is down, fail fast and degrade gracefully.** The rest of the product keeps working, and the user is told plainly what's unavailable.
- **Put limits on anything that costs money per use** (AI calls, paid APIs), per user and overall.

## State and scale
- **Application processes hold no important state.** Data, files, sessions and counters live in durable, shared services, so any process can be replaced or added.
- **Scale by adding identical processes,** and budget shared resources (such as database connections) for the maximum number of them.
- **Start small and scale on evidence,** not on predictions.

## Data
- **The data model is the most lasting decision.** Design it carefully, and change it through versioned, reversible migrations.
- **Keep core data structured and normalised.** Use flexible formats only for data that is genuinely flexible.
- **Make ownership explicit from day one.** Every record knows who it belongs to, and every query respects that.
- **Let the database protect integrity:** constraints and transactions, not hope. Keep network calls out of transactions.
- **Store time in UTC.** Use identifiers that don't reveal counts or allow guessing.
- **Deleting means deleting,** unless keeping history is a stated requirement.

## Performance
- **Measure before optimising.** Optimise the path that's actually slow.
- **Cache only for a measured need,** and decide how stale data is invalidated before adding the cache.

## Reliability
- **Design observability in from the start.** You should be able to tell what the system is doing and why, without reading the code.
- **Report health honestly:** "running" and "ready to serve" are different signals.
- **Start and stop gracefully,** finishing or safely handing off work in progress.
- **Define what "working" means** (availability, speed, success rates), and alert on that, not on every individual error.
- **Backups only count once a restore has been tested.**
- **Think through failure modes up front:** what breaks, what users see, and how it's mitigated.

## Security
- **Least privilege everywhere:** services, people and tokens get only the access they need.
- **Keep secrets out of code,** and treat everything from outside the system as untrusted until validated (details: `.agents/rules/security.md`).

## Cost
- **Cost should follow usage.** Avoid paying for idle capacity at low traffic.
- **Know what each component costs per month,** and set a budget cap with alerts on total spend.

## Writing it down
`ARCHITECTURE.md` is the high-level design. It explains:
- the context and expected scale
- each component and **why it exists**
- the modules and the data each owns
- the key flows
- outside dependencies and how failures are handled
- failure modes, targets, and cost

Keep it current with every change.
