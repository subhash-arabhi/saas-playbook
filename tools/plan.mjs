#!/usr/bin/env node
// Plan tools (no dependencies). Also used as the core of the editor extension in tools/plan-editor/.
//   node .agents/tools/plan.mjs check [plans/<name>.md ...]   validate plan format (exit 1 on errors)
//   node .agents/tools/plan.mjs view [--port 4600]            local viewer/editor at http://localhost:4600
//   node .agents/tools/plan.mjs open plans/<name>.md          show a plan: in Cursor/VS Code, else in the viewer
//   node .agents/tools/plan.mjs url plans/<name>.md           print the plan's viewer URL (starts the viewer if needed)
import { createServer, get as httpGet } from 'node:http'
import { createHash } from 'node:crypto'
import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, existsSync, realpathSync } from 'node:fs'
import { join, basename, dirname, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const STATUSES = ['draft', 'approved', 'building', 'done']
const STEP_KEYS = ['id', 'title', 'summary', 'done', 'checkpoint']
const SECTIONS = ["What we're building", 'Changes', 'Steps', 'Open questions', 'Build log']
const EDITABLE_SECTIONS = ["What we're building", 'Changes', 'Open questions']

// ---------- front matter (small YAML subset: scalars + one list of flat maps) ----------
function parseScalar(raw) {
  const v = raw.trim()
  if (v === 'true') return true
  if (v === 'false') return false
  if (/^-?\d+$/.test(v)) return Number(v)
  if (v.startsWith('"')) {
    if (!v.endsWith('"') || v.length < 2) throw new Error(`unterminated string: ${v}`)
    return JSON.parse(v)
  }
  if (v.startsWith("'")) throw new Error(`use double quotes, not single quotes: ${v}`)
  return v
}

export function parsePlan(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error('missing front matter: the file must start with a --- block')
  const data = {}
  let list = null
  let item = null
  m[1].split('\n').forEach((line, i) => {
    if (!line.trim() || line.trim().startsWith('#')) return
    const top = line.match(/^([A-Za-z]\w*):\s*(.*)$/)
    const listStart = line.match(/^  - ([A-Za-z]\w*):\s*(.*)$/)
    const listCont = line.match(/^    ([A-Za-z]\w*):\s*(.*)$/)
    try {
      if (top) {
        list = null
        if (top[2] === '') data[top[1]] = list = []
        else data[top[1]] = parseScalar(top[2])
      } else if (listStart && list) {
        item = { [listStart[1]]: parseScalar(listStart[2]) }
        list.push(item)
      } else if (listCont && item) item[listCont[1]] = parseScalar(listCont[2])
      else throw new Error('unexpected line')
    } catch (e) {
      throw new Error(`front matter line ${i + 2}: ${e.message}: "${line}"`)
    }
  })
  return { data, body: m[2] }
}

function sections(body) {
  const out = { h1: '', h2: new Map(), steps: new Map() }
  let cur = null
  let step = null
  for (const line of body.split('\n')) {
    if (!out.h1 && /^# /.test(line)) {
      out.h1 = line
      continue
    }
    const h2 = line.match(/^## (.+?)\s*$/)
    const h3 = line.match(/^### Step (\d+): (.+?)\s*$/)
    if (h2) {
      cur = h2[1]
      step = null
      out.h2.set(cur, [])
    } else if (h3 && cur === 'Steps') {
      step = Number(h3[1])
      out.steps.set(step, { title: h3[2], lines: [] })
    } else if (step !== null) out.steps.get(step).lines.push(line)
    else if (cur) out.h2.get(cur).push(line)
  }
  return out
}

const trimBlock = (lines) => lines.join('\n').replace(/^\n+|\s+$/g, '')
export const versionOf = (text) => createHash('sha1').update(text).digest('hex').slice(0, 16)

// ---------- model <-> text ----------
function toModel(text) {
  const { data, body } = parsePlan(text)
  const sec = sections(body)
  const model = { data, sections: {}, steps: {} }
  for (const k of SECTIONS) if (k !== 'Steps') model.sections[k] = trimBlock(sec.h2.get(k) || [])
  for (const s of data.steps || []) model.steps[s.id] = trimBlock(sec.steps.get(s.id)?.lines || [])
  return model
}

const q = (s) => JSON.stringify(String(s))
function fromModel({ data, sections: secs, steps }) {
  const fm = ['---', `name: ${q(data.name)}`, `status: ${data.status}`, 'steps:']
  for (const s of data.steps) fm.push(`  - id: ${s.id}`, `    title: ${q(s.title)}`, `    summary: ${q(s.summary)}`, `    done: ${!!s.done}`, `    checkpoint: ${!!s.checkpoint}`)
  fm.push('---', '')
  const body = [`# Plan: ${data.name}`, '']
  for (const k of SECTIONS) {
    body.push(`## ${k}`)
    if (k === 'Steps') {
      body.push('')
      for (const s of data.steps) body.push(`### Step ${s.id}: ${s.title}`, steps[s.id] || '', '')
    } else body.push(secs[k] || '', '')
  }
  return fm.join('\n') + body.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s*$/, '\n')
}

// ---------- check ----------
export function checkPlan(text) {
  const errors = []
  const warnings = []
  let plan
  try {
    plan = parsePlan(text)
  } catch (e) {
    return { errors: [e.message], warnings }
  }
  const { data, body } = plan
  if (typeof data.name !== 'string' || !data.name) errors.push('front matter: "name" is required')
  if (!STATUSES.includes(data.status)) errors.push(`front matter: "status" must be one of ${STATUSES.join(', ')}`)
  const steps = Array.isArray(data.steps) ? data.steps : []
  if (!steps.length) errors.push('front matter: "steps" must list at least one step')
  steps.forEach((s, i) => {
    const where = `front matter step ${i + 1}`
    for (const k of STEP_KEYS) if (!(k in s)) errors.push(`${where}: missing "${k}"`)
    for (const k of Object.keys(s)) if (!STEP_KEYS.includes(k)) errors.push(`${where}: unknown key "${k}"`)
    if (s.id !== i + 1) errors.push(`${where}: id must be ${i + 1}`)
    if (typeof s.title !== 'string' || !s.title || s.title.length > 60) errors.push(`${where}: title must be 1–60 characters`)
    if (typeof s.summary !== 'string' || !s.summary || s.summary.length > 160) errors.push(`${where}: summary must be one line, 1–160 characters`)
    if (typeof s.done !== 'boolean' || typeof s.checkpoint !== 'boolean') errors.push(`${where}: done and checkpoint must be true or false`)
  })
  if (steps.length && (steps.length < 5 || steps.length > 12)) warnings.push(`${steps.length} steps; aim for about 5–12`)

  const sec = sections(body)
  if (sec.h1 !== `# Plan: ${data.name}`) errors.push(`body must start with "# Plan: ${data.name}"`)
  const present = [...sec.h2.keys()]
  for (const h of SECTIONS) if (!sec.h2.has(h)) errors.push(`body: missing section "## ${h}"`)
  if (present.filter((h) => SECTIONS.includes(h)).join('|') !== SECTIONS.filter((h) => sec.h2.has(h)).join('|')) errors.push(`body: sections must be in this order: ${SECTIONS.join(', ')}`)
  for (const h of present) if (!SECTIONS.includes(h)) errors.push(`body: unexpected section "## ${h}" (plans describe changes only)`)

  const changes = (sec.h2.get('Changes') || []).filter((l) => /^- /.test(l))
  if (!changes.length) errors.push('Changes: list every change as "- **Name:** what changes"')
  changes.forEach((c) => {
    if (!/^- \*\*[^*]+:\*\* \S/.test(c)) errors.push(`Changes: use "- **Name:** description": ${c.slice(0, 60)}`)
    if (c.length > 260) warnings.push(`Changes: keep bullets to 2 lines: ${c.slice(0, 50)}…`)
  })

  steps.forEach((s) => {
    const d = sec.steps.get(s.id)
    if (!d) return errors.push(`Steps: missing "### Step ${s.id}: ${s.title}"`)
    if (d.title !== s.title) errors.push(`Step ${s.id}: heading title "${d.title}" doesn't match front matter "${s.title}"`)
    const txt = d.lines.join('\n')
    for (const label of ['Do:', 'Files:', 'Done when:', 'Check:']) if (!txt.includes(`**${label}**`)) errors.push(`Step ${s.id}: missing **${label}**`)
    const doneItems = (txt.split('**Done when:**')[1] || '').split('**Check:**')[0].split('\n').filter((l) => /^- \[[ x]\] /.test(l))
    if (!doneItems.length) errors.push(`Step ${s.id}: **Done when:** needs "- [ ] …" items`)
    if (doneItems.length > 5) errors.push(`Step ${s.id}: **Done when:** has ${doneItems.length} items; split the step (max 5)`)
    if (s.done && doneItems.some((l) => l.startsWith('- [ ]'))) errors.push(`Step ${s.id}: done is true but some Done-when items aren't ticked`)
  })
  for (const id of sec.steps.keys()) if (!steps.find((s) => s.id === id)) errors.push(`Steps: "### Step ${id}" isn't in the front matter`)

  if (data.status !== 'draft' && hasOpenQuestions(sec.h2.get('Open questions') || [])) errors.push(`status is ${data.status} but Open questions isn't empty (write "None.")`)
  return { errors, warnings, plan }
}
const hasOpenQuestions = (lines) => lines.some((l) => /^(- |\d+\. )/.test(l))

/** Everything a viewer needs to render a plan. */
export function stateOf(text) {
  const { errors, warnings, plan } = checkPlan(text)
  if (!plan) return { error: errors.join('; '), version: versionOf(text) }
  const model = toModel(text)
  const openQuestions = hasOpenQuestions(model.sections['Open questions'].split('\n'))
  return { data: model.data, sections: model.sections, steps: model.steps, errors, warnings, version: versionOf(text), canApprove: model.data.status === 'draft' && !errors.length && !openQuestions }
}

/** Apply one user edit. Returns { text } or { conflict: true } / { error }. Viewers never change `done`. */
export function applyOp(text, op, version) {
  if (version && version !== versionOf(text)) return { conflict: true }
  let model
  try {
    model = toModel(text)
  } catch (e) {
    return { error: e.message }
  }
  const step = model.data.steps.find((s) => s.id === op.id)
  const oneLine = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').trim()
  if (op.type === 'checkpoint') {
    if (!step) return { error: 'step not found' }
    step.checkpoint = !!op.value
  } else if (op.type === 'section') {
    if (!EDITABLE_SECTIONS.includes(op.key)) return { error: 'section is not editable' }
    model.sections[op.key] = String(op.text ?? '').replace(/\s+$/, '')
  } else if (op.type === 'step') {
    if (!step) return { error: 'step not found' }
    step.title = oneLine(op.title) || step.title
    step.summary = oneLine(op.summary) || step.summary
    model.steps[step.id] = String(op.details ?? '').replace(/\s+$/, '')
  } else if (op.type === 'approve') {
    const st = stateOf(text)
    if (!st.canApprove) return { error: 'the plan can be approved only as a draft with no format errors and no open questions' }
    model.data.status = 'approved'
  } else return { error: 'unknown edit' }
  return { text: fromModel(model) }
}

// ---------- page (shared by the local server and the editor extension) ----------
const CLIENT = String.raw`
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inline=s=>esc(s).split(/(` + '`' + String.raw`[^` + '`' + String.raw`]+` + '`' + String.raw`)/).map((t,i)=>i%2?'<code>'+t.slice(1,-1)+'</code>':t.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')).join('');
function md(src){const L=String(src||'').replace(/<!--[\s\S]*?-->/g,'').split('\n');let h='',list=null,code=null;const close=()=>{if(list){h+='</'+list+'>';list=null}};
 for(let i=0;i<L.length;i++){const l=L[i];
  if(l.startsWith('` + '```' + String.raw`')){if(code===null){close();code=''}else{h+='<pre><code>'+esc(code)+'</code></pre>';code=null}continue}
  if(code!==null){code+=l+'\n';continue}
  if(/^\|/.test(l)){close();let rows=[];while(i<L.length&&/^\|/.test(L[i]))rows.push(L[i++]);i--;rows=rows.filter(r=>!/^\|[\s:|-]+\|$/.test(r));
   h+='<table>'+rows.map((r,j)=>'<tr>'+r.slice(1,-1).split('|').map(c=>j?'<td>'+inline(c.trim())+'</td>':'<th>'+inline(c.trim())+'</th>').join('')+'</tr>').join('')+'</table>';continue}
  let m;
  if(m=l.match(/^\s*- \[([ x])\] (.*)/)){if(list!=='ul'){close();h+='<ul>';list='ul'}h+='<li class="task">'+(m[1]==='x'?'☑':'☐')+' '+inline(m[2])+'</li>';continue}
  if(m=l.match(/^\s*[-*] (.*)/)){if(list!=='ul'){close();h+='<ul>';list='ul'}h+='<li>'+inline(m[1])+'</li>';continue}
  if(m=l.match(/^\s*\d+\. (.*)/)){if(list!=='ol'){close();h+='<ol>';list='ol'}h+='<li>'+inline(m[1])+'</li>';continue}
  close();if(l.trim())h+='<p>'+inline(l)+'</p>'}
 close();return h}
let S=null,editing=null,openSteps=new Set(),notice='';
const $=id=>document.getElementById(id);
function render(){const el=$('plan');if(!S)return;if(S.error){el.innerHTML='<p class="err">'+esc(S.error)+'</p>';return}
 const d=S.data;let h='<header><div><h1>'+esc(d.name)+'</h1><span class="pill '+esc(d.status)+'">'+esc(d.status)+'</span></div><div class="actions">'+
  (S.canApprove?'<button class="primary" id="approve">Approve plan</button>':'')+(HOST.openText?'<button id="raw">Open as text</button>':'')+'</div></header>';
 if(notice)h+='<p class="notice">'+esc(notice)+'</p>';
 if(S.errors.length)h+='<div class="err"><b>Format errors</b><ul>'+S.errors.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul></div>';
 const sec=(key,cls)=>{const isEd=editing&&editing.kind==='section'&&editing.key===key;
  return '<h2>'+esc(key)+(isEd?'':' <button class="edit" data-sec="'+esc(key)+'">Edit</button>')+'</h2>'+
   (isEd?'<textarea id="ed-text" rows="'+Math.max(4,S.sections[key].split('\n').length+2)+'">'+esc(S.sections[key])+'</textarea><div class="row"><button class="primary" id="save">Save</button><button id="cancel">Cancel</button></div>'
   :'<section class="'+(cls||'')+'">'+md(S.sections[key])+'</section>')};
 h+=sec("What we're building")+sec('Changes','card');
 h+='<h2>Steps</h2><p class="hint">Click a circle to pause the build after that step. Expand a step to read or edit it.</p>';
 for(const s of d.steps){const isEd=editing&&editing.kind==='step'&&editing.id===s.id;const open=isEd||openSteps.has(s.id);
  h+='<details class="step"'+(open?' open':'')+' data-id="'+s.id+'"><summary><span class="chev">▸</span><span class="st"><b>Step '+s.id+': '+esc(s.title)+'</b><span>'+esc(s.summary)+'</span></span>'+
   '<span class="badge'+(s.done?' done':'')+'">'+(s.done?'✓ Done':'To do')+'</span>'+
   '<button class="cp'+(s.checkpoint?' on':'')+'" data-id="'+s.id+'" title="Checkpoint: pause after this step"><i></i><span>Checkpoint</span></button></summary><div class="body">';
  if(isEd)h+='<label>Title<input id="ed-title" maxlength="60" value="'+esc(s.title)+'"></label><label>One-line summary<input id="ed-summary" maxlength="160" value="'+esc(s.summary)+'"></label>'+
   '<label>Details<textarea id="ed-text" rows="'+Math.max(8,S.steps[s.id].split('\n').length+2)+'">'+esc(S.steps[s.id])+'</textarea></label><div class="row"><button class="primary" id="save">Save</button><button id="cancel">Cancel</button></div>';
  else h+='<div class="row end"><button class="edit" data-step="'+s.id+'">Edit step</button></div>'+md(S.steps[s.id]);
  h+='</div></details>'}
 h+=sec('Open questions')+'<h2>Build log</h2>'+md(S.sections['Build log']);
 el.innerHTML=h;wire()}
function op(o){notice='';HOST.op(o,S.version)}
function wire(){
 document.querySelectorAll('details.step').forEach(d=>d.ontoggle=()=>{d.open?openSteps.add(+d.dataset.id):openSteps.delete(+d.dataset.id)});
 document.querySelectorAll('.cp').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();op({type:'checkpoint',id:+b.dataset.id,value:!b.classList.contains('on')})});
 document.querySelectorAll('[data-sec]').forEach(b=>b.onclick=()=>{editing={kind:'section',key:b.dataset.sec};render();$('ed-text').focus()});
 document.querySelectorAll('[data-step]').forEach(b=>b.onclick=e=>{e.preventDefault();editing={kind:'step',id:+b.dataset.step};render();$('ed-text').focus()});
 if($('cancel'))$('cancel').onclick=()=>{editing=null;render()};
 if($('save'))$('save').onclick=()=>{const e=editing;editing=null;
  if(e.kind==='section')op({type:'section',key:e.key,text:$('ed-text').value});
  else op({type:'step',id:e.id,title:$('ed-title').value,summary:$('ed-summary').value,details:$('ed-text').value})};
 if($('approve'))$('approve').onclick=()=>{const b=$('approve');if(b.dataset.armed){op({type:'approve'})}else{b.dataset.armed='1';b.textContent='Click again to approve';setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent='Approve plan'}},4000)}};
 if($('raw'))$('raw').onclick=()=>HOST.openText()}
function receive(next,msg){if(msg)notice=msg;if(editing&&S&&next.version!==S.version&&!msg){S=next;notice='The plan changed on disk while you were editing. Your unsaved text is still in the box; copy it, cancel, and re-apply.';const keep=$('ed-text')&&$('ed-text').value;render();if(keep&&$('ed-text'))$('ed-text').value=keep;return}
 S=next;if(!editing)render()}
`

const CSS = `
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 var(--font)}
main{max-width:880px;margin:0 auto;padding:24px 16px 64px}a{color:var(--accent)}
header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
h1{font-size:24px;margin:0 0 6px}h2{font-size:16px;margin:28px 0 8px;display:flex;align-items:center;gap:10px}
.pill{display:inline-block;font-size:11px;font-weight:700;padding:2px 10px;border-radius:99px;border:1px solid var(--line);color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
.pill.approved,.pill.building{color:var(--accent);border-color:var(--accent)}.pill.done{color:var(--ok);border-color:var(--ok)}
button{font:inherit;font-size:13px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;padding:5px 12px;cursor:pointer}
button.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}button.edit{font-size:12px;padding:2px 9px;color:var(--muted)}
.actions,.row{display:flex;gap:8px;flex-wrap:wrap}.row{margin:8px 0}.row.end{justify-content:flex-end}
section.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:2px 16px}
details.step{background:var(--card);border:1px solid var(--line);border-radius:12px;margin:8px 0}
details.step>summary{list-style:none;display:flex;gap:12px;align-items:center;padding:12px 14px;cursor:pointer}
details.step>summary::-webkit-details-marker{display:none}.chev{color:var(--muted);transition:transform .15s}details[open] .chev{transform:rotate(90deg)}
.st{flex:1;min-width:0}.st b{display:block}.st span{color:var(--muted);font-size:14px}
.badge{font-size:12px;font-weight:600;color:var(--muted);white-space:nowrap}.badge.done{color:var(--ok)}
.cp{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);background:none;border:0;padding:6px;white-space:nowrap}
.cp i{width:18px;height:18px;border-radius:50%;border:2px solid var(--muted);display:inline-block}.cp.on{color:var(--warn)}.cp.on i{border-color:var(--warn);background:var(--warn);box-shadow:inset 0 0 0 3px var(--card)}
.body{padding:4px 16px 12px 44px;border-top:1px solid var(--line)}
label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin:10px 0 4px}
input,textarea{width:100%;font:13px/1.5 var(--mono);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px}
input{font-family:var(--font);font-size:14px}textarea{resize:vertical}
code{background:var(--code);padding:1px 5px;border-radius:5px;font:12.5px var(--mono)}pre{background:var(--code);padding:10px;border-radius:8px;overflow:auto}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:6px;text-align:left}
ul,ol{padding-left:22px}li.task{list-style:none;margin-left:-20px}
.err{color:var(--danger);border:1px solid var(--danger);border-radius:10px;padding:8px 12px;margin:12px 0}.notice{color:var(--warn)}.hint{color:var(--muted);font-size:13px;margin:0}
.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.tabs button.on{border-color:var(--accent);color:var(--accent)}
@media (max-width:560px){.badge{display:none}.cp span{display:none}.body{padding-left:14px}}`

const THEME_WEB = `:root{--bg:#f7f7f5;--card:#fff;--ink:#1c1f23;--muted:#5f6670;--line:#e3e3df;--accent:#2f6fed;--on-accent:#fff;--ok:#1f8a4c;--warn:#b7791f;--danger:#c53030;--code:rgba(127,127,127,.14);--font:system-ui,-apple-system,Segoe UI,sans-serif;--mono:ui-monospace,SFMono-Regular,Menlo,monospace}
@media (prefers-color-scheme:dark){:root{--bg:#141618;--card:#1c1f23;--ink:#e8e9eb;--muted:#9aa1aa;--line:#2c3036;--accent:#6b9bff;--on-accent:#0b1020;--ok:#4cc38a;--warn:#e0a43c;--danger:#f16b6b}}`

const THEME_EDITOR = `:root{--bg:var(--vscode-editor-background);--card:var(--vscode-sideBar-background,var(--vscode-editor-background));--ink:var(--vscode-editor-foreground);--muted:var(--vscode-descriptionForeground);--line:var(--vscode-panel-border,var(--vscode-widget-border,#8884));--accent:var(--vscode-button-background);--on-accent:var(--vscode-button-foreground);--ok:var(--vscode-testing-iconPassed,#3fb950);--warn:var(--vscode-editorWarning-foreground,#d29922);--danger:var(--vscode-errorForeground,#f85149);--code:var(--vscode-textCodeBlock-background,#8882);--font:var(--vscode-font-family);--mono:var(--vscode-editor-font-family)}`

const HOST_WEB = `
const HOST={plan:new URLSearchParams(location.search).get('plan'),
 async list(){return (await fetch('/api/plans')).json()},
 async load(){const r=await fetch('/api/plan?name='+encodeURIComponent(this.plan));return r.json()},
 async op(o,version){const r=await (await fetch('/api/op',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:this.plan,op:o,version})})).json();
  receive(r.state,r.conflict?'Not saved: the plan changed on disk. It has been reloaded; please re-apply your edit.':r.error?('Not saved: '+r.error):'')}};
async function boot(){const plans=await HOST.list();const tabs=$('tabs');if(!plans.length){$('plan').innerHTML='<p>No plans in plans/ yet.</p>';return}
 HOST.plan=HOST.plan&&plans.includes(HOST.plan)?HOST.plan:plans[0];
 tabs.innerHTML=plans.length>1?plans.map(p=>'<button class="'+(p===HOST.plan?'on':'')+'" data-p="'+esc(p)+'">'+esc(p)+'</button>').join(''):'';
 tabs.querySelectorAll('button').forEach(b=>b.onclick=()=>{HOST.plan=b.dataset.p;editing=null;openSteps.clear();boot()});
 S=null;receive(await HOST.load())}
boot();setInterval(async()=>{if(!HOST.plan)return;const n=await HOST.load();if(!S||n.version!==S.version)receive(n)},2000);`

const HOST_EDITOR = `
const vscode=acquireVsCodeApi();
const HOST={op(o,version){vscode.postMessage({type:'op',op:o,version})},openText(){vscode.postMessage({type:'openText'})}};
window.addEventListener('message',e=>{const m=e.data;if(m.type==='state')receive(m.state,m.notice||'')});
vscode.postMessage({type:'ready'});`

/** HTML page. mode 'web' (local server) or 'editor' (VS Code/Cursor webview; needs nonce + cspSource). */
export function renderPage(mode = 'web', { nonce = '', cspSource = '' } = {}) {
  const editor = mode === 'editor'
  const csp = editor ? `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">` : ''
  const n = editor ? ` nonce="${nonce}"` : ''
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${csp}
<title>Plans</title><style>${editor ? THEME_EDITOR : THEME_WEB}${CSS}</style></head><body><main><div class="tabs" id="tabs"></div><div id="plan"></div></main>
<script${n}>${CLIENT}${editor ? HOST_EDITOR : HOST_WEB}</script></body></html>`
}

// ---------- CLI ----------
function planFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : []
}

function cmdCheck(files) {
  const dir = resolve(process.cwd(), 'plans')
  if (!files.length) files = planFiles(dir).map((f) => join(dir, f))
  if (!files.length) return console.log('No plans found in plans/'), 0
  let failed = 0
  for (const f of files) {
    const { errors, warnings } = checkPlan(readFileSync(f, 'utf8'))
    console.log(`${errors.length ? '✗' : '✓'} ${f}`)
    errors.forEach((e) => console.log(`  error: ${e}`))
    warnings.forEach((w) => console.log(`  warning: ${w}`))
    if (errors.length) failed++
  }
  return failed ? 1 : 0
}

function cmdView(port) {
  const dir = existsSync('plans') ? realpathSync.native('plans') : resolve(process.cwd(), 'plans')
  const lastPoll = new Map() // plan name → when an open tab last loaded it (every 2s; hidden tabs about once a minute)
  const safe = (name) => (typeof name === 'string' && /^[\w.-]+\.md$/.test(name) && existsSync(join(dir, basename(name))) ? join(dir, basename(name)) : null)
  const json = (res, code, obj) => {
    res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    res.end(JSON.stringify(obj))
  }
  createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      return res.end(renderPage('web'))
    }
    if (req.method === 'GET' && url.pathname === '/api/plans') return json(res, 200, planFiles(dir))
    if (req.method === 'GET' && url.pathname === '/api/root') {
      const watching = [...lastPoll].filter(([, t]) => Date.now() - t < 65_000).map(([name]) => name)
      return json(res, 200, { dir, pid: process.pid, watching })
    }
    if (req.method === 'GET' && url.pathname === '/api/plan') {
      const p = safe(url.searchParams.get('name'))
      if (p) lastPoll.set(basename(p), Date.now())
      return p ? json(res, 200, stateOf(readFileSync(p, 'utf8'))) : json(res, 404, { error: 'plan not found' })
    }
    if (req.method === 'POST' && url.pathname === '/api/op') {
      let raw = ''
      req.on('data', (c) => (raw += c).length > 200_000 && req.destroy())
      req.on('end', () => {
        try {
          const { name, op, version } = JSON.parse(raw)
          const p = safe(name)
          if (!p) return json(res, 404, { error: 'plan not found' })
          const text = readFileSync(p, 'utf8')
          const r = applyOp(text, op, version)
          if (r.text) writeFileSync(p, r.text)
          json(res, 200, { ...r, text: undefined, state: stateOf(r.text || text) })
        } catch (e) {
          json(res, 400, { error: e.message })
        }
      })
      return
    }
    json(res, 404, { error: 'not found' })
  }).listen(port, '127.0.0.1', () => console.log(`Plans: http://localhost:${port}  (Ctrl+C to stop)`))
}

/** How `open` shows a plan: the editor whose terminal this is (it sets VSCODE_IPC_HOOK_CLI), otherwise the browser. */
export function openTarget(env = process.env, platform = process.platform) {
  if (env.VSCODE_IPC_HOOK_CLI) {
    const cursor = Object.keys(env).some((k) => k.startsWith('CURSOR_'))
    return {
      kind: 'editor',
      clis: cursor
        ? ['cursor', '/Applications/Cursor.app/Contents/Resources/app/bin/cursor']
        : ['code', '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'],
    }
  }
  return { kind: 'browser', opener: env.BROWSER || { darwin: 'open', win32: 'explorer' }[platform] || 'xdg-open' }
}

/** What the viewer on a port reports ({ dir, pid, watching }); null if nothing listens, {} if something else does. */
function viewerAt(port) {
  return new Promise((done) => {
    const req = httpGet({ host: '127.0.0.1', port, path: '/api/root', timeout: 500 }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        try {
          done(JSON.parse(body))
        } catch {
          done({})
        }
      })
    })
    req.on('timeout', () => req.destroy())
    req.on('error', (e) => done(e.code === 'ECONNREFUSED' ? null : {}))
  })
}

/** The viewer for a plans dir, started in the background if none is running: { port, watching }. */
async function viewerFor(dir) {
  dir = realpathSync.native(dir)
  let free = null
  for (let port = 4600; port < 4610; port++) {
    const at = await viewerAt(port)
    if (at?.dir === dir) return { port, watching: at.watching || [] }
    if (at === null && free === null) free = port
  }
  if (free === null) throw new Error('ports 4600–4609 are all in use')
  spawn(process.execPath, [fileURLToPath(import.meta.url), 'view', '--port', String(free)], { cwd: dirname(dir), detached: true, stdio: 'ignore' }).unref()
  for (let i = 0; i < 50; i++) {
    if ((await viewerAt(free))?.dir === dir) return { port: free, watching: [] }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`the plan viewer didn't start on port ${free}`)
}

/** Plan view URL for plans/<name>.md, and whether a browser tab already shows it (it refreshes by itself). */
export async function planViewUrl(path) {
  const { port, watching } = await viewerFor(dirname(path))
  return { url: `http://localhost:${port}/?plan=${encodeURIComponent(basename(path))}`, open: watching.includes(basename(path)) }
}

/** Show a plan in the editor whose terminal this is, or else in the browser unless a tab already shows it. */
export async function openPlan(path, env = process.env) {
  const target = openTarget(env)
  if (target.kind === 'editor') {
    for (const cli of target.clis) if (spawnSync(cli, ['-r', path], { stdio: 'ignore' }).status === 0) return `✓ Opened ${path} in the editor`
  }
  const { url, open } = await planViewUrl(path)
  if (open) return `✓ Already open at ${url}`
  const { opener } = openTarget({ ...env, VSCODE_IPC_HOOK_CLI: '' })
  return spawnSync(opener, [url], { stdio: 'ignore' }).status === 0 ? `✓ Opened ${url}` : `Open ${url}`
}

/** plans/<name>.md as an absolute path if `file` is one under `root`, else ''. */
export function planPath(file, root = process.cwd()) {
  const path = file ? resolve(root, file) : ''
  if (!path.endsWith('.md') || !existsSync(path) || !existsSync(resolve(root, 'plans'))) return ''
  const real = realpathSync.native(path)
  return dirname(real) === realpathSync.native(resolve(root, 'plans')) ? real : ''
}

async function cmdOpen(file, urlOnly) {
  const path = planPath(file)
  if (!path) return console.log(`✗ not a plan in plans/: ${file || '(none)'}`), 1
  console.log(urlOnly ? (await planViewUrl(path)).url : await openPlan(path))
  return 0
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
if (isMain) {
  const [cmd, ...args] = process.argv.slice(2)
  if (cmd === 'check') process.exit(cmdCheck(args))
  else if (cmd === 'view') {
    const i = args.indexOf('--port')
    cmdView(i >= 0 ? Number(args[i + 1]) : 4600)
  } else if (cmd === 'open' || cmd === 'url') {
    cmdOpen(args[0], cmd === 'url').then(
      (code) => process.exit(code),
      (e) => (console.log(`✗ ${e.message}`), process.exit(1)),
    )
  } else {
    console.log(
      'Usage:\n  node .agents/tools/plan.mjs check [plans/<name>.md ...]\n  node .agents/tools/plan.mjs view [--port 4600]\n  node .agents/tools/plan.mjs open plans/<name>.md\n  node .agents/tools/plan.mjs url plans/<name>.md',
    )
    process.exit(cmd ? 1 : 0)
  }
}
