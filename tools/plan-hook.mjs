#!/usr/bin/env node
// Agent hook: after the agent edits plans/<name>.md, show that plan in the plan view.
// Cursor runs it from .cursor/hooks.json (postToolUse), Claude Code from .claude/settings.json (PostToolUse).
// It never blocks the agent: on any problem it prints {} and exits 0.
import { basename, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { planPath, planViewUrl, openPlan } from './plan.mjs'

export async function handle(input, env = process.env) {
  const args = typeof input.tool_input === 'string' ? JSON.parse(input.tool_input) : input.tool_input || {}
  const root = env.CURSOR_PROJECT_DIR || env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()
  const path = planPath(args.path || args.file_path || args.target_file || input.file_path || '', root)
  if (!path) return {}
  const name = `plans/${basename(path)}`
  if (input.hook_event_name === 'PostToolUse') {
    const result = await openPlan(path, env)
    return { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: `${name} changed. ${result}` } }
  }
  const { url, open } = await planViewUrl(path)
  return {
    additional_context: open
      ? `${name} changed. The plan view at ${url} is already open and refreshes by itself.`
      : `${name} changed. Show it to the user now in the plan view: open ${url} in the built-in browser beside the chat (browser_navigate with position "side"), then carry on.`,
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let raw = ''
  process.stdin.on('data', (c) => (raw += c))
  process.stdin.on('end', async () => {
    let out = {}
    try {
      out = await handle(JSON.parse(raw || '{}'))
    } catch {}
    process.stdout.write(JSON.stringify(out) + '\n')
    process.exit(0)
  })
}
