#!/usr/bin/env node
// Fails when UI code uses a shared component that isn't `approved` in DESIGN.md's Approvals table.
//   node .agents/tools/design-coverage.mjs [--root <dir>] [--dirs components/ui,components/design]
// A shared component is a file in one of the --dirs; its name is the file name (dropdown-menu.tsx → "dropdown-menu"),
// matched to an Approvals row by name ("Dropdown menu"). The latest row for an item decides its status.
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const UI_FILE = /\.(tsx|jsx|ts|js|vue|svelte|astro|mdx)$/
const SKIP = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.output', '.agents', 'dist', 'build', 'out', 'coverage'])
export const NO_TABLE = 'No Approvals table: run /front-end-design'

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Item slug → status from the `## Approvals & changelog` table, or null when there's no such table. */
export function approvals(designText) {
  const body = designText.split(/^## Approvals & changelog\s*$/m)[1]
  if (body === undefined) return null
  const rows = body.split(/\n## /)[0].split('\n').filter((l) => l.trim().startsWith('|'))
  const header = rows[0]?.split('|').map((c) => c.trim().toLowerCase())
  if (!header || !header.includes('item') || !header.includes('status')) return null
  const [item, status] = [header.indexOf('item'), header.indexOf('status')]
  const out = new Map()
  for (const row of rows.slice(2)) {
    const cells = row.split('|').map((c) => c.trim())
    if (cells[item]) out.set(slug(cells[item].replace(/[*`]/g, '')), cells[status].toLowerCase())
  }
  return out
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) yield* walk(join(dir, entry.name))
    } else if (UI_FILE.test(entry.name)) yield join(dir, entry.name)
  }
}

/** Shared component name → files that import it, for imports like '@/components/ui/button' or '../components/ui/button'. */
export function usedComponents(root, dirs) {
  const used = new Map()
  const patterns = dirs.map((d) => new RegExp(`['"](?:[^'"\\n]*[/@~.])?${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([\\w-]+)(?:\\.\\w+)?(?:/[^'"\\n]*)?['"]`, 'g'))
  for (const file of walk(root)) {
    const rel = relative(root, file).split(sep).join('/')
    if (dirs.some((d) => rel.startsWith(`${d}/`) || rel.includes(`/${d}/`))) continue
    const text = readFileSync(file, 'utf8')
    for (const re of patterns) {
      for (const m of text.matchAll(re)) {
        const name = m[1]
        if (!used.has(name)) used.set(name, [])
        if (!used.get(name).includes(rel)) used.get(name).push(rel)
      }
    }
  }
  return used
}

/** { problems: [string], used: Map } for a project root. */
export function coverage(root, dirs = ['components/ui', 'components/design']) {
  const designPath = join(root, 'DESIGN.md')
  const table = existsSync(designPath) ? approvals(readFileSync(designPath, 'utf8')) : null
  if (!table) return { problems: [NO_TABLE], used: new Map() }
  const used = usedComponents(root, dirs)
  const problems = []
  for (const [name, files] of [...used].sort(([a], [b]) => a.localeCompare(b))) {
    const status = table.get(slug(name))
    if (status !== 'approved') problems.push(`${name}: ${status ? `status is "${status}"` : 'not in DESIGN.md'} (used in ${files.join(', ')})`)
  }
  return { problems, used }
}

function main(args) {
  const opt = (name) => {
    const i = args.indexOf(name)
    return i >= 0 ? args[i + 1] : undefined
  }
  const root = resolve(opt('--root') || '.')
  const dirs = (opt('--dirs') || 'components/ui,components/design').split(',').map((d) => d.trim().replace(/^\.?\/|\/$/g, '')).filter(Boolean)
  const { problems, used } = coverage(root, dirs)
  if (problems.length) {
    console.error(problems[0] === NO_TABLE ? NO_TABLE : `Components not approved in DESIGN.md:\n${problems.map((p) => `  ${p}`).join('\n')}`)
    return 1
  }
  console.log(`Design coverage: ${used.size} shared component(s), all approved.`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href) {
  process.exitCode = main(process.argv.slice(2))
}
