# Sources and licenses

Third-party content in this playbook, pinned to the commit it was copied from. Each license file must stay with the copies.

| Content | Source | Commit | License file |
|---|---|---|---|
| Skills: api-and-interface-design, browser-testing-with-devtools, code-review-and-quality, code-simplification, debugging-and-error-recovery, frontend-ui-engineering, incremental-implementation, observability-and-instrumentation, security-and-hardening. Reviewers: code-reviewer, security-auditor, test-engineer. References: security-checklist, accessibility-checklist | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `1401c8b` | `addyosmani-agent-skills.LICENSE` (MIT) |
| "Avoid the AI look" in frontend-ui-engineering | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `717446e` | `leonxlnx-taste-skill.LICENSE` (MIT) |
| web-design-guidelines rules | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | `434b7f9` | `vercel-web-interface-guidelines.LICENSE` (MIT) |
| design-motion-principles | [kylezantos/design-motion-principles](https://github.com/kylezantos/design-motion-principles) | `4a9ca87` | `kylezantos-design-motion-principles.LICENSE` (MIT) |
| playwright-cli | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) | `b85c7a7` | `microsoft-playwright-cli.LICENSE` (Apache-2.0) |
| references/design-systems (Linear, Vercel, Cal) | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | `13be5c0` | `voltagent-awesome-design-md.LICENSE` (MIT) |
| front-end-design `references/direction.md` | [anthropics/skills](https://github.com/anthropics/skills) `skills/frontend-design` | `41bbe19` | `anthropic-skills-frontend-design.LICENSE` (Apache-2.0) |
| front-end-design `references/craft.md` | [Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | `2f9be32` | `dammyjay93-interface-design.LICENSE` (MIT) |
| DESIGN.md format | [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | — | Referenced, not copied |

Most files were adapted. Each one notes its changes in a comment at the top.

**Changes to frontend-design** (Apache-2.0; also noted at the top of the file): `references/direction.md` rewrites the skill as rules for the `/front-end-design` flow; the token plan writes to `DESIGN.md`; the screenshot self-critique pass is removed; motion guidance keeps only what fits the playbook's motion inventory; trimmed.

**Changes to playwright-cli** (Apache-2.0 asks that modified files say so; each also notes it at the top):
- `SKILL.md`: added "Project rules first" and "Agent rules"; moved the Storage command list to `references/storage-state.md`; removed the examples that read auth cookies, attach to a running browser or upload with `gh`'s attach flag; Installation uses a pinned project dev dependency through `npx`; PR screenshots point to the `pr-assets` branch; added `npx playwright-cli` to `allowed-tools`.
- `references/storage-state.md`: auth state only for project test accounts, in gitignored files; removed reading auth cookies or tokens and the cookie-injection roundtrip; non-auth example values.
- `references/session-management.md`: removed attaching to a running browser and detach; `--profile` points at a project folder.
- `references/test-generation.md`: pinned Playwright bootstrap; a test for a confirmed bug stays failing instead of being marked fixme.
- `references/pr-attachments.md`: rewritten for the `pr-assets` branch; CI keeps failure output as a workflow artifact.
- `references/video-recording.md`: recordings for a PR go on the `pr-assets` branch. To update one from upstream, re-download it at a new commit, re-apply the playbook changes, and update this table.
