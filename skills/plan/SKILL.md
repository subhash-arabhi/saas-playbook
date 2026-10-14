---
name: plan
description: "/plan [what]: write a plan in plans/. In the explore phase, it first ends exploring and switches the project to the build phase."
disable-model-invocation: true
metadata:
  internal: true
---

# /plan

1. Read `AGENTS.md` → Project-specific → **Phase**.
2. **If the phase is `explore`:** follow `.agents/workflows/explore.md` → "Ending the phase":
   - write the Decision in `EXPLORE.md`
   - switch to `Phase: build`
   - write the first SaaS plan, including the stack

   If the Decision is **stop**, write it and don't plan.
3. **If the phase is `build`:** list the areas the work touches and read their rules and skills (`AGENTS.md` → "Areas → rules and skills"). If a decision blocks writing the plan at all, ask it first (`.agents/rules/asking.md`). Then write a plan for what the user asked, following `.agents/rules/planning.md` and `.agents/templates/plan.md` exactly. Save it as `plans/<short-name>.md` with `status: draft`.
4. Run `node .agents/tools/plan.mjs check plans/<short-name>.md` and fix every error.
5. Show the plan to the user:
   - In Cursor/VS Code: the file opens as the plan view if the extension is installed (`bash .agents/tools/plan-editor/install.sh`).
   - Otherwise: start `node .agents/tools/plan.mjs view` and open http://localhost:4600, in the tool's built-in browser pane if it has one.

6. **Ask the open questions** with the question tool (`.agents/rules/asking.md`), using the options and recommendation written in the plan. Write each answer into the plan where it applies, set **Open questions** to "None." once all are answered, and run `plan.mjs check` again. The user may also answer by editing the plan.
7. **Ask for approval** with the question tool: "Approve" or "Change something". Choosing Approve, the Approve button, or saying so approves it; set `status: approved` only then. Don't start building. Building happens only on `/build`.
8. Never use the coding tool's own plan mode, plan files or "Build" button for this. The plan is only `plans/<name>.md`.
