import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installCompaction, COMPACT_AT } from '../tools/install-compaction.mjs'

const root = mkdtempSync(join(tmpdir(), 'compaction-'))
after(() => rmSync(root, { recursive: true, force: true }))

const project = () => mkdtempSync(join(root, 'p-'))
const read = (dir, rel) => readFileSync(join(dir, rel), 'utf8')
const json = (dir, rel) => JSON.parse(read(dir, rel))
const write = (dir, rel, text) => {
  mkdirSync(join(dir, rel, '..'), { recursive: true })
  writeFileSync(join(dir, rel), text)
}
const VSCODE_KEY = 'github.copilot.chat.advanced.summarizeAgentConversationHistoryThreshold'

test('creates the setting for Claude Code, Codex and VS Code', () => {
  const dir = project()
  const lines = installCompaction(dir)
  assert.equal(COMPACT_AT, 500000)
  assert.equal(json(dir, '.claude/settings.json').autoCompactWindow, 500000)
  assert.equal(read(dir, '.codex/config.toml'), 'model_auto_compact_token_limit = 500000\n')
  assert.equal(json(dir, '.vscode/settings.json')[VSCODE_KEY], 500000)
  assert.match(lines.join('\n'), /Cursor.*can't be configured.*\/summarize/)
})

test('keeps other settings, adds nothing twice, and keeps the user’s own value', () => {
  const dir = project()
  write(dir, '.claude/settings.json', JSON.stringify({ autoCompactWindow: 300000, hooks: { PostToolUse: [] } }))
  write(dir, '.vscode/settings.json', JSON.stringify({ 'editor.tabSize': 2 }))
  installCompaction(dir)
  const before = ['.claude/settings.json', '.codex/config.toml', '.vscode/settings.json'].map((f) => read(dir, f))
  const lines = installCompaction(dir)
  assert.deepEqual(['.claude/settings.json', '.codex/config.toml', '.vscode/settings.json'].map((f) => read(dir, f)), before)
  assert.deepEqual(json(dir, '.claude/settings.json'), { autoCompactWindow: 300000, hooks: { PostToolUse: [] } })
  assert.deepEqual(json(dir, '.vscode/settings.json'), { 'editor.tabSize': 2, [VSCODE_KEY]: 500000 })
  assert.match(lines[0], /already sets autoCompactWindow \(300000\)/)
})

test('puts the Codex key before the first table, and keeps an existing one', () => {
  const dir = project()
  write(dir, '.codex/config.toml', '# team config\nmodel = "gpt-5"\n\n[mcp_servers.docs]\ncommand = "docs"\n')
  installCompaction(dir)
  const toml = read(dir, '.codex/config.toml')
  assert.equal(toml, 'model_auto_compact_token_limit = 500000\n# team config\nmodel = "gpt-5"\n\n[mcp_servers.docs]\ncommand = "docs"\n')
  const kept = project()
  write(kept, '.codex/config.toml', 'model_auto_compact_token_limit = 200000\n')
  installCompaction(kept)
  assert.equal(read(kept, '.codex/config.toml'), 'model_auto_compact_token_limit = 200000\n')
})

test('leaves files it can’t parse alone and says what to add', () => {
  const dir = project()
  const jsonc = '{\n  // comments are allowed in VS Code settings\n  "editor.tabSize": 2,\n}\n'
  write(dir, '.vscode/settings.json', jsonc)
  write(dir, '.claude/settings.json', '{ broken')
  const lines = installCompaction(dir)
  assert.equal(read(dir, '.vscode/settings.json'), jsonc)
  assert.equal(read(dir, '.claude/settings.json'), '{ broken')
  assert.match(lines.join('\n'), new RegExp(`\\.vscode/settings\\.json.*"${VSCODE_KEY.replace(/\./g, '\\.')}": 500000`))
  assert.match(lines.join('\n'), /\.claude\/settings\.json.*"autoCompactWindow": 500000/)
})
