# Planning

## When to write a plan
Write a plan **only** when:
- the user runs `/plan` (or asks for a plan), **or**
- the work is large: several features, or more than a few hours of agent work. Then suggest `/plan`; don't plan unasked.

Otherwise, make the change directly, still with tests and a commit per logical change.

**When unsure whether the work needs a plan, ask the user first.**

## Format (enforced)
Save plans as `plans/<short-name>.md`, using `.agents/templates/plan.md` **exactly**.
- **Front matter** holds the plan's state as data:
  - `name`, and `status` (`draft` → `approved` → `building` → `done`)
  - `steps`: each with `id` (1, 2, …), `title` (≤ 60 characters), a one-line `summary` (≤ 160 characters), `done` and `checkpoint` (true/false)
  - Use double quotes for strings.
- **The body** is plain markdown (no HTML), in this order:
  1. `# Plan: <name>`
  2. `## What we're building`: 2–4 plain sentences.
  3. `## Changes`: every change the plan makes, one `- **Name:** description` bullet each, at most 2 lines. If a change isn't here, it isn't in the plan.
  4. `## Steps`: one `### Step N: <title>` per step, matching the front matter, each with **Do:**, **Files:**, **Done when:** (`- [ ]` items, at most 5), **Check:** and optionally **Stop and ask if:**.
  5. `## Open questions`: must say "None." before approval.
  6. `## Build log`
- **Run `node .agents/tools/plan.mjs check plans/<name>.md` after every write or update of a plan, and fix every error** before continuing.
- **Plans describe changes only.** No architecture, stack tables or background explanation. The system's design lives in `ARCHITECTURE.md`. A project's first plan includes a step that writes `ARCHITECTURE.md`, with the stack chosen per `.agents/rules/stack.md`, and lists that stack in one **Changes** bullet.
- **The user reviews and edits plans in the plan view,** so **open the plan for them** every time you write or change it, stop at a checkpoint, or finish a build. They should never have to look for it:
  - with the coding tool's own open-file tool if it has one (Cursor: `open_resource` with the plan's `file://` URI); the plan editor extension (`.agents/tools/plan-editor/`) shows it as the plan view;
  - otherwise with `node .agents/tools/plan.mjs open plans/<name>.md`, which opens it in Cursor or VS Code when run from their terminal, or else in the browser viewer, starting the viewer if needed;
  - and always link the plan file in your message.

  The user may edit any section, set checkpoints, and approve. **Re-read the plan file before acting on it**, because the user may have changed it.

## Steps
- **Every step's Do follows the rules of the areas it touches** (`AGENTS.md` → Areas).
- **Each step is one meaningful, testable chunk of work**, usually a whole feature or subsystem end to end (e.g. "Team invites: API, UI and tests"). Agents can handle large steps; don't slice work into tiny layers.
- Aim for **about 5–12 steps per plan**.
- **Split a step** if it mixes unrelated areas, or its **Done when** needs more than 5 items.
- Every step leaves the app working, with its checks passing.
- No feature flags. Features go live when the user runs `/deploy`.

## Checkpoints
- **The user sets a step's `checkpoint: true`** (by clicking its circle in the viewer, or editing the file) to make the build pause after that step. **Never change `checkpoint` yourself.**

## Building
On `/build`, follow `.agents/workflows/build-plan.md`.
