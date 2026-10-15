import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, writeFileSync, readFileSync, existsSync, readlinkSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { REPO, tempRoot, cleanEnv } from './helpers.mjs'

const root = tempRoot('installer-')
const VERSION = JSON.parse(readFileSync(join(REPO, 'package.json'), 'utf8')).version

const project = (name = 'p-') => mkdtempSync(join(root, name))
const run = (dest, ...args) => spawnSync('bash', [join(REPO, 'install.sh'), ...args, dest], { encoding: 'utf8', env: cleanEnv() })
function install(dest, ...args) {
  const r = run(dest, ...args)
  assert.equal(r.status, 0, r.stderr + r.stdout)
  return r.stdout
}
function refused(dest, ...args) {
  const r = run(dest, ...args)
  assert.notEqual(r.status, 0, r.stdout)
  return r.stderr
}
const backups = (dest) => {
  const dir = join(dest, '.agents', '.backup')
  return existsSync(dir) ? readdirSync(dir).map((ts) => join(dir, ts)) : []
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
  assert.equal(read(dest, 'AGENTS.md'), read(REPO, 'templates/project-AGENTS.md'))
  assert.match(read(dest, 'AGENTS.md'), /## Project-specific\n[\s\S]*\*\*Phase:\*\*/)
  const nested = readdirSync(join(dest, '.agents'), { recursive: true }).filter((p) => /(^|\/)AGENTS\.md$/.test(p))
  assert.deepEqual(nested, [], 'agents apply any AGENTS.md they find, so none may be installed under .agents/')
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
  assert.equal(read(dest, 'AGENTS.playbook.md'), read(REPO, 'templates/project-AGENTS.md'))
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

test('playbook.json records every installed file with its SHA-256', () => {
  const dest = project()
  install(dest)
  const { files } = state(dest)
  assert.ok(files['LICENSE'] && files['rules/asking.md'] && files['skills/plan/SKILL.md'])
  const sum = spawnSync('shasum', ['-a', '256', join(dest, '.agents', 'rules', 'asking.md')], { encoding: 'utf8' }).stdout.split(' ')[0]
  assert.equal(files['rules/asking.md'], sum)
  const shipped = ['rules', 'workflows', 'reviewers', 'references', 'templates', 'tools', 'licenses', 'skills']
    .flatMap((d) => readdirSync(join(REPO, d), { recursive: true, withFileTypes: true }).filter((e) => e.isFile() && e.name !== '.DS_Store'))
  assert.equal(Object.keys(files).length, shipped.length + 1)
})

test('an update deletes only installed files and backs up local edits', () => {
  const dest = project()
  install(dest)
  writeFileSync(join(dest, '.agents', 'rules', 'my-rule.md'), 'mine\n')
  writeFileSync(join(dest, '.agents', 'rules', 'asking.md'), 'edited\n')
  const out = install(dest)
  assert.equal(read(dest, '.agents/rules/my-rule.md'), 'mine\n')
  assert.equal(read(dest, '.agents/rules/asking.md'), read(REPO, 'rules/asking.md'))
  const [b] = backups(dest)
  assert.equal(readFileSync(join(b, 'rules', 'asking.md'), 'utf8'), 'edited\n')
  assert.equal(existsSync(join(b, 'rules', 'my-rule.md')), false)
  assert.match(out, /\.agents\/\.backup\//)
  install(dest)
  assert.equal(backups(dest).length, 1, 'an unedited install needs no backup')
})

test('unmanaged .agents/ content stops the install, and --force backs it up first', () => {
  const dest = project()
  mkdirSync(join(dest, '.agents', 'rules'), { recursive: true })
  writeFileSync(join(dest, '.agents', 'rules', 'team.md'), 'our rules\n')
  assert.match(refused(dest), /\.agents\/rules/)
  assert.equal(read(dest, '.agents/rules/team.md'), 'our rules\n')
  assert.equal(existsSync(join(dest, '.agents', 'playbook.json')), false)
  assert.equal(existsSync(join(dest, 'AGENTS.md')), false)
  install(dest, '--force')
  const [b] = backups(dest)
  assert.equal(readFileSync(join(b, 'rules', 'team.md'), 'utf8'), 'our rules\n')
  assert.equal(state(dest).version, VERSION)
})

test('a project skill with a playbook skill name stops the install', () => {
  const dest = project()
  mkdirSync(join(dest, '.agents', 'skills', 'plan'), { recursive: true })
  writeFileSync(join(dest, '.agents', 'skills', 'plan', 'SKILL.md'), 'my plan skill\n')
  assert.match(refused(dest), /\bplan\b/)
  assert.equal(read(dest, '.agents/skills/plan/SKILL.md'), 'my plan skill\n')
  assert.equal(existsSync(join(dest, '.agents', 'playbook.json')), false)
})

function sourceCopy() {
  const src = mkdtempSync(join(root, 'src-'))
  cpSync(REPO, src, { recursive: true, filter: (p) => !/\/(\.git|node_modules|plans)(\/|$)/.test(p.slice(REPO.length)) })
  return src
}
const installFrom = (src, dest, ...args) => spawnSync('bash', [join(src, 'install.sh'), ...args, dest], { encoding: 'utf8', env: cleanEnv() })

test('playbook.json records a content checksum with the version', () => {
  const dest = project()
  install(dest)
  assert.match(state(dest).checksum, /^[0-9a-f]{64}$/)
  const first = state(dest).checksum
  install(dest)
  assert.equal(state(dest).checksum, first)
})

test('reinstalling the same version from altered source stops, unless --force', () => {
  const src = sourceCopy()
  const dest = project()
  assert.equal(installFrom(src, dest).status, 0)
  const before = state(dest)
  writeFileSync(join(src, 'rules', 'asking.md'), 'changed upstream\n')
  const r = installFrom(src, dest)
  assert.notEqual(r.status, 0)
  assert.match(r.stderr, new RegExp(`v${VERSION.replace(/\./g, '\\.')}.*checksum`, 's'))
  assert.deepEqual(state(dest), before, 'nothing changes')
  assert.equal(read(dest, '.agents/rules/asking.md'), read(REPO, 'rules/asking.md'))
  assert.equal(installFrom(src, dest, '--force').status, 0)
  assert.equal(read(dest, '.agents/rules/asking.md'), 'changed upstream\n')
  assert.notEqual(state(dest).checksum, before.checksum)
})

test('updating to a new version records the new checksum', () => {
  const src = sourceCopy()
  const dest = project()
  assert.equal(installFrom(src, dest).status, 0)
  const before = state(dest).checksum
  writeFileSync(join(src, 'rules', 'asking.md'), 'next release\n')
  const pkg = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8'))
  pkg.version = '99.0.0'
  writeFileSync(join(src, 'package.json'), JSON.stringify(pkg, null, 2))
  const r = installFrom(src, dest)
  assert.equal(r.status, 0, r.stderr)
  assert.equal(state(dest).version, '99.0.0')
  assert.match(state(dest).checksum, /^[0-9a-f]{64}$/)
  assert.notEqual(state(dest).checksum, before)
})

test('an update from v1.0.x (no file list) works without --force', () => {
  const dest = project()
  install(dest)
  const s = state(dest)
  delete s.files
  writeFileSync(join(dest, '.agents', 'playbook.json'), JSON.stringify(s, null, 2))
  writeFileSync(join(dest, '.agents', 'rules', 'asking.md'), 'edited\n')
  install(dest)
  assert.ok(state(dest).files['rules/asking.md'])
  assert.equal(read(dest, '.agents/rules/asking.md'), read(REPO, 'rules/asking.md'))
  const [b] = backups(dest)
  assert.equal(readFileSync(join(b, 'rules', 'asking.md'), 'utf8'), 'edited\n')
  assert.equal(existsSync(join(b, 'rules', 'planning.md')), false, 'unchanged files are not backed up')
})
