import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parsePlan, checkPlan, stateOf, applyOp, versionOf } from '../tools/plan.mjs'
import { demoPlan } from './helpers.mjs'

const errorsOf = (text) => checkPlan(text).errors

test('parsePlan reads the front matter and body', () => {
  const { data, body } = parsePlan(demoPlan())
  assert.equal(data.name, 'Demo')
  assert.equal(data.status, 'draft')
  assert.deepEqual(data.steps, [{ id: 1, title: 'One', summary: 'First step', done: false, checkpoint: false }])
  assert.match(body, /^# Plan: Demo/m)
})

test('parsePlan rejects single-quoted strings', () => {
  assert.throws(() => parsePlan(demoPlan().replace('"Demo"', "'Demo'")), /double quotes/)
})

test('a valid plan has no errors, only the step-count warning', () => {
  const { errors, warnings } = checkPlan(demoPlan())
  assert.deepEqual(errors, [])
  assert.deepEqual(warnings, ['1 steps; aim for about 5–12'])
})

test('check reports format errors', () => {
  assert.match(errorsOf(demoPlan().replace('## Changes', '## Notes')).join('\n'), /missing section "## Changes"/)
  assert.match(errorsOf(demoPlan({ title: 'x'.repeat(61) })).join('\n'), /title must be 1–60 characters/)
  assert.match(errorsOf(demoPlan({ done: true, ticked: false })).join('\n'), /done is true but some Done-when items aren't ticked/)
  assert.match(errorsOf(demoPlan().replace('**Check:**', '**Verify:**')).join('\n'), /missing \*\*Check:\*\*/)
  assert.match(errorsOf(demoPlan().replace('## Build log', '## Background\nx\n\n## Build log')).join('\n'), /unexpected section/)
})

test('a non-draft plan with open questions fails check', () => {
  assert.match(errorsOf(demoPlan({ status: 'approved', openQuestions: '- Which provider?' })).join('\n'), /Open questions isn't empty/)
})

test('approve: only a draft with no open questions', () => {
  const ok = applyOp(demoPlan(), { type: 'approve' })
  assert.equal(parsePlan(ok.text).data.status, 'approved')
  assert.match(applyOp(demoPlan({ openQuestions: '- Which provider?' }), { type: 'approve' }).error, /approved only as a draft/)
  assert.match(applyOp(demoPlan({ status: 'building' }), { type: 'approve' }).error, /approved only as a draft/)
  assert.equal(stateOf(demoPlan()).canApprove, true)
})

test('checkpoint and step edits change only what they should', () => {
  const cp = applyOp(demoPlan(), { type: 'checkpoint', id: 1, value: true })
  assert.equal(parsePlan(cp.text).data.steps[0].checkpoint, true)
  const edited = applyOp(demoPlan({ done: true }), { type: 'step', id: 1, title: 'New title', summary: 'New\nsummary', details: '**Do:**\n1. Other.' })
  const step = parsePlan(edited.text).data.steps[0]
  assert.deepEqual([step.title, step.summary, step.done], ['New title', 'New summary', true])
  assert.match(applyOp(demoPlan(), { type: 'checkpoint', id: 9, value: true }).error, /step not found/)
})

test('only some sections are editable', () => {
  const r = applyOp(demoPlan(), { type: 'section', key: 'Changes', text: '- **Other:** change.' })
  assert.match(r.text, /- \*\*Other:\*\* change\./)
  assert.match(applyOp(demoPlan(), { type: 'section', key: 'Build log', text: 'x' }).error, /not editable/)
  assert.match(applyOp(demoPlan(), { type: 'nope' }).error, /unknown edit/)
})

test('an edit against an older version is a conflict', () => {
  const text = demoPlan()
  assert.deepEqual(applyOp(text, { type: 'checkpoint', id: 1, value: true }, 'stale'), { conflict: true })
  assert.ok(applyOp(text, { type: 'checkpoint', id: 1, value: true }, versionOf(text)).text)
})
