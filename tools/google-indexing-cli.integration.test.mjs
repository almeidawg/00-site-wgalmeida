import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, mkdtempSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = join(root, '.codex', 'tmp', 'gsc-integration-20261104');
mkdirSync(fixtureDir, { recursive: true });
const allowedEnv = new Set([
  'PATH', 'PATHEXT', 'SYSTEMROOT', 'WINDIR', 'COMSPEC',
  'TEMP', 'TMP', 'APPDATA', 'LOCALAPPDATA', 'HOMEDRIVE',
  'HOMEPATH', 'USERPROFILE',
]);
const baseEnv = Object.fromEntries(Object.entries(process.env)
  .filter(([key, value]) => allowedEnv.has(key.toUpperCase()) && typeof value === 'string'));

function execute(scenario) {
  const output = mkdtempSync(join(fixtureDir, scenario + '-'));
  const args = [
    '--import', './tools/google-indexing-integration-mock.mjs',
    './tools/google-indexing-ops.mjs',
    'audit',
    '--limit=3',
    '--concurrency=1',
    '--quota-project=fixture-test',
    '--sitemap-file=public/sitemap.xml',
    '--output=' + output,
  ];
  const child = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 1024 * 1024,
    env: { ...baseEnv, GSC_INDEXING_INTEGRATION_CASE: scenario },
    windowsHide: true,
  });
  assert.equal(child.error, undefined, String(child.error));
  assert.ok(existsSync(join(output, 'indexing-audit.json')), 'CLI did not write report: status=' + child.status + ' stderr=' + child.stderr + ' stdout=' + child.stdout);
  const report = JSON.parse(readFileSync(join(output, 'indexing-audit.json'), 'utf8'));
  const markdown = readFileSync(join(output, 'indexing-audit.md'), 'utf8');
  return { child, report, markdown };
}

test('CLI: sitemap submission uses write scope and a hermetic mock endpoint', () => {
  const child = spawnSync(process.execPath, [
    '--import', './tools/google-indexing-integration-mock.mjs',
    './tools/google-indexing-ops.mjs',
    'submit-sitemap',
    '--quota-project=fixture-test',
  ], {
    cwd: root,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 1024 * 1024,
    env: { ...baseEnv, GSC_INDEXING_INTEGRATION_CASE: 'submit_mock' },
    windowsHide: true,
  });
  assert.equal(child.error, undefined, String(child.error));
  assert.equal(child.status, 0, 'mock submission failed: ' + child.stderr);
  assert.match(child.stdout, /Sitemap submitted:/);
  assert.doesNotMatch(child.stderr, /Test fixture refused incorrect OAuth scope/);
});

test('CLI: missing OAuth credential writes SEM_DADO and exits nonzero without API calls', () => {
  const { child, report, markdown } = execute('token_unavailable');
  assert.equal(child.status, 1);
  assert.equal(report.status, 'SEM_DADO');
  assert.equal(report.requestedUrls, 3);
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls], [0, 1, 2]);
  assert.equal(report.inspectionErrors[0].inspectionError.code, 'AUTH_CREDENTIALS');
  assert.equal(report.needsAttention.length, 0);
  assert.match(markdown, /SEM DADO/);
  assert.match(markdown, /AUTH_CREDENTIALS/);
  assert.doesNotMatch(markdown, /Submitted and indexed \| OK/);
});

test('CLI: insufficient OAuth scope is SEM_DADO + nonzero exit, not SEO issues', () => {
  const { child, report, markdown } = execute('auth_scope');
  assert.equal(child.status, 1);
  assert.equal(report.status, 'SEM_DADO');
  assert.equal(report.totalUrls, 175);
  assert.equal(report.requestedUrls, 3);
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls], [0, 1, 2]);
  assert.equal(report.inspectionErrors[0].inspectionError.code, 'AUTH_SCOPE');
  assert.equal(report.needsAttention.length, 0);
  assert.match(markdown, /SEM DADO/);
  assert.doesNotMatch(markdown, /Submitted and indexed \| OK/);
  assert.doesNotMatch(markdown, /Request had insufficient authentication scopes/);
});

test('CLI: valid Search Console results return success and one genuine SEO alert', () => {
  const { child, report, markdown } = execute('success');
  assert.equal(child.status, 0);
  assert.equal(report.status, 'OK');
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls], [3, 0, 0]);
  assert.equal(report.needsAttention.length, 1);
  assert.equal(report.needsAttention[0].coverageState, 'Crawled - currently not indexed');
  assert.match(markdown, /Crawled - currently not indexed/);
});

test('CLI: partial rate-limit never looks complete and remains nonzero exit', () => {
  const { child, report, markdown } = execute('partial_rate');
  assert.equal(child.status, 1);
  assert.equal(report.status, 'PARCIAL');
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls], [2, 1, 0]);
  assert.equal(report.needsAttention.length, 0);
  assert.equal(report.inspectionErrors[0].inspectionError.code, 'RATE_LIMIT');
  assert.match(markdown, /API failures: 1/);
});

test('CLI: malformed 200 response is API failure, not successful inspection', () => {
  const { child, report } = execute('invalid_response');
  assert.equal(child.status, 1);
  assert.equal(report.status, 'SEM_DADO');
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls], [0, 3, 0]);
  assert.equal(report.needsAttention.length, 0);
  assert.ok(report.inspectionErrors.every(item => item.inspectionError.code === 'API_FAILURE'));
});
