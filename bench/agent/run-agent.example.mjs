// bench/agent/run-agent.example.mjs
// Placeholder for the agent hook. Later, wire a real agent here:
// given a problem statement and a working repo, produce a candidate patch file.
// eval.mjs grades whatever patch this produces.
// Usage: node bench/agent/run-agent.example.mjs <problemId> [outPatchFile]
import { join } from 'node:path';
import { ROOT } from '../lib/judge.mjs';

const [id] = process.argv.slice(2);
console.error(`[agent] NOT IMPLEMENTED: would solve problem '${id}' from bench/problems/${id}/problem.md`);
console.error(`[agent] candidate patch would be written to outPatchFile, then graded by: node bench/lib/eval.mjs ${id} <outPatchFile>`);
process.exit(1);
