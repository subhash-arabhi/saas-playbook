#!/usr/bin/env node
// Keeps AI-tool attribution out of a project's commits and PRs:
// turns it off in Claude Code (.claude/settings.json), Codex (.codex/config.toml) and VS Code (.vscode/settings.json),
// and installs a git commit-msg hook that runs .agents/tools/strip-attribution.mjs on every commit.
// Keeps values the user already set, leaves files it can't parse alone, and never replaces someone else's hook.
// Cursor's switch is per user only, so it's explained, not set.
//   node tools/install-attribution.mjs /path/to/project
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync, realpathSync } from 'node:fs'
import { join, dirname, resolve, isAbsolute } from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { HOOK_MARK } from './strip-attribution.mjs'

export const HOOK_LINE = 'node .agents/tools/strip-attribution.mjs "$1"'
export const HOOK = `#!/bin/sh
# ${HOOK_MARK} (installed by .agents/tools/install-attribution.mjs)
[ -f .agents/tools/strip-attribution.mjs ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
${HOOK_LINE}
`

function setJson(dest, rel, key, value, tool) {
  const file = join(dest, rel)
  let cfg = {}
  if (existsSync(file)) {
    try {
      cfg = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      return `! ${rel} couldn't be read as plain JSON, so it wasn't changed. To turn ${tool}'s attribution off, add "${key}": ${JSON.stringify(value)}`
    }
    if (key in cfg) return `✓ ${rel} already sets ${key}`
  }
  cfg[key] = value
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(cfg, null, 2) + '\n')
  return `✓ ${rel}: ${tool} adds no attribution`
}

function setCodex(dest) {
  const rel = '.codex/config.toml'
  const file = join(dest, rel)
  const text = existsSync(file) ? readFileSync(file, 'utf8') : ''
  if (/^\s*commit_attribution\s*=/m.test(text)) return `✓ ${rel} already sets commit_attribution`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `commit_attribution = ""\n${text}`)
  return `✓ ${rel}: Codex adds no attribution once you trust the project`
}

export function installHook(dest) {
  const git = (...args) => execFileSync('git', args, { cwd: dest, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  let hooks
  try {
    if (realpathSync(git('rev-parse', '--show-toplevel')) !== realpathSync(dest)) throw new Error('not the repo root')
    hooks = git('rev-parse', '--git-path', 'hooks')
  } catch {
    return `! Not a git repository yet, so the commit-msg hook wasn't installed. After git init, run: node .agents/tools/install-attribution.mjs`
  }
  const file = join(isAbsolute(hooks) ? hooks : join(dest, hooks), 'commit-msg')
  if (existsSync(file) && !readFileSync(file, 'utf8').includes(HOOK_MARK)) {
    return `! A commit-msg hook already exists (${file}), so it wasn't replaced. To strip AI attribution, add this line to it: ${HOOK_LINE}`
  }
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, HOOK)
  chmodSync(file, 0o755)
  return `✓ commit-msg hook: strips AI attribution from every commit`
}

export function installAttribution(dest) {
  return [
    setJson(dest, '.claude/settings.json', 'attribution', { commit: '', pr: '', sessionUrl: false }, 'Claude Code'),
    setCodex(dest),
    setJson(dest, '.vscode/settings.json', 'git.addAICoAuthor', 'off', 'VS Code Copilot'),
    installHook(dest),
    `- Cursor: its attribution switch is per user. Turn off Cursor Settings → Git & PRs → Attribution (commits and PRs), and for the CLI set "attribution": {"attributeCommitsToAgent": false, "attributePRsToAgent": false} in ~/.cursor/cli-config.json. The hook strips its commit trailer meanwhile`,
  ]
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href) {
  installAttribution(resolve(process.argv[2] || '.')).forEach((line) => console.log(line))
}
