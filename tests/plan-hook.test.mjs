import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, realpathSync, rmSync, existsSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installHooks, CURSOR_HOOK, CLAUDE_HOOK } from '../tools/install-hooks.mjs'

const HOOK = fileURLToPath(new URL('../tools/plan-hook.mjs', import.meta.url))
const PLAN = readFileSync(fileURLToPath(new URL('../plans/critical-fixes.md', import.meta.url)), 'utf8')
const root = realpathSync(mkdtempSync(join(tmpdir(), 'plan-hook-')))
const servers = new Set()
after(() => {
  for (const pid of servers) {
    try {
      process.kill(pid)
    } catch {}
  }
  rmSync(root, { recursive: true, force: true })
})

function project() {
  const dir = mkdtempSync(join(root, 'p-'))
  mkdirSync(join(dir, 'plans'))
  writeFileSync(join(dir, 'plans', 'demo.md'), PLAN)
  writeFileSync(join(dir, 'notes.md'), '# not a plan\n')
  const out = join(dir, 'browser.txt')
  writeFileSync(join(dir, 'browser'), `#!/bin/sh\necho "$@" >> "${out}"\n`)
  chmodSync(join(dir, 'browser'), 0o755)
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CURSOR_|VSCODE_|CLAUDE_|BROWSER$)/.test(k)))
  return { dir, out, env: { ...env, BROWSER: join(dir, 'browser') } }
}

function runHook(p, input, extraEnv) {
  const r = spawnSync(process.execPath, [HOOK], { cwd: p.dir, env: { ...p.env, ...extraEnv }, input: JSON.stringify(input), encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return JSON.parse(r.stdout)
}

async function trackViewer(text) {
  const port = text.match(/localhost:(\d+)/)?.[1]
  if (port) servers.add((await (await fetch(`http://localhost:${port}/api/root`)).json()).pid)
  return port
}

test('Cursor: a plan edit starts the viewer and tells the agent to show it beside the chat', async () => {
  const p = project()
  const out = runHook(p, { hook_event_name: 'postToolUse', tool_name: 'Write', tool_input: { path: join(p.dir, 'plans', 'demo.md') } }, { CURSOR_PROJECT_DIR: p.dir })
  assert.match(out.additional_context, /^plans\/demo\.md changed\. Show it to the user now in the plan view: open http:\/\/localhost:\d+\/\?plan=demo\.md in the built-in browser/)
  assert.ok(await trackViewer(out.additional_context), 'viewer is running')
  assert.equal(existsSync(p.out), false, 'no outside browser is opened in Cursor')
})

test('Cursor: works when the project path goes through a symlink', async () => {
  const p = project()
  const link = join(root, `link-${Date.now()}`)
  symlinkSync(p.dir, link)
  const out = runHook(p, { hook_event_name: 'postToolUse', tool_input: { path: join(link, 'plans', 'demo.md') } }, { CURSOR_PROJECT_DIR: link })
  assert.match(out.additional_context || '', /^plans\/demo\.md changed\. Show it/)
  await trackViewer(out.additional_context)
})

test('Cursor: tool_input given as a JSON string is understood', () => {
  const p = project()
  const out = runHook(p, { hook_event_name: 'postToolUse', tool_input: JSON.stringify({ file_path: 'plans/demo.md' }) }, { CURSOR_PROJECT_DIR: p.dir })
  assert.match(out.additional_context || '', /plans\/demo\.md changed/)
  return trackViewer(out.additional_context)
})

test('Claude Code: a plan edit opens the plan view once, then relies on the open tab', async () => {
  const p = project()
  const input = { hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: join(p.dir, 'plans', 'demo.md') } }
  const first = runHook(p, input, { CLAUDE_PROJECT_DIR: p.dir })
  assert.equal(first.hookSpecificOutput.hookEventName, 'PostToolUse')
  assert.match(first.hookSpecificOutput.additionalContext, /✓ Opened http:\/\/localhost:\d+\/\?plan=demo\.md/)
  const port = await trackViewer(first.hookSpecificOutput.additionalContext)
  await fetch(`http://localhost:${port}/api/plan?name=demo.md`) // what an open tab does every 2 seconds
  const second = runHook(p, input, { CLAUDE_PROJECT_DIR: p.dir })
  assert.match(second.hookSpecificOutput.additionalContext, /Already open/)
  assert.equal(readFileSync(p.out, 'utf8').trim().split('\n').length, 1, 'the browser was opened once')
})

test('ignores files that are not plans, and bad input', () => {
  const p = project()
  assert.deepEqual(runHook(p, { hook_event_name: 'postToolUse', tool_input: { path: join(p.dir, 'notes.md') } }, { CURSOR_PROJECT_DIR: p.dir }), {})
  assert.deepEqual(runHook(p, { hook_event_name: 'postToolUse', tool_input: { path: join(p.dir, 'plans', 'missing.md') } }, { CURSOR_PROJECT_DIR: p.dir }), {})
  const r = spawnSync(process.execPath, [HOOK], { cwd: p.dir, env: p.env, input: 'not json', encoding: 'utf8' })
  assert.equal(r.status, 0)
  assert.equal(r.stdout.trim(), '{}')
})

test('installHooks adds both hooks once and keeps existing settings', () => {
  const dir = mkdtempSync(join(root, 'i-'))
  mkdirSync(join(dir, '.cursor'))
  mkdirSync(join(dir, '.claude'))
  writeFileSync(join(dir, '.cursor', 'hooks.json'), JSON.stringify({ version: 1, hooks: { afterFileEdit: [{ command: './fmt.sh' }] } }))
  writeFileSync(join(dir, '.claude', 'settings.json'), JSON.stringify({ permissions: { allow: ['Bash(npm test)'] } }))
  installHooks(dir)
  installHooks(dir)
  const cursor = JSON.parse(readFileSync(join(dir, '.cursor', 'hooks.json'), 'utf8'))
  const claude = JSON.parse(readFileSync(join(dir, '.claude', 'settings.json'), 'utf8'))
  assert.deepEqual(cursor.hooks.afterFileEdit, [{ command: './fmt.sh' }])
  assert.deepEqual(cursor.hooks.postToolUse, [CURSOR_HOOK])
  assert.deepEqual(claude.permissions, { allow: ['Bash(npm test)'] })
  assert.deepEqual(claude.hooks.PostToolUse, [CLAUDE_HOOK])
})

test('installHooks creates missing files and leaves invalid JSON untouched', () => {
  const dir = mkdtempSync(join(root, 'j-'))
  mkdirSync(join(dir, '.claude'))
  writeFileSync(join(dir, '.claude', 'settings.json'), '{ broken')
  const lines = installHooks(dir)
  assert.equal(JSON.parse(readFileSync(join(dir, '.cursor', 'hooks.json'), 'utf8')).version, 1)
  assert.equal(readFileSync(join(dir, '.claude', 'settings.json'), 'utf8'), '{ broken')
  assert.match(lines[1], /isn't valid JSON/)
})
