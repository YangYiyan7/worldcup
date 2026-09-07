// bench/lib/eval.mjs
// CLI: node bench/lib/eval.mjs <problemId> [candidate.patch]
// Grades a candidate fix for one problem:
//   1. check out the bug base branch for <problemId>
//   2. optionally apply candidate.patch (forward, or reversed if needed)
//   3. judge FAIL_TO_PASS + PASS_TO_PASS via jest
//   4. restore main
// Prints a JSON result. Does NOT run an agent; feed it an agent's patch.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { ROOT, gradeProblem } from './judge.mjs';

const [id, patchFile] = process.argv.slice(2);
if (!id) {
  console.error('usage: node bench/lib/eval.mjs <problemId> [candidate.patch]');
  process.exit(2);
}

const problemDir = join(ROOT, 'bench/problems', id);
const meta = JSON.parse(readFileSync(join(problemDir, 'meta.json'), 'utf-8'));
const branch = meta.branch || `bug/${id}`;

execSync(`git checkout -f ${branch}`, { cwd: ROOT, stdio: 'pipe' });

if (patchFile) {
  const content = readFileSync(patchFile, 'utf-8');
  if (content.trim()) {
    for (const rev of ['', '-R ']) {
      try {
        execSync(`git apply ${rev}--whitespace=nowarn "${patchFile}"`, { cwd: ROOT, stdio: 'pipe' });
        break;
      } catch {
        // try reversed; if both fail, grade the unpatched bug branch
      }
    }
  }
}

let result;
try {
  result = gradeProblem({ problemDir, meta });
} finally {
  execSync('git checkout -f main', { cwd: ROOT, stdio: 'pipe' });
}

console.log(JSON.stringify({ id, resolved: result.resolved, reason: result.reason }, null, 2));
