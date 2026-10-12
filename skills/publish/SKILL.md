---
name: publish
description: "/publish: check the app is ready for real users (legal, consent, privacy, accessibility, licenses) and plan the gaps."
disable-model-invocation: true
metadata:
  internal: true
---

# /publish

1. **Phase must be `build`**, with the app already deployed. Otherwise stop and tell the user.
2. Follow `.agents/workflows/publish.md` exactly. It reports and plans; it doesn't deploy.
