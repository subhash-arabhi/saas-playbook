#!/usr/bin/env node
// Removes AI-tool attribution from commit messages and PR descriptions: agent Co-authored-by and
// Claude-Session trailers, and "Generated with" / "Made with" lines naming an AI tool. Human co-authors stay.
//   node tools/strip-attribution.mjs <file>     rewrite a commit message file in place (the commit-msg hook)
//   node tools/strip-attribution.mjs --amend    strip the HEAD commit's message, amending only if it changes
//   node tools/strip-attribution.mjs --check [files...]   print attribution found in the files (or stdin); exit 1 if any
import { readFileSync, writeFileSync, realpathSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const TOOLS = 'claude(?: code)?|cursor(?: agent)?|codex|openai|chatgpt|(?:github )?copilot|gemini(?: code assist)?|jules|windsurf|codeium|aider|devin|amazon q|cody|tabnine'
const AGENT_NAME = new RegExp(`^(?:${TOOLS})$`, 'i')
const AGENT_DOMAIN = /@(?:[\w-]+\.)*(?:cursor\.com|anthropic\.com|openai\.com|aider\.chat|windsurf\.com|codeium\.com|cognition\.ai|devin\.ai)>?$/i
const AGENT_GITHUB = /(?:^|\+)(?:copilot|cursor(?:agent)?|claude|codex|devin-ai-integration|google-labs-jules|gemini-code-assist|openai-codex)(?:\[bot\])?@users\.noreply\.github\.com>?$/i
const TRAILER = /^\s*(co-authored-by|assisted-by|generated-by|ai-assisted-by)\s*:\s*(.*?)\s*$/i
const SESSION = /^\s*claude-session\s*:/i
const LINE = new RegExp(`^\\s*(?:🤖\\s*)?(?:generated|created|made|built|written|co-?authored)\\s+(?:with|by|using|in)\\s+\\[?(?:${TOOLS})\\b`, 'i')
export const HOOK_MARK = 'saas-playbook: strip AI attribution'

function agentValue(value) {
  const m = value.match(/^(.*?)\s*<([^>]*)>?$/)
  const name = (m ? m[1] : value).trim()
  const email = m ? `<${m[2]}>` : ''
  return AGENT_NAME.test(name) || AGENT_DOMAIN.test(email) || AGENT_GITHUB.test(email.replace(/^</, ''))
}

const isAttribution = (line) => {
  const t = line.match(TRAILER)
  return (t && agentValue(t[2])) || SESSION.test(line) || LINE.test(line)
}

export function findAttribution(text) {
  return text.split('\n').flatMap((line, i) => (!line.startsWith('#') && isAttribution(line) ? [{ line: i + 1, text: line.trim() }] : []))
}

export function stripAttribution(text) {
  const lines = text.split('\n')
  const kept = lines.filter((line) => line.startsWith('#') || !isAttribution(line))
  if (kept.length === lines.length) return text
  const out = kept.join('\n').replace(/\n{3,}/g, '\n\n')
  const body = out.replace(/\s+$/, '')
  return body ? `${body}\n` : ''
}

function main(args) {
  if (args[0] === '--check') {
    const sources = args.length > 1 ? args.slice(1).map((f) => [f, readFileSync(f, 'utf8')]) : [['stdin', readFileSync(0, 'utf8')]]
    const found = sources.flatMap(([name, text]) => findAttribution(text).map((f) => `${name}:${f.line}: ${f.text}`))
    found.forEach((f) => console.log(f))
    return found.length ? 1 : 0
  }
  if (args[0] === '--amend') {
    const msg = execFileSync('git', ['log', '-1', '--format=%B'], { encoding: 'utf8' })
    const clean = stripAttribution(msg)
    if (clean !== msg) execFileSync('git', ['commit', '--amend', '--no-verify', '--allow-empty', '-F', '-'], { input: clean, stdio: ['pipe', 'ignore', 'inherit'] })
    return 0
  }
  if (!args[0]) {
    console.error('usage: strip-attribution.mjs <commit-msg-file> | --amend | --check [files...]')
    return 2
  }
  const text = readFileSync(args[0], 'utf8')
  const clean = stripAttribution(text)
  if (clean !== text) writeFileSync(args[0], clean)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href) {
  process.exitCode = main(process.argv.slice(2))
}
