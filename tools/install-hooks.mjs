#!/usr/bin/env node
// Adds the plan view hook (plan-hook.mjs) to a project's .cursor/hooks.json and .claude/settings.json.
// Keeps every other setting and hook, adds nothing twice, and leaves files that aren't valid JSON alone.
//   node tools/install-hooks.mjs /path/to/project
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const CURSOR_HOOK = { command: 'node .agents/tools/plan-hook.mjs', matcher: 'Write', timeout: 10 }
export const CLAUDE_HOOK = {
  matcher: 'Write|Edit|MultiEdit',
  hooks: [{ type: 'command', command: 'node "$CLAUDE_PROJECT_DIR/.agents/tools/plan-hook.mjs"', timeout: 10 }],
}

function merge(dest, rel, add) {
  const file = join(dest, rel)
  let cfg = {}
  if (existsSync(file)) {
    try {
      cfg = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      return `! ${rel} isn't valid JSON, so the plan view hook wasn't added. Fix the file and run the installer again.`
    }
    if (JSON.stringify(cfg).includes('plan-hook.mjs')) return `✓ ${rel} already has the plan view hook`
  }
  add(cfg)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n')
  return `✓ ${rel}: plans open in the plan view when the agent changes them`
}

export function installHooks(dest) {
  return [
    merge(dest, '.cursor/hooks.json', (cfg) => {
      cfg.version ??= 1
      cfg.hooks ??= {}
      ;(cfg.hooks.postToolUse ??= []).push(CURSOR_HOOK)
    }),
    merge(dest, '.claude/settings.json', (cfg) => {
      cfg.hooks ??= {}
      ;(cfg.hooks.PostToolUse ??= []).push(CLAUDE_HOOK)
    }),
  ]
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  installHooks(resolve(process.argv[2] || '.')).forEach((line) => console.log(line))
}
