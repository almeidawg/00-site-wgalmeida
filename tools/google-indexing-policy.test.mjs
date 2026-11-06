import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyInspectionError,
  isAuthBlockingError,
  createInspectionError,
  createSkippedInspection,
  isNeedsAttention,
  summarizeInspectionResults,
} from './google-indexing-policy.mjs';

const indexed = (url) => ({ url, verdict: 'PASS', coverageState: 'Submitted and indexed' });
const notIndexed = (url) => ({ url, verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' });

test('insufficient OAuth scopes are an authorization error, not SEO coverage', () => {
  const row = createInspectionError('https://wgalmeida.com.br/', new Error('Request had insufficient authentication scopes.'));
  assert.equal(classifyInspectionError(new Error('Request had insufficient authentication scopes.')), 'AUTH_SCOPE');
  assert.equal(row.inspectionError.code, 'AUTH_SCOPE');
  assert.equal(row.coverageState, 'UNKNOWN');
  assert.equal(isNeedsAttention(row), false);
  const report = summarizeInspectionResults([row]);
  assert.equal(report.status, 'SEM_DADO');
  assert.equal(report.inspectedUrls, 0);
  assert.equal(report.failedUrls, 1);
  assert.equal(report.needsAttention.length, 0);
});

test('all API failures never produce fictitious indexing alerts', () => {
  const report = summarizeInspectionResults([
    createInspectionError('/a', new Error('Request had insufficient authentication scopes.')),
    createInspectionError('/b', new Error('HTTP 403 permission denied')),
    createSkippedInspection('/c', 'AUTH_SCOPE'),
  ]);
  assert.deepEqual([report.inspectedUrls, report.failedUrls, report.skippedUrls, report.needsAttention.length], [0, 2, 1, 0]);
  assert.equal(report.status, 'SEM_DADO');
});

test('real indexed and non-indexed responses remain separate from provider failures', () => {
  const report = summarizeInspectionResults([
    indexed('/ok'),
    notIndexed('/warn'),
    createInspectionError('/error', new Error('HTTP 429 quota exceeded')),
  ]);
  assert.equal(report.status, 'PARCIAL');
  assert.equal(report.inspectedUrls, 2);
  assert.equal(report.failedUrls, 1);
  assert.deepEqual(report.needsAttention.map((x) => x.url), ['/warn']);
});

test('fully valid inspection results can be OK without false positives', () => {
  const report = summarizeInspectionResults([indexed('/a'), indexed('/b')]);
  assert.equal(report.status, 'OK');
  assert.equal(report.inspectedUrls, 2);
  assert.equal(report.needsAttention.length, 0);
});

test('authorization blocking and generic API errors are classified independently', () => {
  assert.equal(isAuthBlockingError('AUTH_SCOPE'), true);
  assert.equal(isAuthBlockingError('AUTH_ACCESS'), true);
  assert.equal(isAuthBlockingError('AUTH_CREDENTIALS'), true);
  assert.equal(isAuthBlockingError('RATE_LIMIT'), false);
  assert.equal(classifyInspectionError(new Error('HTTP 429 quota exceeded')), 'RATE_LIMIT');
  assert.equal(classifyInspectionError(new Error('unexpected provider response')), 'API_FAILURE');
});

test('unknown indexing state from a successful provider response is not a provider error', () => {
  const row = { verdict: 'NEUTRAL', coverageState: 'UNKNOWN' };
  assert.equal(isNeedsAttention(row), true);
});
