#!/usr/bin/env node
// bench/agent/run-all.mjs
// Automated "run an agent against the mini-SWE-bench and grade it".
//
// For each problem (default: all wc-* in bench/problems/):
//   1. check out the bug base branch
//   2. hide FAIL_TO_PASS tests + reference.patch (so the agent can't peek)
//   3. invoke an agent command on the repo with the problem statement
//   4. capture the agent's source edits (backend/frontend) as a patch
//   5. restore main, grade with eval.mjs, tally resolved
//
// Usage:
//   node bench/agent/run-all.mjs [wc-001 wc-003 ...]          # ids to run (default all)
//   AGENT_CMD="my-agent ..." node bench/agent/run-all.mjs      # override agent (default: opencode)
//   OPENCODE_MODEL=provider/model node bench/agent/run-all.mjs
//   NO_AUTO=1 node bench/agent/run-all.mjs                    # don't pass --auto to opencode
//   RUN_ID=name node bench/agent/run-all.mjs                  # reports dir under bench/reports/
//
// The agent command receives the problem statement appended as the final argument.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { ROOT } from '../lib/judge.mjs';

function rmSyncSafe(p) {
  try { rmSync(p, { force: true }); } catch {}
}

const problemsDir = join(ROOT, 'bench/problems');
const allIds = readdirSync(problemsDir)
  .filter((d) => d.startsWith('wc-') && d.match(/^wc-\d+$/))
  .sort();
const ids = process.argv.slice(2).length ? process.argv.slice(2) : allIds;

const AGENT_CMD = process.env.AGENT_CMD || 'opencode';
const MODEL = process.env.OPENCODE_MODEL || '';
const AUTO = process.env.NO_AUTO !== '1';
const runId = process.env.RUN_ID || new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const reportsDir = join(ROOT, 'bench/reports', runId);
mkdirSync(reportsDir, { recursive: true });

function sh(cmd) {
  execFileSync('git', ['checkout', '-f', cmd.branch], { cwd: ROOT, stdio: 'pipe' });
}

function hideTests() {
  // remove every problem's FAIL test + reference from the working tree
  for (const id of allIds) {
    const tests = join(problemsDir, id, 'tests');
    const ref = join(problemsDir, id, 'reference.patch');
    try { for (const f of readdirSync(tests)) rmSyncSafe(join(tests, f)); } catch {}
    try { rmSyncSafe(ref); } catch {}
  }
}

const INSTRUCTION = `
You are a coding agent fixing a bug in this repository. Follow the problem statement above.
Constraints:
- Investigate and fix the bug by editing SOURCE ONLY under backend/src or frontend/src.
- Do NOT modify any test files (anything under a __tests__ dir). Do NOT modify anything under bench/.
- You may run existing tests to sanity-check (cd backend && npx jest, or cd frontend && npx jest), but they may not cover this exact bug. Do not add tests.
When you are confident the bug is fixed, stop. You do not need to write a patch or commit; your working-tree changes will be collected.`;

const results = [];
for (const id of ids) {
  const meta = JSON.parse(readFileSync(join(problemsDir, id, 'meta.json'), 'utf-8'));
  const branch = meta.branch || `bug/${id}`;
  const problem = readFileSync(join(problemsDir, id, 'problem.md'), 'utf-8');
  const prompt = `${problem}\n\n${INSTRUCTION}`;

  process.stderr.write(`\n=== ${id} (branch ${branch}) — starting agent ===\n`);
  sh({ branch });
  hideTests();

  const agentArgs = AGENT_CMD.split(/\s+/);
  const bin = agentArgs[0];
  const rest = AGENT_CMD === 'opencode'
    ? ['run', '--dir', ROOT, ...(AUTO ? ['--auto'] : []), ...(MODEL ? ['--model', MODEL] : [])]
    : agentArgs.slice(1);
  const r = spawnSync(bin, [...rest, prompt], { cwd: ROOT, stdio: 'inherit', encoding: 'utf-8' });
  if (r.status !== 0) {
    process.stderr.write(`agent exited ${r.status ?? 'signal'} for ${id}\n`);
  }

  // capture source edits made by the agent (backend/frontend only)
  const patch = execFileSync('git', ['diff', '--', 'backend', 'frontend'], {
    cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'],
  });
  const patchFile = join(reportsDir, `${id}.patch`);
  writeFileSync(patchFile, patch);
  process.stderr.write(`patch (${patch.trim() ? 'non-empty' : 'EMPTY'}) -> ${patchFile}\n`);

  // restore main, then grade
  execFileSync('git', ['checkout', '-f', 'main'], { cwd: ROOT, stdio: 'pipe' });
  const grade = execFileSync('node', [join(ROOT, 'bench/lib/eval.mjs'), id, patchFile], {
    cwd: ROOT, encoding: 'utf-8',
  });
  const parsed = JSON.parse(grade);
  results.push({ id, resolved: parsed.resolved, branch });
  process.stderr.write(`${id}: resolved=${parsed.resolved}\n`);
}

const summary = { runId, results, resolved: results.filter((r) => r.resolved).length, total: results.length };
writeFileSync(join(reportsDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
