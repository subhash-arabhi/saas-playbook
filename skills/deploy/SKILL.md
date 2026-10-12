---
name: deploy
description: "/deploy: approve the open PR, merge it and deploy to production with the cloud's CLI, then smoke-check."
disable-model-invocation: true
metadata:
  internal: true
---

# /deploy

1. **Phase must be `build`.** If it's `explore`, stop: nothing is deployed while exploring.
2. Follow `.agents/workflows/deploy.md` exactly: local production-build check, cloud access check, merge, deploy in order, smoke check, and rollback on failure.
