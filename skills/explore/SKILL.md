---
name: explore
description: "/explore <idea>: start or continue the explore phase: a minimal local prototype to find out whether an idea is worth building."
disable-model-invocation: true
metadata:
  internal: true
---

# /explore

1. Read `AGENTS.md` → Project-specific → **Phase**.
   - **`build`**: stop and ask. Switching back to exploring changes how the whole project is worked on.
   - **`explore`**, or not set: continue.
2. Set `Phase: explore` in `AGENTS.md` if it isn't already.
3. Follow `.agents/workflows/explore.md` exactly, using the idea the user gave (or continuing `EXPLORE.md` if it exists).
4. Stay in the explore phase until the user runs `/plan`.
