// bench/lib/judge.mjs
// Grades a single problem by injecting its FAIL_TO_PASS test into the package
// test dir and running jest for FAIL_TO_PASS + PASS_TO_PASS. Operates on the
// CURRENT git checkout (caller is responsible for checking out the right source).
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '../..');

// inject_dir -> package dir + destination test folder (relative to package)
const INJECT = {
  backend: { pkg: 'backend', testDir: 'src/service/__tests__' },
  'frontend-api': { pkg: 'frontend', testDir: 'src/api/__tests__' },
  'frontend-hooks': { pkg: 'frontend', testDir: 'src/hooks/__tests__' },
};

function passPath(p, injectKey) {
  const { pkg } = INJECT[injectKey];
  const prefix = `${pkg}/`;
  return p.startsWith(prefix) ? p.slice(prefix.length) : p;
}

function failNames(meta) {
  return Array.isArray(meta.fail_to_pass) ? meta.fail_to_pass : [meta.fail_to_pass];
}

function resolveFailFiles(problemDir, meta) {
  const files = new Set();
  for (const name of failNames(meta)) {
    const listed = join(problemDir, 'tests', name);
    if (existsSync(listed)) {
      files.add(listed);
      continue;
    }
    const stem = name.split('.')[0];
    const match = readdirSync(join(problemDir, 'tests')).find((f) => f.startsWith(stem));
    if (!match) throw new Error(`cannot find fail test '${name}' in ${problemDir}/tests`);
    files.add(join(problemDir, 'tests', match));
  }
  return [...files];
}

export function gradeProblem({ problemDir, meta }) {
  const { pkg, testDir } = INJECT[meta.inject_dir];
  const pkgDir = join(ROOT, pkg);
  const destDir = join(pkgDir, testDir);
  mkdirSync(destDir, { recursive: true });

  const copied = [];
  try {
    const specs = [];
    for (const failFile of resolveFailFiles(problemDir, meta)) {
      const destTest = join(destDir, basename(failFile));
      copyFileSync(failFile, destTest);
      copied.push(destTest);
      specs.push(destTest);
    }
    for (const p of meta.pass_to_pass) specs.push(join(pkgDir, passPath(p, meta.inject_dir)));
    execFileSync('npx', ['jest', ...specs, '--runInBand'], { cwd: pkgDir, stdio: 'pipe', encoding: 'utf-8' });
    return { resolved: true, reason: null };
  } catch (err) {
    const out = String(err.stdout || '') + String(err.stderr || '');
    return { resolved: false, reason: (out || err.message).slice(0, 1000) };
  } finally {
    for (const f of copied) rmSync(f, { force: true });
  }
}
