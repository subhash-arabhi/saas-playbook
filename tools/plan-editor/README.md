# SaaS Playbook Plans (VS Code / Cursor extension)

Opens `plans/*.md` as a plan view, right in the editor:
- collapsible steps
- clickable checkpoint circles
- inline editing of sections and steps
- an Approve button

"Open as text" (or right-click → Open With → Text Editor) shows the raw markdown.

Install: `bash .agents/tools/plan-editor/install.sh`. It packages the extension and installs it into Cursor and VS Code if they're present. Re-run it after updating the playbook.

The package holds only `extension.js`, `plan-core.mjs` (a copy of `../plan.mjs`, made by `install.sh`), this README and `package.json`.

Part of the SaaS playbook. MIT license (the playbook's `LICENSE`).
