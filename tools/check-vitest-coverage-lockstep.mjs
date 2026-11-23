// Read-only diagnostic: keep Vitest and its V8 coverage provider on the same resolved version.
// Does not install packages, mutate package manifests, or modify lockfiles.
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGES = ['vitest', '@vitest/coverage-v8'];
const ownPath = fileURLToPath(import.meta.url);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

export function analyzeVitestCoverageLockstep({ manifest, lockfile, installed = {} }) {
  const declarations = manifest?.devDependencies || {};
  const lockRoot = lockfile?.packages?.['']?.devDependencies || {};
  const resolved = lockfile?.packages || {};
  const declared = {};
  const locked = {};
  const observed = {};
  const issues = [];
  const warnings = [];

  for (const name of PACKAGES) {
    declared[name] = declarations[name] || null;
    locked[name] = resolved['node_modules/' + name]?.version || null;
    observed[name] = installed[name] || null;
    if (!declared[name]) issues.push(name + ': MISSING_MANIFEST_SPEC');
    if (!locked[name]) issues.push(name + ': MISSING_LOCK_RESOLUTION');
    if (!observed[name]) issues.push(name + ': MISSING_INSTALLED_PACKAGE');
    if (declared[name] && lockRoot[name] !== declared[name]) {
      issues.push(name + ': MANIFEST_LOCK_SPEC_DRIFT');
    }
    if (locked[name] && observed[name] && locked[name] !== observed[name]) {
      issues.push(name + ': INSTALLED_LOCK_VERSION_DRIFT');
    }
    if (declared[name] && !/^\d+\.\d+\.\d+$/.test(declared[name])) {
      warnings.push(name + ': DECLARATION_NOT_EXACT');
    }
  }
  if (locked.vitest && locked['@vitest/coverage-v8'] &&
      locked.vitest !== locked['@vitest/coverage-v8']) {
    issues.push('VITEST_COVERAGE_LOCK_VERSION_MISMATCH');
  }
  if (observed.vitest && observed['@vitest/coverage-v8'] &&
      observed.vitest !== observed['@vitest/coverage-v8']) {
    issues.push('VITEST_COVERAGE_INSTALLED_VERSION_MISMATCH');
  }

  return {
    ok: issues.length === 0,
    declared,
    locked,
    installed: observed,
    issues,
    warnings,
  };
}

export function inspectVitestCoverageRepository(root = process.cwd()) {
  const manifest = readJson(resolve(root, 'package.json'));
  const lockfile = readJson(resolve(root, 'package-lock.json'));
  const installed = {};
  for (const name of PACKAGES) {
    const packagePath = resolve(root, 'node_modules', name, 'package.json');
    installed[name] = existsSync(packagePath) ? readJson(packagePath).version : null;
  }
  return analyzeVitestCoverageLockstep({ manifest, lockfile, installed });
}

if (process.argv[1] && resolve(process.argv[1]) === ownPath) {
  const result = inspectVitestCoverageRepository();
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (!result.ok) process.exitCode = 2;
}
