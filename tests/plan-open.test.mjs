import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openTarget } from '../tools/plan.mjs'

const PLAN_MJS = fileURLToPath(new URL('../tools/plan.mjs', import.meta.url))
const root = realpathSync(mkdtempSync(join(tmpdir(), 'plan-open-')))
const servers = []
after(() => {
  for (const pid of servers) {
    try {
      process.kill(pid)
    } catch {}
  }
  rmSync(root, { recursive: true, force: true })
})

const DEMO_PLAN = `---
name: "Demo"
status: draft
steps:
  - id: 1
    title: "One"
    summary: "First step"
    done: false
    checkpoint: false
---

# Plan: Demo

## What we're building
A demo.

## Changes
- **Demo:** a demo change.

## Steps

### Step 1: One
**Do:**
1. Do it.

**Files:** \`a.txt\` (new)

**Done when:**
- [ ] It's done

**Check:** \`true\`

## Open questions
None.

## Build log
| Step | Date | Result | Notes |
|---|---|---|---|
`

/** A project with plans/demo.md, a fake command that records its arguments, and an env without editor variables. */
function project(fakeCommand) {
  const dir = mkdtempSync(join(root, 'p-'))
  mkdirSync(join(dir, 'plans'))
  writeFileSync(join(dir, 'plans', 'demo.md'), DEMO_PLAN)
  const bin = join(dir, 'bin')
  mkdirSync(bin)
  const out = join(dir, 'called.txt')
  writeFileSync(join(bin, fakeCommand), `#!/bin/sh\necho "$@" > "${out}"\n`)
  chmodSync(join(bin, fakeCommand), 0o755)
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CURSOR_|VSCODE_|BROWSER$)/.test(k)))
  env.PATH = `${bin}:${env.PATH}`
  return { dir, bin, out, env }
}

const run = (p, env, file = 'plans/demo.md') => spawnSync(process.execPath, [PLAN_MJS, 'open', file], { cwd: p.dir, env, encoding: 'utf8' })
const getJson = async (url) => (await fetch(url)).json()

test('openTarget picks the editor that owns the terminal, else the browser', () => {
  assert.equal(openTarget({ VSCODE_IPC_HOOK_CLI: '/s', CURSOR_TRACE_ID: 'x' }).clis[0], 'cursor')
  assert.equal(openTarget({ VSCODE_IPC_HOOK_CLI: '/s' }).clis[0], 'code')
  assert.deepEqual(openTarget({}, 'darwin'), { kind: 'browser', opener: 'open' })
  assert.equal(openTarget({}, 'linux').opener, 'xdg-open')
  assert.equal(openTarget({ BROWSER: 'firefox' }, 'linux').opener, 'firefox')
})

test('opens the plan in VS Code from its terminal', () => {
  const p = project('code')
  const r = run(p, { ...p.env, VSCODE_IPC_HOOK_CLI: '/tmp/fake.sock' })
  assert.equal(r.status, 0, r.stdout)
  assert.equal(readFileSync(p.out, 'utf8').trim(), `-r ${join(p.dir, 'plans', 'demo.md')}`)
})

test('opens the plan in Cursor from its terminal', () => {
  const p = project('cursor')
  const r = run(p, { ...p.env, VSCODE_IPC_HOOK_CLI: '/tmp/fake.sock', CURSOR_TRACE_ID: 'x' })
  assert.equal(r.status, 0, r.stdout)
  assert.match(readFileSync(p.out, 'utf8'), /^-r .*demo\.md/)
})

test('outside an editor, starts one viewer and opens the plan in the browser', async () => {
  const p = project('browser')
  const env = { ...p.env, BROWSER: join(p.bin, 'browser') }
  const first = run(p, env)
  assert.equal(first.status, 0, first.stdout)
  const url = readFileSync(p.out, 'utf8').trim()
  assert.match(url, /^http:\/\/localhost:46\d\d\/\?plan=demo\.md$/)
  const base = new URL(url).origin
  const rootInfo = await getJson(`${base}/api/root`)
  servers.push(rootInfo.pid)
  assert.equal(rootInfo.dir, join(p.dir, 'plans'))
  assert.equal((await getJson(`${base}/api/plan?name=demo.md`)).data.name, 'Demo')

  assert.equal(run(p, env).status, 0)
  assert.equal(readFileSync(p.out, 'utf8').trim(), url, 'reuses the running viewer')
  assert.equal((await getJson(`${base}/api/root`)).pid, rootInfo.pid)
})

test('refuses files outside plans/', () => {
  const p = project('browser')
  const r = run(p, { ...p.env, BROWSER: join(p.bin, 'browser') }, 'README.md')
  assert.equal(r.status, 1)
  assert.match(r.stdout, /not a plan in plans\//)
})
