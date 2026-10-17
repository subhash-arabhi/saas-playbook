#!/usr/bin/env node
// Sets each coding tool's automatic compaction point to COMPACT_AT tokens in a project:
// Claude Code (.claude/settings.json), Codex (.codex/config.toml) and VS Code Copilot (.vscode/settings.json).
// Keeps a value the user already set, keeps every other setting, and leaves files it can't parse alone.
// Cursor's compaction point is fixed by Cursor and can't be set.
//   node tools/install-compaction.mjs /path/to/project
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export const COMPACT_AT = 500000

function setJson(dest, rel, key, tool) {
  const file = join(dest, rel)
  const add = `"${key}": ${COMPACT_AT}`
  let cfg = {}
  if (existsSync(file)) {
    try {
      cfg = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      return `! ${rel} couldn't be read as plain JSON, so it wasn't changed. To have ${tool} compact at ${COMPACT_AT} tokens, add ${add}`
    }
    if (key in cfg) return `✓ ${rel} already sets ${key} (${cfg[key]})`
  }
  cfg[key] = COMPACT_AT
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n')
  return `✓ ${rel}: ${tool} compacts at about ${COMPACT_AT} tokens`
}

function setCodex(dest) {
  const rel = '.codex/config.toml'
  const file = join(dest, rel)
  const text = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const current = text.match(/^\s*model_auto_compact_token_limit\s*=\s*(\S+)/m)
  if (current) return `✓ ${rel} already sets model_auto_compact_token_limit (${current[1]})`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `model_auto_compact_token_limit = ${COMPACT_AT}\n${text}`)
  return `✓ ${rel}: Codex compacts at ${COMPACT_AT} tokens once you trust the project`
}

export function installCompaction(dest) {
  return [
    setJson(dest, '.claude/settings.json', 'autoCompactWindow', 'Claude Code'),
    setCodex(dest),
    setJson(dest, '.vscode/settings.json', 'github.copilot.chat.advanced.summarizeAgentConversationHistoryThreshold', 'VS Code Copilot'),
    `- Cursor: its compaction point can't be configured (it summarises near the model's limit); type /summarize to compact sooner`,
  ]
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  installCompaction(resolve(process.argv[2] || '.')).forEach((line) => console.log(line))
}
