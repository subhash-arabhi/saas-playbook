import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, readlinkSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { REPO, tempRoot, cleanEnv } from './helpers.mjs'

const root = tempRoot('installer-')
const VERSION = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')).version

const project = (name = 'p-') => mkdtempSync(join(root, name))
function install(dest, ...args) {
  const r = spawnSync('bash', [join(REPO, 'install.sh'), ...args, dest], { encoding: 'utf8', env: cleanEnv() })
  assert.equal(r.status, 0, r.stderr + r.stdout)
  return r.stdout
}
const read = (dest, path) => readFileSync(join(dest, path), 'utf8')
const state = (dest) => JSON.parse(read(dest, '.agents/playbook.json'))

test('a fresh install sets up the project', () => {
  const dest = project()
  install(dest)
  for (const dir of ['rules', 'workflows', 'reviewers', 'references', 'templates', 'tools', 'licenses']) assert.ok(existsSync(join(dest, '.agents', dir)), dir)
  assert.deepEqual(readdirSync(join(dest, '.agents', 'skills')).sort(), readdirSync(join(REPO, 'skills')).sort())
  const s = state(dest)
  assert.equal(s.version, VERSION)
  assert.equal(s.commit, false)
  assert.deepEqual(s.skills.sort(), readdirSync(join(REPO, 'skills')).sort())
  assert.equal(read(dest, 'AGENTS.md'), read(REPO, 'AGENTS.md'))
  assert.equal(read(dest, 'CLAUDE.md'), '@AGENTS.md\n')
  assert.equal(readlinkSync(join(dest, '.claude', 'skills')), '../.agents/skills')
  assert.match(read(dest, '.agents/.gitignore'), /^\/rules\/$/m)
  assert.ok(existsSync(join(dest, 'plans')))
  assert.match(read(dest, '.cursor/hooks.json'), /plan-hook\.mjs/)
})

test('works in a path with spaces', () => {
  const dest = project('with space ')
  install(dest)
  assert.equal(state(dest).version, VERSION)
})

test('--commit keeps the playbook in git, and the choice is remembered', () => {
  const dest = project()
  install(dest, '--commit')
  assert.equal(existsSync(join(dest, '.agents', '.gitignore')), false)
  assert.equal(state(dest).commit, true)
  install(dest)
  assert.equal(state(dest).commit, true)
  install(dest, '--no-commit')
  assert.equal(state(dest).commit, false)
  assert.ok(existsSync(join(dest, '.agents', '.gitignore')))
})

test('an update keeps project skills and the project AGENTS.md', () => {
  const dest = project()
  install(dest)
  mkdirSync(join(dest, '.agents', 'skills', 'my-skill'))
  writeFileSync(join(dest, '.agents', 'skills', 'my-skill', 'SKILL.md'), '---\nname: my-skill\ndescription: mine\n---\n')
  writeFileSync(join(dest, 'AGENTS.md'), '# My project rules\n')
  const out = install(dest)
  assert.equal(read(dest, '.agents/skills/my-skill/SKILL.md'), '---\nname: my-skill\ndescription: mine\n---\n')
  assert.equal(read(dest, 'AGENTS.md'), '# My project rules\n')
  assert.equal(read(dest, 'AGENTS.playbook.md'), read(REPO, 'AGENTS.md'))
  assert.match(out, /AGENTS\.playbook\.md/)
})

test('an update removes skills the playbook no longer ships', () => {
  const dest = project()
  install(dest)
  const s = state(dest)
  s.skills.push('retired-skill')
  writeFileSync(join(dest, '.agents', 'playbook.json'), JSON.stringify(s, null, 2))
  mkdirSync(join(dest, '.agents', 'skills', 'retired-skill'))
  install(dest)
  assert.equal(existsSync(join(dest, '.agents', 'skills', 'retired-skill')), false)
})
