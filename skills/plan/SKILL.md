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
3. **If the phase is `build`:** list the areas the work touches and read their rules and skills (`AGENTS.md` → "Areas → rules and skills"). If a decision blocks writing the plan at all, ask it first (`.agents/rules/asking.md`). Then write a plan for what the user asked, following `.agents/rules/planning.md` and `.agents/templates/plan.md` exactly. Save it as `plans/<short-name>.md` with `status: draft`. If it touches UI, step 1 is the Design step with `checkpoint: true`, and UI steps' Done when name quality-bar criteria (`.agents/rules/planning.md` → Steps).
4. Run `node .agents/tools/plan.mjs check plans/<short-name>.md` and fix every error.
5. **Show the plan** in the plan view (`.agents/rules/planning.md` → plan view).
6. **Grill: settle everything before approval,** so the build never has to ask (`.agents/rules/planning.md` → Settle everything before approval).
   1. **Find every question before asking any.** Do a dry run: walk each step's Do, Files, Done when and Check as if you were building it now, and read the code those steps touch. Note every point where you'd have to choose, guess or ask: a value you don't know, two reasonable ways to do something, a risky action, a file outside the step's **Files**, a check you couldn't run. Cover every item of the checklist. **Look up facts, don't ask them:** anything the code, docs, `.env.local` or a tool can answer, find yourself (with a subagent in parallel where the tool has one). Only the questions that depend on a fact still being looked up wait for it; ask the rest.
   2. **Write the full list into Open questions,** each with its 2–3 options and your recommendation, run `plan.mjs check`, and open the plan, so the user sees every question at once before the first card.
   3. **Ask them in consecutive rounds** with the question tool (`.agents/rules/asking.md`), up to 3 per card. **Ask in dependency order:** a round holds only questions whose prerequisites are already answered, most consequential first among those; a question whose answer depends on one still open waits for a later round. Write each answer into the plan where it applies and remove it from Open questions. The user may also answer by editing the plan.
   4. **Ask about each risky action** the steps need, naming exactly what will happen, with no option marked recommended. An approved one becomes a Changes bullet `- **Approved: <action>:** <exactly what>`; a refused one comes out of the plan, or the step changes so it isn't needed.
   5. **Repeat the dry run** with the answers in place, because an answer can raise new questions. Go back to 2 until a dry run finds none. Then set **Open questions** to "None.", add the first Build log row (`| Plan | <date> | Dry run | Dry run: N questions, none left. |`), run `plan.mjs check` and open the plan again.
7. **Ask for approval** with the question tool: "Approve" or "Change something". Choosing Approve, the Approve button, or saying so approves it; set `status: approved` only then. A change sends you back to the dry run in 6. Don't start building. Building happens only on `/build`.
8. Never use the coding tool's own plan mode, plan files or "Build" button for this. The plan is only `plans/<name>.md`.
