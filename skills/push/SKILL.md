---
name: push
description: "/push: the user's sign-off. Run the pre-PR check, push the working branch and open or update the PR."
disable-model-invocation: true
metadata:
  internal: true
---

# /push

1. **Phase must be `build`.** If it's `explore`, stop: pushing a PR belongs to the build phase, so tell the user to run `/plan` first. Exception: if the user explicitly asks to push the exploration as-is, push the branch only, with no PR and no pre-PR check.
2. Follow `.agents/workflows/push.md` exactly. It runs `.agents/workflows/pre-pr.md`, and anything that blocks stops the push.
