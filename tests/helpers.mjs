import { after } from 'node:test'
import { mkdtempSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const REPO = fileURLToPath(new URL('..', import.meta.url))
export const PLAN_MJS = join(REPO, 'tools', 'plan.mjs')

/** A temp folder for this test file, removed when its tests finish. */
export function tempRoot(prefix) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), prefix)))
  after(() => rmSync(root, { recursive: true, force: true }))
  return root
}

/** The current environment without the editor and agent variables that change how the tools behave. */
export function cleanEnv(extra = {}) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CURSOR_|VSCODE_|CLAUDE_|BROWSER$)/.test(k)))
  return { ...env, ...extra }
}

/** A valid plan; `opts` changes its status, open questions or step fields. */
export function demoPlan({ status = 'draft', openQuestions = 'None.', done = false, ticked = done, checkpoint = false, title = 'One' } = {}) {
  return `---
name: "Demo"
status: ${status}
steps:
  - id: 1
    title: "${title}"
    summary: "First step"
    done: ${done}
    checkpoint: ${checkpoint}
---

# Plan: Demo

## What we're building
A demo.

## Changes
- **Demo:** a demo change.

## Steps

### Step 1: ${title}
**Do:**
1. Do it.

**Files:** \`a.txt\` (new)

**Done when:**
- [${ticked ? 'x' : ' '}] It's done

**Check:** \`true\`

## Open questions
${openQuestions}

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
`
}
