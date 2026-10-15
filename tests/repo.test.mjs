import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { REPO } from './helpers.mjs'

const tracked = (pattern) => execFileSync('git', ['ls-files', pattern], { cwd: REPO, encoding: 'utf8' }).trim().split('\n').filter(Boolean)

/** Front matter of a SKILL.md as flat key → raw value (enough for name and description). */
function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return null
  const out = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z][\w-]*):\s*(.*)$/)
    if (kv) out[kv[1]] = kv[2].replace(/^"(.*)"$/, '$1')
  }
  return out
}

test('every skill follows the Agent Skills spec', () => {
  const skills = readdirSync(join(REPO, 'skills'))
  assert.ok(skills.length > 10)
  for (const dir of skills) {
    const file = join(REPO, 'skills', dir, 'SKILL.md')
    assert.ok(existsSync(file), `${dir}: missing SKILL.md`)
    const fm = frontMatter(readFileSync(file, 'utf8'))
    assert.ok(fm, `${dir}: missing front matter`)
    assert.equal(fm.name, dir, `${dir}: name must match the folder`)
    assert.match(fm.name, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${dir}: name must be lowercase words joined by hyphens`)
    assert.ok(fm.name.length <= 64, `${dir}: name is over 64 characters`)
    assert.ok(fm.description && fm.description.length <= 1024, `${dir}: description must be 1–1024 characters`)
  }
})

/** Local link targets in a Markdown file, outside code fences and inline code. */
function localLinks(text) {
  const links = []
  let fence = false
  text.split('\n').forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) return void (fence = !fence)
    if (fence) return
    for (const m of line.replace(/`[^`]*`/g, '').matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1]
      if (/^(https?:|mailto:|#|<)/.test(target)) continue
      links.push({ line: i + 1, target })
    }
  })
  return links
}

test('local Markdown links point to files that exist', () => {
  const broken = []
  for (const file of tracked('*.md')) {
    for (const { line, target } of localLinks(readFileSync(join(REPO, file), 'utf8'))) {
      if (!existsSync(resolve(REPO, dirname(file), decodeURI(target.split('#')[0])))) broken.push(`${file}:${line} → ${target}`)
    }
  }
  assert.deepEqual(broken, [])
})

/** Examples the playbook's rules forbid, found in a skill's text (shell line continuations joined). */
const FORBIDDEN = [
  [/@latest\b/, 'unpinned @latest install'],
  [/\battach\s+--(cdp|extension)\b/, 'attaching to an everyday browser'],
  [/\bgh\s+(pr|issue)\s+(create|comment|edit)\b[^\n]*--attach\b/, 'gh --attach (PR images go on the pr-assets branch)'],
  [/\btest\.(fixme|skip)\(/, 'skipped test'],
  [/\bcookie-get\b|\blocalstorage-get\s+token\b/, 'reading auth cookies or tokens'],
]
function forbiddenIn(text) {
  const joined = text.replace(/\\\n\s*/g, ' ')
  return FORBIDDEN.filter(([re]) => re.test(joined)).map(([, why]) => why)
}

test('skills contain no examples the playbook forbids', () => {
  const found = []
  for (const file of tracked('skills/**/*.md')) {
    for (const why of forbiddenIn(readFileSync(join(REPO, file), 'utf8'))) found.push(`${file}: ${why}`)
  }
  assert.deepEqual(found, [])
})

test('the forbidden-example check notices each pattern', () => {
  assert.deepEqual(forbiddenIn('npm i -g @playwright/cli@latest'), ['unpinned @latest install'])
  assert.deepEqual(forbiddenIn('playwright-cli attach --cdp=chrome'), ['attaching to an everyday browser'])
  assert.deepEqual(forbiddenIn('gh pr create --title x \\\n  --attach ./a.png'), ['gh --attach (PR images go on the pr-assets branch)'])
  assert.deepEqual(forbiddenIn("test.fixme('later')"), ['skipped test'])
  assert.deepEqual(forbiddenIn('TOKEN=$(playwright-cli --raw cookie-get session_id)'), ['reading auth cookies or tokens'])
  assert.deepEqual(forbiddenIn('npx playwright-cli open http://localhost:3000'), [])
})

test('skill files stay under 500 lines', () => {
  const long = tracked('skills/*/SKILL.md').filter((f) => readFileSync(join(REPO, f), 'utf8').split('\n').length >= 500)
  assert.deepEqual(long, [])
})

test('the link check notices a broken link', () => {
  assert.deepEqual(localLinks('[a](missing.md) `[b](code.md)`\n```\n[c](fenced.md)\n```\n[d](https://x.y)'), [{ line: 1, target: 'missing.md' }])
})
