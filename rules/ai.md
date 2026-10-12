# AI features

## Choosing models
- **Research before choosing, every time.** Models, prices and availability change often. Never pick from memory. Check what is currently available to the project (its cloud or provider, in its region), using the provider's model list and current docs.
- **Choose per task, not one model for everything:** strong models for complex or structured generation, small cheap ones for simple or high-volume tasks, embedding or specialised models where needed. Compare quality, structured-output support, context size, latency, price at expected volume, rate limits and data-handling terms.
- **Test before deciding, lightly** (build phase, when a model is first chosen): 2–3 candidates, about 8–10 real examples, one run. A few minutes and a few dollars at most; ask before spending more. Save the examples and the chosen model's outputs in the repo. They become the fake responses for tests, so the comparison isn't wasted work.
- **Record the choice** in `ARCHITECTURE.md` → AI models: task, model, why, candidates tried, and estimated cost.
- **Keep model and deployment names in config, not code,** named by role (e.g. `support-reply`, not the model's name), so a model can be swapped without code changes.
- **Revisit** when quality drops, costs rise, or a notably better or cheaper model appears. Re-run the example set before switching.
- **Ask the user first** when a model needs paid reserved capacity, a new provider account, or the user's personal or business details.
- **In the explore phase:** no research or comparison. Use the cheapest model that answers the question being tested. Model choice happens when the product is built.

## Using models
- **Ask for structured output** (a schema or tool call) whenever code consumes the result, and validate it.
- **Keep prompts in one place** in the code, versioned like code.
- **Calls follow `.agents/rules/system-design.md`** (bounded waits, retries in one place, slow calls in the background, per-user cost caps) **and `.agents/rules/security.md`.**
