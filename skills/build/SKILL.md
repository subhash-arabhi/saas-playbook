---
name: build
description: "/build [plans/<name>.md]: build an approved plan step by step (one commit per step), or resume it."
disable-model-invocation: true
metadata:
  internal: true
---

# /build

1. **Phase must be `build`** (`AGENTS.md` → Project-specific). If it's `explore`, stop and tell the user to run `/plan` first.
2. **Pick the plan:**
   - the one named, or
   - the only plan with `status: approved` or `building`
   - if there's more than one, ask which with the question tool (`.agents/rules/asking.md`).
3. **Approval:** if its status is `draft`, open it (`.agents/rules/planning.md` → plan view), ask its open questions and then for approval, as in `/plan` steps 6–7. Set `status: approved` only when the user chooses Approve or explicitly says so, and only once Open questions is "None.".
4. Follow `.agents/workflows/build-plan.md` exactly. It runs until a step with `checkpoint: true`, or to the end, and resumes from the first step with `done: false`.
5. Never use the coding tool's own plan mode or "Build" button.
