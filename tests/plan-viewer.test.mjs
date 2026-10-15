import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PLAN_MJS, tempRoot, cleanEnv, demoPlan } from './helpers.mjs'

const root = tempRoot('plan-viewer-')
let server
let base

const freePort = () =>
  new Promise((done) => {
    const s = createServer().listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => done(port))
    })
  })

before(async () => {
  mkdirSync(join(root, 'plans'))
  writeFileSync(join(root, 'plans', 'demo.md'), demoPlan())
  writeFileSync(join(root, 'plans', 'other.md'), demoPlan())
  writeFileSync(join(root, 'secret.md'), 'not a plan')
  const port = await freePort()
  server = spawn(process.execPath, [PLAN_MJS, 'view', '--port', String(port)], { cwd: root, env: cleanEnv() })
  await new Promise((done) => server.stdout.once('data', done))
  base = `http://127.0.0.1:${port}`
})
after(() => server.kill())

const get = (path) => fetch(base + path)
const op = (body) => fetch(base + '/api/op', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) })

test('serves the page and lists plans', async () => {
  assert.match(await (await get('/')).text(), /<title>Plans<\/title>/)
  assert.deepEqual(await (await get('/api/plans')).json(), ['demo.md', 'other.md'])
})

test('loads a plan with its state', async () => {
  const state = await (await get('/api/plan?name=demo.md')).json()
  assert.equal(state.data.name, 'Demo')
  assert.equal(state.canApprove, true)
})

test('refuses names outside plans/', async () => {
  for (const name of ['../secret.md', '..%2Fsecret.md', 'missing.md', '/etc/passwd']) {
    assert.equal((await get(`/api/plan?name=${name}`)).status, 404, name)
  }
  assert.equal((await op({ name: '../secret.md', op: { type: 'approve' } })).status, 404)
  assert.equal(readFileSync(join(root, 'secret.md'), 'utf8'), 'not a plan')
})

test('applies an edit to the file', async () => {
  const { version } = await (await get('/api/plan?name=demo.md')).json()
  const r = await (await op({ name: 'demo.md', op: { type: 'checkpoint', id: 1, value: true }, version })).json()
  assert.equal(r.state.data.steps[0].checkpoint, true)
  assert.match(readFileSync(join(root, 'plans', 'demo.md'), 'utf8'), /checkpoint: true/)
})

test('a stale edit is a conflict and changes nothing', async () => {
  const before = readFileSync(join(root, 'plans', 'other.md'), 'utf8')
  const r = await (await op({ name: 'other.md', op: { type: 'checkpoint', id: 1, value: true }, version: 'stale' })).json()
  assert.equal(r.conflict, true)
  assert.equal(readFileSync(join(root, 'plans', 'other.md'), 'utf8'), before)
})

test('bad requests get 400 or 404', async () => {
  assert.equal((await op('not json')).status, 400)
  assert.equal((await get('/nope')).status, 404)
})
