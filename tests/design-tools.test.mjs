import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { REPO, tempRoot } from './helpers.mjs'
import { scales, requiredPairs, yamlLines, contrast } from '../tools/design-palette.mjs'
import { extraTokens, themeCss } from '../tools/design-tokens.mjs'
import { coverage, approvals, NO_TABLE } from '../tools/design-coverage.mjs'

const tool = (name) => join(REPO, 'tools', name)
const template = readFileSync(join(REPO, 'templates', 'DESIGN.md'), 'utf8')

test('contrast follows WCAG: black on white is 21:1', () => {
  assert.equal(Math.round(contrast({ l: 0, c: 0, h: 0 }, { l: 1, c: 0, h: 0 })), 21)
})

test('the palette passes every required pair for hues around the wheel, in both themes', () => {
  for (const hue of [0, 25, 70, 100, 150, 200, 255, 300]) {
    const failed = requiredPairs(scales({ hue })).filter((p) => p.ratio < p.min)
    assert.deepEqual(failed, [], `hue ${hue}`)
  }
})

test('the palette prints 48 OKLCH steps plus on-primary that a DESIGN.md can use', () => {
  const lines = yamlLines(scales({ hue: 255 }))
  assert.equal(lines.filter((l) => /^ {2}(neutral|accent)-\d+(-dark)?: "oklch\(\d\.\d{3} \d\.\d{3} \d+\)"$/.test(l)).length, 48)
  assert.ok(lines.some((l) => /^ {2}on-primary: /.test(l)) && lines.some((l) => /^ {2}on-primary-dark: /.test(l)))
  const names = lines.map((l) => l.trim().split(':')[0])
  for (const name of names.filter((n) => /^(neutral|accent)-/.test(n))) assert.match(template, new RegExp(`^  ${name}: `, 'm'), `template has ${name}`)
})

test('the palette CLI exits 1 when the accent is too light for a focus ring', () => {
  const ok = spawnSync('node', [tool('design-palette.mjs'), '--hue', '255'], { encoding: 'utf8' })
  assert.equal(ok.status, 0)
  assert.match(ok.stderr, /^pass {2}.*on-primary on primary/m)
  const bad = spawnSync('node', [tool('design-palette.mjs'), '--hue', '255', '--accent-lightness', '0.8'], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /^FAIL {2}.*primary and focus ring/m)
  assert.equal(spawnSync('node', [tool('design-palette.mjs')], { encoding: 'utf8' }).status, 2)
})

test('the tokens tool turns every extra token in the template into a theme variable', () => {
  const tokens = extraTokens(template)
  for (const group of ['motion', 'zIndex', 'breakpoints', 'iconSize']) assert.ok(Object.keys(tokens[group]).length > 0, group)
  const css = themeCss(tokens)
  const count = Object.values(tokens).reduce((n, g) => n + Object.keys(g).length, 0)
  assert.equal((css.match(/^ {2}--[\w-]+: .+;$/gm) || []).length, count)
  for (const line of ['  --duration-fast: 150ms;', '  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);', '  --z-dialog: 500;', '  --breakpoint-md: 768px;', '  --spacing-icon-md: 20px;', '  --motion-spring-snappy: stiffness 500, damping 32;']) assert.ok(css.includes(line), line)
})

test('the tokens CLI writes the CSS file and prints JSON', () => {
  const root = tempRoot('design-tokens-')
  writeFileSync(join(root, 'DESIGN.md'), template)
  execFileSync('node', [tool('design-tokens.mjs'), '--out', 'tokens.css'], { cwd: root })
  assert.match(readFileSync(join(root, 'tokens.css'), 'utf8'), /^@theme \{$/m)
  const json = JSON.parse(execFileSync('node', [tool('design-tokens.mjs'), 'DESIGN.md', '--json'], { cwd: root, encoding: 'utf8' }))
  assert.equal(json.zIndex.toast, '700')
  assert.equal(spawnSync('node', [tool('design-tokens.mjs'), 'missing.md'], { cwd: root }).status, 1)
})

/** A project with DESIGN.md (given Approvals rows, or none) and UI files. */
function project(rows, files) {
  const root = tempRoot('design-coverage-')
  const table = rows === null ? '' : `\n## Approvals & changelog\n| Item | Version | Status | Date |\n|---|---|---|---|\n${rows.map((r) => `| ${r[0]} | v1 | ${r[1]} | 2026-10-22 |`).join('\n')}\n`
  writeFileSync(join(root, 'DESIGN.md'), `---\nname: X\n---\n\n## Overview\nx\n${table}`)
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true })
    writeFileSync(join(root, path), text)
  }
  return root
}

const pages = {
  'app/page.tsx': "import { Button } from '@/components/ui/button'\nimport { DropdownMenu } from \"../components/ui/dropdown-menu\"\n",
  'src/app/settings/page.tsx': "import { DataTable } from '~/components/ui/data-table/columns'\n",
  'components/ui/button.tsx': "import { Spinner } from './spinner'\n",
  'node_modules/x/index.js': "import 'components/ui/ignored'\n",
}

test('coverage passes when every shared component the UI imports is approved', () => {
  const root = project([['Button', 'approved'], ['Dropdown menu', 'approved'], ['Data table', 'approved']], pages)
  const { problems, used } = coverage(root)
  assert.deepEqual(problems, [])
  assert.deepEqual([...used.keys()].sort(), ['button', 'data-table', 'dropdown-menu'])
})

test('coverage fails on a proposed or missing component, and the latest row wins', () => {
  const root = project([['Button', 'proposed'], ['Button', 'approved'], ['Dropdown menu', 'proposed']], pages)
  assert.deepEqual(coverage(root).problems, [
    'data-table: not in DESIGN.md (used in src/app/settings/page.tsx)',
    'dropdown-menu: status is "proposed" (used in app/page.tsx)',
  ])
  const cli = spawnSync('node', [tool('design-coverage.mjs')], { cwd: root, encoding: 'utf8' })
  assert.equal(cli.status, 1)
  assert.match(cli.stderr, /dropdown-menu: status is "proposed"/)
})

test('coverage blocks a project with no Approvals table and tells it to run /front-end-design', () => {
  const root = project(null, pages)
  assert.deepEqual(coverage(root).problems, [NO_TABLE])
  const cli = spawnSync('node', [tool('design-coverage.mjs'), '--root', root], { encoding: 'utf8' })
  assert.equal(cli.status, 1)
  assert.equal(cli.stderr.trim(), 'No Approvals table: run /front-end-design')
})

test('coverage reads the template table and honours --dirs', () => {
  assert.equal(approvals(template).get('button'), 'proposed')
  const root = project([['Card', 'approved']], { 'app/page.tsx': "import { Card } from '@/ui/card'\n" })
  assert.equal(spawnSync('node', [tool('design-coverage.mjs'), '--dirs', 'ui'], { cwd: root, encoding: 'utf8' }).status, 0)
  assert.equal(coverage(root, ['ui']).used.size, 1)
})
