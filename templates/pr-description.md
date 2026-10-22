# <Short title: what this PR does>

<One or two plain sentences on what changed and why.>

## Changes
<!-- Simple list, grouped by area. Plain language. Leave out areas with no changes. -->
**Website**
- <change>

**API**
- <change>

**Database**
- <change, e.g. "New `projects` table (migration 004)">

**Docs**
- `ARCHITECTURE.md` updated: <what changed in it, or "Last updated only">

## Evidence
<!-- For each behaviour change: the test that failed before and passes now, or command output. UI changes: see Screenshots. -->
- <behaviour>: `<test name>` failed before, passes now

## Merge danger
**Door:** <two-way: reverting the PR undoes it | one-way: <what can't be undone, e.g. "migration 004 drops `projects.legacy_id`">>
**Blast radius:** <a few words: what breaks and for whom if it's wrong, e.g. "invoice list for every team">

## Plans included
- `plans/<name>.md` (<done | steps 1–N of M>)

## Screenshots
<!-- Only if the UI changed. Every changed page at desktop (1440×900) and mobile (390×844). -->
| Page | Desktop before | Desktop after | Mobile before | Mobile after |
|---|---|---|---|---|
| <page> | ![](<url>) | ![](<url>) | ![](<url>) | ![](<url>) |

## Pre-PR check
| Step | Result |
|---|---|
| Simplification | <n> commits / none |
| Tests | PASS |
| E2E | PASS |
| Secrets | PASS |
| ARCHITECTURE.md updated | PASS |
| Code scan | PASS |
| Packages | PASS |
| UI audit | <n> warnings / SKIPPED |
| Code review | PASS (<n> Required accepted: <list>) |
| Security review | PASS |
| LLM red-team | PASS / SKIPPED |

## Before deploying
<!-- Anything that must exist or happen first. Write "Nothing" if none. -->
- <e.g. "Add secret `stripe-api-key` to the secret store", "Migration 004 adds a column (safe)">
