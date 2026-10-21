import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { REPO } from './helpers.mjs'
import { checkPlan } from '../tools/plan.mjs'

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
    const text = line.replace(/`[^`]*`/g, '')
    const targets = [
      ...[...text.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]),
      ...[...text.matchAll(/\s(?:src|srcset|href)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+/)[0])),
    ]
    for (const target of targets) {
      if (/^(https?:|mailto:|#|<|data:)/.test(target)) continue
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

test('the link check also reads HTML images', () => {
  assert.deepEqual(localLinks('<source media="(x)" srcset="docs/dark.png 2x, docs/dark-1x.png">\n<img alt="a" src="docs/light.png" width="8">'), [
    { line: 1, target: 'docs/dark.png' },
    { line: 1, target: 'docs/dark-1x.png' },
    { line: 2, target: 'docs/light.png' },
  ])
})

function ciProblems(text) {
  const yaml = text.replace(/^\s*#.*$/gm, '')
  const problems = []
  for (const [, ref] of yaml.matchAll(/uses:\s*(\S+)/g)) if (!/@[0-9a-f]{40}$/.test(ref)) problems.push(`not pinned by SHA: ${ref}`)
  if (!/^permissions:\n[ \t]+contents: read\n(?![ \t]+\S)/m.test(yaml)) problems.push('permissions must be only contents: read')
  if (/secrets\./.test(yaml)) problems.push('uses secrets')
  if (/pull_request_target/.test(yaml)) problems.push('uses pull_request_target')
  if (/\bdeploy\b/i.test(yaml)) problems.push('has a deploy step')
  if (!/persist-credentials: false/.test(yaml)) problems.push('checkout keeps credentials')
  if (!/CI=true scripts\/pre-pr\.sh/.test(yaml)) problems.push("doesn't run scripts/pre-pr.sh with CI=true")
  return problems
}

test('the project CI template is pinned, read-only and runs only the pre-PR script', () => {
  assert.deepEqual(ciProblems(readFileSync(join(REPO, 'templates', 'ci.yml'), 'utf8')), [])
})

test('projects choose CI on the first push, and can switch it later', () => {
  const agents = readFileSync(join(REPO, 'templates', 'project-AGENTS.md'), 'utf8')
  assert.match(agents, /^- \*\*CI:\*\* not chosen <!-- not chosen \| github-actions \| local only/m)
  assert.match(agents, /"Turn CI on" \/ "turn CI off"/)
  const prePr = readFileSync(join(REPO, 'workflows', 'pre-pr.md'), 'utf8').split('## CI\n')[1] || ''
  assert.match(prePr, /\.agents\/templates\/ci\.yml/)
  assert.match(prePr, /ask with the question tool: run these checks in GitHub Actions/)
  assert.match(prePr, /second question: make this check required on `main`\?/)
  assert.match(prePr, /Only on "yes"/)
  assert.match(prePr, /don't ask again/)
  assert.match(prePr, /CI never deploys/)
})

test('the CI template check notices tag pins, secrets, extra permissions and deploys', () => {
  const ok = readFileSync(join(REPO, 'templates', 'ci.yml'), 'utf8')
  const bad = {
    'not pinned by SHA: actions/checkout@v4': ok.replace(/actions\/checkout@[0-9a-f]{40}/, 'actions/checkout@v4'),
    'uses secrets': ok.replace('CI=true scripts/pre-pr.sh', 'CI=true TOKEN=${{ secrets.TOKEN }} scripts/pre-pr.sh'),
    'permissions must be only contents: read': ok.replace('  contents: read', '  contents: read\n  pull-requests: write'),
    'has a deploy step': ok + '      - run: infra/deploy.sh\n',
  }
  for (const [problem, text] of Object.entries(bad)) assert.ok(ciProblems(text).includes(problem), problem)
})

const section = (text, heading) => (text.split(heading)[1] || '').split(/\n#{1,2} /)[0]

test('/plan finds every question before asking any, and repeats until none are left', () => {
  const skill = readFileSync(join(REPO, 'skills', 'plan', 'SKILL.md'), 'utf8')
  const grill = skill.split('6. **Grill')[1]?.split('\n7. ')[0] || ''
  const order = ['Find every question before asking any', 'dry run', 'Write the full list into Open questions', 'Ask them in consecutive rounds', 'Ask about each risky action', 'Repeat the dry run', 'until a dry run finds none', 'Dry run: N questions, none left']
  let at = -1
  for (const phrase of order) {
    const i = grill.indexOf(phrase)
    assert.ok(i > at, `plan skill step 6: "${phrase}" missing or out of order`)
    at = i
  }
  assert.match(skill, /A change sends you back to the dry run/)
  assert.match(readFileSync(join(REPO, 'skills', 'build', 'SKILL.md'), 'utf8'), /run the grill[\s\S]*only after a dry run found no questions/)
})

test('the planning rule has the dry-run checklist and the Approved: rule', () => {
  const rule = section(readFileSync(join(REPO, 'rules', 'planning.md'), 'utf8'), '## Settle everything before approval')
  for (const item of ['goal and users', 'edge cases', 'UI states', 'Personal data', 'outside services and their cost', 'risky action', 'out of scope', 'how "done" is checked', 'pause anywhere']) assert.ok(rule.includes(item), `checklist: ${item}`)
  assert.match(rule, /`- \*\*Approved: <action>:\*\* <exactly what>`/)
  assert.match(rule, /only these as approved, and only for exactly what they name/)
  assert.match(readFileSync(join(REPO, 'rules', 'asking.md'), 'utf8'), /planning grill[\s\S]*consecutive rounds of up to 3/)
})

test('/build stops only for the five listed reasons, and decides and logs everything else', () => {
  const build = readFileSync(join(REPO, 'workflows', 'build-plan.md'), 'utf8')
  const run = section(build, '## 4. Run to the end')
  const decide = run.split('**Decide and log')[1]?.split('**Stop and ask only when**')[0] || ''
  for (const item of ['A decision the plan doesn\'t cover', 'An extra file', 'An unclear detail', 'Work beyond the plan']) assert.ok(decide.includes(item), `decide and log: ${item}`)
  assert.match(decide, /"Decided: <what> \(why\)"/)
  const stops = (run.split('**Stop and ask only when**')[1] || '').match(/^\d+\. .+$/gm) || []
  assert.equal(stops.length, 5, 'exactly five stop reasons')
  for (const [i, reason] of [/checkpoint/, /isn't covered by an `- \*\*Approved: …:\*\*` bullet .* names exactly this action/, /\*\*Stop and ask if\*\*/, /two genuinely different approaches/, /unrelated uncommitted changes/].entries()) assert.match(stops[i], reason)
  assert.match(section(build, '## 2.'), /"Also changed: <file> \(why\)"/)
  assert.doesNotMatch(build, /propose a plan edit/)
  assert.match(section(build, '## 5.'), /list every "Decided:" and "Also changed:" note/)
  assert.match(readFileSync(join(REPO, 'skills', 'incremental-implementation', 'SKILL.md'), 'utf8'), /"Also changed: <file> \(why\)"/)
})

test('a risky action counts as approved only with an Approved: bullet, and the template shows one', () => {
  assert.match(readFileSync(join(REPO, 'templates', 'project-AGENTS.md'), 'utf8'), /Ask before anything risky:\*\*.*A plan's `Approved:` bullet counts as asking, for exactly what it names\./)
  const template = readFileSync(join(REPO, 'templates', 'plan.md'), 'utf8')
  assert.match(section(template, '## Changes'), /^- \*\*Approved: <risky action>:\*\*/m)
  assert.deepEqual(checkPlan(template).errors, [])
})

test('walk-through: an approved secret passes the checker, and an unapproved migration has no Approved: bullet', () => {
  const plan = readFileSync(join(REPO, 'templates', 'plan.md'), 'utf8')
    .replace('status: draft', 'status: approved')
    .replace(/- \*\*Approved: <risky action>:\*\*.*/, '- **Approved: new secret:** STRIPE_SECRET_KEY in .env.local and the secret store')
    .replace(/## Open questions\n[\s\S]*?\n\n/, '## Open questions\nNone.\n\n')
    .replace(/(\|---\|---\|---\|---\|\n)/, '$1| Plan | 2026-10-20 | Dry run | Dry run: 5 questions, none left. |\n')
  assert.deepEqual(checkPlan(plan).errors, [])
  const approved = [...section(plan, '## Changes').matchAll(/^- \*\*Approved: (.+?):\*\*/gm)].map((m) => m[1])
  assert.deepEqual(approved, ['new secret'])
  assert.ok(!approved.includes('destructive migration'))
})

test('pre-PR and push keep AI attribution out of commits, files and PR descriptions', () => {
  const prePr = readFileSync(join(REPO, 'workflows', 'pre-pr.md'), 'utf8')
  const attribution = section(prePr, '## AI attribution')
  assert.match(attribution, /git rebase --exec 'node \.agents\/tools\/strip-attribution\.mjs --amend' <base>/)
  assert.match(attribution, /none of the branch's commits is on a remote yet/)
  assert.match(attribution, /\*\*Never rewrite pushed commits\.\*\*[\s\S]*ask/)
  const row5 = prePr.split('\n').find((l) => l.startsWith('| 5 |'))
  assert.match(row5, /strip-attribution\.mjs --check/)
  assert.match(row5, /git ls-files -z -- ':!\.agents'/)
  assert.match(row5, /AI attribution in a commit or file \|$/)
  const push = readFileSync(join(REPO, 'workflows', 'push.md'), 'utf8')
  assert.match(push, /read the description back[\s\S]*strip-attribution\.mjs --check[\s\S]*gh pr edit --body-file/)
  assert.match(readFileSync(join(REPO, 'rules', 'git.md'), 'utf8'), /commit-msg` hook strips them[\s\S]*Never rewrite pushed commits without asking/)
  assert.match(readFileSync(join(REPO, 'templates', 'project-AGENTS.md'), 'utf8'), /\*\*Setup:\*\*.*commit-msg` hook doesn't run `\.agents\/tools\/strip-attribution\.mjs`.*install-attribution\.mjs/)
})

test('the flow-document skill points to installed paths, saves to the repo and keeps its five rules', () => {
  const skill = readFileSync(join(REPO, 'skills', 'flow-document', 'SKILL.md'), 'utf8')
  assert.match(skill, /`\.agents\/templates\/flow-document\.html`/)
  assert.deepEqual(skill.match(/(?<![.\w/-])(rules|workflows|skills|templates|references|reviewers|tools)\/[\w./-]+/g) || [], [], 'playbook paths need .agents/')
  assert.match(skill, /\*\*Where it goes:\*\* the repo \(default: `docs\/flow\/index\.html`/)
  assert.doesNotMatch(skill, /publish/i)
  for (const rule of [/\*\*Examples are real\.\*\*.*Never invent/, /Never show an estimate as measured/, /\*\*Don't mix eras:\*\*/, /\*\*Waiting counts:\*\*/, /\*\*No private values:\*\*/, /continues at step N/]) assert.match(skill, rule)
})

/** Problems with a flow.json against the flow-document skill's schema (section 6). */
function flowProblems(flow) {
  const problems = []
  const ids = new Set()
  const walk = (nodes, depth, where) => nodes.forEach((n, i) => {
    const at = `${where}[${i}]`
    for (const key of ['id', 'title', 'summary']) if (!n[key]) problems.push(`${at}: no ${key}`)
    if (n.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n.id)) problems.push(`${at}: id ${n.id} isn't lowercase-hyphenated`)
    if (ids.has(n.id)) problems.push(`${at}: id ${n.id} is used twice`)
    ids.add(n.id)
    for (const st of n.steps || []) if (!['AI', 'EXT', 'CODE', 'USER'].includes(st.kind)) problems.push(`${at}: unknown kind ${st.kind}`)
    if (n.branches?.length) {
      if (depth === 2) problems.push(`${at}: branches go at most two levels deep`)
      else walk(n.branches, depth + 1, `${at}.branches`)
    }
  })
  walk(flow.nodes || [], 0, 'nodes')
  for (const [t, tree] of (flow.trees || []).entries()) walk(tree.nodes || [], 0, `trees[${t}].nodes`)
  return problems
}

test('the flow page template is a valid document whose made-up example follows the schema', () => {
  const html = readFileSync(join(REPO, 'templates', 'flow-document.html'), 'utf8')
  assert.match(html, /^<!doctype html>\n<html lang="en">/)
  assert.doesNotMatch(html, /\b(claude|codex|copilot)\b|\bcursor\b(?!:)/i)
  const flow = JSON.parse(html.match(/<script type="application\/json" id="flow-data">\n([\s\S]*?)\n<\/script>/)[1])
  assert.deepEqual(flowProblems(flow), [])
  assert.equal(flow.nodes.length, 4)
  assert.equal(flow.nodes.flatMap((n) => n.branches || []).length, 2)
  assert.match(flow.footer[0], /Made-up example/)
})

test('the flow schema check notices a third branch level and an unknown kind', () => {
  const leaf = (id, extra = {}) => ({ id, title: 't', summary: 's', ...extra })
  const deep = { nodes: [leaf('a', { branches: [leaf('b', { branches: [leaf('c', { branches: [leaf('d')] })] })] })] }
  assert.deepEqual(flowProblems(deep), ['nodes[0].branches[0].branches[0]: branches go at most two levels deep'])
  assert.deepEqual(flowProblems({ nodes: [leaf('a', { steps: [{ kind: 'DB' }] })] }), ['nodes[0]: unknown kind DB'])
})
