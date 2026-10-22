#!/usr/bin/env node
// Builds 12-step OKLCH neutral and accent scales (Radix step roles) for light and dark themes, as DESIGN.md
// colour lines, and checks the text and UI pairs against WCAG 2.2 AA. Exit 1 if a required pair fails.
//   node .agents/tools/design-palette.mjs --hue <0-360> [--chroma 0.2] [--neutral-chroma 0.008] [--accent-lightness 0.55]
// Paste the printed lines under `colors:` in DESIGN.md; the contrast report goes to stderr.
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Lightness per step, 1–12. Steps 9–10 of the accent come from --accent-lightness.
const L = {
  light: { neutral: [0.993, 0.982, 0.958, 0.934, 0.91, 0.884, 0.846, 0.775, 0.64, 0.6, 0.5, 0.22], accent: [0.993, 0.978, 0.95, 0.92, 0.885, 0.84, 0.78, 0.7, null, null, 0.48, 0.3] },
  dark: { neutral: [0.17, 0.2, 0.235, 0.26, 0.285, 0.315, 0.36, 0.44, 0.5, 0.56, 0.77, 0.95], accent: [0.18, 0.21, 0.27, 0.31, 0.35, 0.4, 0.46, 0.53, null, null, 0.78, 0.93] },
}
// Share of the accent chroma per step: faint backgrounds, rising through borders, full at the solid steps.
const ACCENT_CHROMA = [0.03, 0.07, 0.16, 0.26, 0.36, 0.45, 0.55, 0.7, 1, 0.95, 0.9, 0.5]
const NEUTRAL_CHROMA = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1, 1, 1, 0.9]

/** OKLCH → linear sRGB (Björn Ottosson's OKLab matrices). */
function linearRgb(l, c, h) {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)

/** The largest chroma up to `c` that stays inside sRGB at this lightness and hue. */
function fitChroma(l, c, h) {
  if (inGamut(linearRgb(l, c, h))) return c
  let lo = 0
  let hi = c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(linearRgb(l, mid, h))) lo = mid
    else hi = mid
  }
  return lo
}

/** WCAG relative luminance of an { l, c, h } colour. */
export function luminance({ l, c, h }) {
  const [r, g, b] = linearRgb(l, c, h).map((v) => Math.min(1, Math.max(0, v)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const WHITE = { l: 1, c: 0, h: 0 }

/** Both scales for both themes: { light: { neutral: [12], accent: [12] }, dark: {…}, onPrimary: { light, dark } }. */
export function scales({ hue, chroma = 0.2, neutralChroma = 0.008, accentLightness = 0.55 }) {
  const out = {}
  for (const theme of ['light', 'dark']) {
    const hover = theme === 'light' ? -0.04 : 0.05
    const accentL = L[theme].accent.map((v, i) => v ?? (i === 8 ? accentLightness : accentLightness + hover))
    out[theme] = {
      neutral: L[theme].neutral.map((l, i) => ({ l, c: fitChroma(l, neutralChroma * NEUTRAL_CHROMA[i], hue), h: hue })),
      accent: accentL.map((l, i) => ({ l, c: fitChroma(l, chroma * ACCENT_CHROMA[i], hue), h: hue })),
    }
  }
  out.onPrimary = {}
  for (const theme of ['light', 'dark']) {
    const solid = out[theme].accent[8]
    out.onPrimary[theme] = contrast(WHITE, solid) >= contrast(out.light.neutral[11], solid) ? WHITE : out.light.neutral[11]
  }
  return out
}

/** The pairs every palette must pass: [label, foreground, background, minimum ratio]. */
export function requiredPairs(s) {
  const pairs = []
  for (const theme of ['light', 'dark']) {
    const { neutral: n, accent: a } = s[theme]
    pairs.push(
      [`${theme}: text (neutral-12) on background (neutral-1)`, n[11], n[0], 4.5],
      [`${theme}: text (neutral-12) on surface (neutral-2)`, n[11], n[1], 4.5],
      [`${theme}: muted text (neutral-11) on background`, n[10], n[0], 4.5],
      [`${theme}: muted text (neutral-11) on surface`, n[10], n[1], 4.5],
      [`${theme}: accent text (accent-11) on background`, a[10], n[0], 4.5],
      [`${theme}: on-primary on primary (accent-9)`, s.onPrimary[theme], a[8], 4.5],
      [`${theme}: primary and focus ring (accent-9) on background`, a[8], n[0], 3],
    )
  }
  return pairs.map(([label, fg, bg, min]) => ({ label, ratio: contrast(fg, bg), min }))
}

const fmt = ({ l, c, h }) => `"oklch(${l.toFixed(3)} ${c.toFixed(3)} ${Math.round(h)})"`

/** DESIGN.md colour lines (two-space indent, ready to go under `colors:`). */
export function yamlLines(s) {
  const lines = []
  for (const theme of ['light', 'dark']) {
    const suffix = theme === 'dark' ? '-dark' : ''
    for (const name of ['neutral', 'accent']) s[theme][name].forEach((v, i) => lines.push(`  ${name}-${i + 1}${suffix}: ${fmt(v)}`))
  }
  lines.push(`  on-primary: ${s.onPrimary.light === WHITE ? '"#ffffff"' : '"{colors.neutral-12}"'}`)
  lines.push(`  on-primary-dark: ${s.onPrimary.dark === WHITE ? '"#ffffff"' : '"{colors.neutral-12}"'}`)
  return lines
}

function parseArgs(args) {
  const opts = {}
  const names = { '--hue': 'hue', '--chroma': 'chroma', '--neutral-chroma': 'neutralChroma', '--accent-lightness': 'accentLightness' }
  for (let i = 0; i < args.length; i += 2) {
    const key = names[args[i]]
    const value = Number(args[i + 1])
    if (!key || !Number.isFinite(value)) return null
    opts[key] = value
  }
  return opts.hue === undefined ? null : opts
}

function main(args) {
  const opts = parseArgs(args)
  if (!opts) {
    console.error('usage: design-palette.mjs --hue <0-360> [--chroma 0.2] [--neutral-chroma 0.008] [--accent-lightness 0.55]')
    return 2
  }
  const s = scales(opts)
  console.log(yamlLines(s).join('\n'))
  const pairs = requiredPairs(s)
  for (const p of pairs) console.error(`${p.ratio >= p.min ? 'pass' : 'FAIL'}  ${p.ratio.toFixed(2)}:1 (needs ${p.min}:1)  ${p.label}`)
  return pairs.every((p) => p.ratio >= p.min) ? 0 : 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href) {
  process.exitCode = main(process.argv.slice(2))
}
