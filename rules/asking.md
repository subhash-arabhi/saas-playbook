# Asking the user

Every "ask" in this playbook (stop and ask, ask first, ask to approve, ask what's next) uses the coding tool's **question interface** when it has one: a multiple-choice card the user answers with a click. Don't type the question into chat.

## The tool
| Coding tool | Question tool |
|---|---|
| Cursor | `AskQuestion` |
| Claude Code | `AskUserQuestion` |
| Codex | `request_user_input` |
| VS Code (GitHub Copilot) | `askQuestions` |

Use whichever is in your tool list. If none is (another tool, a subagent, a headless or CI run), ask in chat as a short numbered list of options, recommended first, and wait for the answer.

## Writing the question
- **First say in one chat sentence what needs deciding and why.** Show anything the user needs to judge it (what failed, what it costs, the localhost URL) before the question, not inside it.
- **One decision per question, in one sentence.** Ask related questions together, at most 3 per call; don't spread them over several turns. The exception is the planning grill (`.agents/skills/plan/SKILL.md` → step 6): it asks every question in consecutive rounds of up to 3, one card after another, until none are left.
- **2–3 options**, mutually exclusive unless the question allows several answers. Put the recommended option first and end its label with "(Recommended)". Don't add an "Other" option: every tool adds a free-text answer itself.
- **Short labels.** Put the consequence in the option's description, or in the label when the tool has no description field. Headers, where the tool has them, are 12 characters or fewer.
- **Risky actions** (`AGENTS.md` → Always 10): name exactly what will happen in the question, and don't mark either option as recommended.
- **Never offer push, deploy or publish as an option.** They start only when the user types them.
- **Don't ask what the code, the plan, `.env.local` or a sensible default already answers.**

## When chat is right
- The answer is a value with no sensible options (a name, a key, an account). Ask in chat.
- A number with a basis (e.g. a budget cap from the cost estimate) gets 2–3 options, none recommended; the free-text answer takes any other amount.

## After the answer
Write the decision where it belongs: in the plan (the step, **Changes** or **What we're building** it affects), in `EXPLORE.md`, in `AGENTS.md` → Project-specific, or in `.env.local` for private values. Choosing an option counts as the user saying it.
