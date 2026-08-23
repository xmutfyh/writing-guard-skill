#!/usr/bin/env node
/**
 * writing-guard-skill self-test: verifies every CLI subcommand end-to-end.
 * Zero dependencies. Node >= 18.
 */
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const script = path.join(here, '..', 'scripts', 'audit.mjs')

function run(args) {
  return new Promise((resolve) => {
    execFile('node', [script, ...args], (err, stdout, stderr) => {
      resolve({
        code: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
        out: stdout,
        err: stderr,
      })
    })
  })
}

let failed = 0
async function check(name, args, expect) {
  const r = await run(args)
  const ok = expect(r)
  console.log(`${ok ? '✓' : '✗'} ${name}`)
  if (!ok) {
    failed++
    if (r.err) console.log('   stderr:', r.err.slice(0, 200))
  }
}

const draft = path.join(here, 'sample-draft.txt')
const before = path.join(here, 'sample-before.txt')
const after = path.join(here, 'sample-after.txt')

// rules
await check('rules subcommand', ['rules'], (r) => r.code === 0 && r.out.includes('v1.6.2'))

// audit style (manuscript) — expect process-residue HIGH
await check('audit style (manuscript) → residue HIGH',
  ['audit', '--file', draft, '--profile', 'manuscript', '--verbose'],
  (r) => r.code === 0 && r.out.includes('HIGH') && r.out.includes('修改过程残留'))

// audit lock (before -> after) — expect INVARIANT on numbers + negation flip
await check('audit lock (before→after) → INVARIANT HIGH',
  ['audit', '--file', after, '--original-file', before, '--profile', 'manuscript', '--verbose'],
  (r) => r.code === 0 && r.out.includes('INVARIANT') && r.out.includes('p 值') && r.out.includes('零结果'))

// audit --json — expect machine-readable shape
await check('audit --json → JSON with hits',
  ['audit', '--file', after, '--original-file', before, '--json'],
  (r) => {
    const rep = JSON.parse(r.out)
    return rep.hits && rep.hits.length > 0
  })

// min-severity filter
await check('--min-severity high → only high',
  ['audit', '--file', draft, '--profile', 'manuscript', '--min-severity', 'high'],
  (r) => r.code === 0 && !r.out.includes('[LOW'))

// fail-on-high → non-zero exit
await check('--fail-on-high → exit 1',
  ['audit', '--file', draft, '--profile', 'manuscript', '--fail-on-high'],
  (r) => r.code === 1)

// style-profile
await check('style-profile → JSON',
  ['style-profile', '--file', draft],
  (r) => {
    const p = JSON.parse(r.out)
    return typeof p.sentenceLengthMedian === 'number' && typeof p.paragraphLengthMedian === 'number'
  })

// journal-profile
await check('journal-profile → JSON',
  ['journal-profile', '--file', draft, '--journal', 'Test'],
  (r) => {
    const p = JSON.parse(r.out)
    return p.metadata && p.sentenceStyle && p.epistemics
  })

console.log(failed === 0 ? '\n全部通过 ✔' : `\n${failed} 项失败 ✘`)
process.exit(failed === 0 ? 0 : 1)
