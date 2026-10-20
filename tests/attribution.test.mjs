import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync, chmodSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { REPO } from './helpers.mjs'
import { stripAttribution, findAttribution } from '../tools/strip-attribution.mjs'
import { installAttribution, HOOK } from '../tools/install-attribution.mjs'

const root = mkdtempSync(join(tmpdir(), 'attribution-'))
after(() => rmSync(root, { recursive: true, force: true }))

const AGENT_LINES = [
  'Co-authored-by: Cursor <cursoragent@cursor.com>',
  'Co-Authored-By: Claude <noreply@anthropic.com>',
  'Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>',
  'Co-authored-by: Codex <noreply@openai.com>',
  'Co-authored-by: Copilot <175728472+Copilot@users.noreply.github.com>',
  'Co-authored-by: devin-ai-integration[bot] <158243242+devin-ai-integration[bot]@users.noreply.github.com>',
  'Co-authored-by: aider (gpt-4o) <aider@aider.chat>',
  'Assisted-by: Gemini',
  'Claude-Session: https://claude.ai/code/session_123',
  '🤖 Generated with [Claude Code](https://claude.com/claude-code)',
  'Generated with Claude Code',
  'Made with [Cursor](https://cursor.com)',
  'Created using GitHub Copilot',
]

const KEEP = [
  'Co-authored-by: Ada Lovelace <ada@example.com>',
  'Co-authored-by: Claude Monet <claude.monet@example.com>',
  'Signed-off-by: Ada Lovelace <ada@example.com>',
  'Reviewed-by: Grace Hopper <grace@example.com>',
]

test('strips every known agent trailer and attribution line, and keeps human ones', () => {
  const msg = `Add checkout\n\nCharge the card once.\n\n${[...AGENT_LINES, ...KEEP].join('\n')}\n`
  assert.equal(stripAttribution(msg), `Add checkout\n\nCharge the card once.\n\n${KEEP.join('\n')}\n`)
  for (const line of AGENT_LINES) assert.equal(findAttribution(`x\n\n${line}\n`).length, 1, line)
  for (const line of KEEP) assert.deepEqual(findAttribution(`x\n\n${line}\n`), [], line)
})

test('leaves clean messages, comments and ordinary words alone', () => {
  const clean = 'Fix the cursor position in the editor\n\nThe generated code made with care.\n# Please enter the commit message\n'
  assert.equal(stripAttribution(clean), clean)
  assert.equal(stripAttribution('Step 1: Add login\n\nCo-authored-by: Cursor <cursoragent@cursor.com>\n'), 'Step 1: Add login\n')
  assert.equal(stripAttribution('Docs\n\nBody\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n'), 'Docs\n\nBody\n')
})

const git = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=Dev', '-c', 'user.email=dev@example.com', ...args], { cwd, encoding: 'utf8' })

function repoWithHook() {
  const dir = mkdtempSync(join(root, 'repo-'))
  git(dir, 'init', '-q')
  mkdirSync(join(dir, '.agents', 'tools'), { recursive: true })
  copyFileSync(join(REPO, 'tools', 'strip-attribution.mjs'), join(dir, '.agents', 'tools', 'strip-attribution.mjs'))
  return dir
}

test('a real commit through the commit-msg hook has no agent trailer', () => {
  const dir = repoWithHook()
  const hook = join(dir, '.git', 'hooks', 'commit-msg')
  writeFileSync(hook, '#!/bin/sh\nnode .agents/tools/strip-attribution.mjs "$1"\n')
  chmodSync(hook, 0o755)
  writeFileSync(join(dir, 'a.txt'), 'a\n')
  git(dir, 'add', 'a.txt')
  git(dir, 'commit', '-q', '-m', 'Add a', '-m', 'Co-authored-by: Cursor <cursoragent@cursor.com>\nCo-authored-by: Ada <ada@example.com>')
  assert.equal(git(dir, 'log', '-1', '--format=%B').trim(), 'Add a\n\nCo-authored-by: Ada <ada@example.com>')
})

test('--amend cleans the HEAD commit, and --check reports and fails', () => {
  const dir = repoWithHook()
  writeFileSync(join(dir, 'b.txt'), 'b\n')
  git(dir, 'add', 'b.txt')
  git(dir, 'commit', '-q', '--no-verify', '-m', 'Add b', '-m', '🤖 Generated with [Claude Code](https://claude.com/claude-code)')
  const tool = join(dir, '.agents', 'tools', 'strip-attribution.mjs')
  const check = (input) => {
    try {
      return { code: 0, out: execFileSync('node', [tool, '--check'], { cwd: dir, input, encoding: 'utf8' }) }
    } catch (e) {
      return { code: e.status, out: e.stdout }
    }
  }
  const before = check(git(dir, 'log', '--format=%B'))
  assert.equal(before.code, 1)
  assert.match(before.out, /stdin:3: 🤖 Generated with/)
  execFileSync('node', [tool, '--amend'], { cwd: dir, env: { ...process.env, GIT_COMMITTER_NAME: 'Dev', GIT_COMMITTER_EMAIL: 'dev@example.com' } })
  assert.equal(git(dir, 'log', '-1', '--format=%B').trim(), 'Add b')
  assert.equal(check(git(dir, 'log', '--format=%B')).code, 0)
  assert.equal(readFileSync(join(dir, 'b.txt'), 'utf8'), 'b\n')
})


const project = () => mkdtempSync(join(root, 'p-'))
const json = (dir, rel) => JSON.parse(readFileSync(join(dir, rel), 'utf8'))

test('install turns attribution off in Claude Code, Codex and VS Code, and installs the hook', () => {
  const dir = project()
  git(dir, 'init', '-q')
  const out = installAttribution(dir).join('\n')
  assert.deepEqual(json(dir, '.claude/settings.json').attribution, { commit: '', pr: '', sessionUrl: false })
  assert.equal(readFileSync(join(dir, '.codex/config.toml'), 'utf8'), 'commit_attribution = ""\n')
  assert.equal(json(dir, '.vscode/settings.json')['git.addAICoAuthor'], 'off')
  assert.equal(readFileSync(join(dir, '.git/hooks/commit-msg'), 'utf8'), HOOK)
  assert.match(out, /Cursor.*Git & PRs → Attribution.*attributeCommitsToAgent/)
})

test('install keeps values already set and other settings, and is safe to repeat', () => {
  const dir = project()
  git(dir, 'init', '-q')
  mkdirSync(join(dir, '.claude'))
  writeFileSync(join(dir, '.claude/settings.json'), JSON.stringify({ attribution: { commit: 'Mine' }, model: 'x' }))
  mkdirSync(join(dir, '.codex'))
  writeFileSync(join(dir, '.codex/config.toml'), 'model_auto_compact_token_limit = 500000\n[features]\nweb = true\n')
  installAttribution(dir)
  installAttribution(dir)
  assert.deepEqual(json(dir, '.claude/settings.json'), { attribution: { commit: 'Mine' }, model: 'x' })
  assert.equal(readFileSync(join(dir, '.codex/config.toml'), 'utf8'), 'commit_attribution = ""\nmodel_auto_compact_token_limit = 500000\n[features]\nweb = true\n')
  assert.equal(readFileSync(join(dir, '.git/hooks/commit-msg'), 'utf8'), HOOK)
})

test('an existing commit-msg hook is left alone, with the line to add printed; no repo means no hook', () => {
  const dir = project()
  git(dir, 'init', '-q')
  writeFileSync(join(dir, '.git/hooks/commit-msg'), '#!/bin/sh\nnpx commitlint --edit "$1"\n')
  const out = installAttribution(dir).join('\n')
  assert.equal(readFileSync(join(dir, '.git/hooks/commit-msg'), 'utf8'), '#!/bin/sh\nnpx commitlint --edit "$1"\n')
  assert.match(out, /already exists.*add this line to it: node \.agents\/tools\/strip-attribution\.mjs "\$1"/)
  assert.match(installAttribution(project()).join('\n'), /Not a git repository yet/)
})

test('the installed hook strips Cursor’s trailer from a real commit', () => {
  const dir = repoWithHook()
  installAttribution(dir)
  writeFileSync(join(dir, 'c.txt'), 'c\n')
  git(dir, 'add', 'c.txt')
  git(dir, 'commit', '-q', '-m', 'Add c', '-m', 'Made with [Cursor](https://cursor.com)\n\nCo-authored-by: Cursor <cursoragent@cursor.com>')
  assert.equal(git(dir, 'log', '-1', '--format=%B').trim(), 'Add c')
})
