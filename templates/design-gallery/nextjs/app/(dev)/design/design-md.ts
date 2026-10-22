import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type Tokens = Record<string, string>
export type DesignMd = {
  name: string
  colors: Tokens
  typography: Record<string, Tokens>
  spacing: Tokens
  rounded: Tokens
  motion: Tokens
  approvals: { item: string; version: string; status: string; date: string }[]
}

const unquote = (v: string) => v.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')

/** `{ a: 1, b: "x" }` → { a: '1', b: 'x' } (flat flow maps, as DESIGN.md uses them). */
function flowMap(text: string): Tokens {
  const out: Tokens = {}
  for (const part of text.replace(/^\{|\}$/g, '').split(/,(?=\s*[\w-]+:)/)) {
    const kv = part.match(/^\s*([\w-]+):\s*(.*)$/)
    if (kv) out[kv[1]] = unquote(kv[2])
  }
  return out
}

export function parseDesignMd(text: string): DesignMd {
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? ''
  const groups: Record<string, Record<string, string>> = {}
  let name = ''
  let group: string | null = null
  for (const line of front.split('\n')) {
    if (/^\s*#/.test(line) || !line.trim()) continue
    const top = line.match(/^([\w-]+):\s*(.*)$/)
    if (top) {
      if (top[1] === 'name') name = unquote(top[2])
      group = top[2] && !top[2].startsWith('#') ? null : top[1]
      if (group) groups[group] = {}
      continue
    }
    const kv = group && line.match(/^ {2}([\w-]+):\s*(.+?)\s*(?:#.*)?$/)
    if (kv && group) groups[group][kv[1]] = kv[2]
  }
  const plain = (g: string): Tokens => Object.fromEntries(Object.entries(groups[g] ?? {}).map(([k, v]) => [k, unquote(v)]))
  const typography = Object.fromEntries(Object.entries(groups.typography ?? {}).map(([k, v]) => [k, flowMap(v)]))

  const table = text.split(/^## Approvals & changelog\s*$/m)[1]?.split(/\n## /)[0] ?? ''
  const rows = table.split('\n').filter((l) => l.trim().startsWith('|')).slice(2)
  const approvals = rows.map((r) => {
    const [item = '', version = '', status = '', date = ''] = r.split('|').slice(1, -1).map((c) => c.trim())
    return { item, version, status: status.toLowerCase(), date }
  })
  const colors = plain('colors')
  const resolve = (value: string, depth = 0): string => {
    const ref = value.match(/^\{colors\.([\w-]+)\}$/)
    return ref && depth < 10 && colors[ref[1]] ? resolve(colors[ref[1]], depth + 1) : value
  }
  for (const key of Object.keys(colors)) colors[key] = resolve(colors[key])
  return { name, colors, typography, spacing: plain('spacing'), rounded: plain('rounded'), motion: plain('motion'), approvals }
}

export function readDesignMd(): DesignMd {
  return parseDesignMd(readFileSync(join(process.cwd(), 'DESIGN.md'), 'utf8'))
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** The latest status for an item ("Dropdown menu" and "dropdown-menu" match), or "missing". */
export function statusOf(design: DesignMd, item: string): string {
  const rows = design.approvals.filter((a) => slug(a.item) === slug(item))
  return rows.at(-1)?.status ?? 'missing'
}
