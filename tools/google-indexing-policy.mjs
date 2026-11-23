// A failed Search Console API request is not evidence that a page is unindexed.
// Keep technical collection failures separate from genuine index status results.
export function classifyInspectionError(error) {
  const message = String(error?.message || error || '');
  if (/insufficient authentication scopes|insufficient.{0,50}scopes?/i.test(message)) return 'AUTH_SCOPE';
  if (/permission denied|permission_denied|insufficient permission|does not have (sufficient )?permission|not a verified owner|access denied|\b403\b/i.test(message)) return 'AUTH_ACCESS';
  if (/invalid authentication credentials|could not resolve a google access token|missing required authentication credential|unauthenticated|invalid_grant|\b401\b/i.test(message)) return 'AUTH_CREDENTIALS';
  if (/quota|rate limit|http 429|resource exhausted/i.test(message)) return 'RATE_LIMIT';
  if (/timeout|timed out|network|fetch failed|enotfound/i.test(message)) return 'TRANSPORT';
  return 'API_FAILURE';
}

export const isAuthBlockingError = (code) => ['AUTH_SCOPE', 'AUTH_ACCESS', 'AUTH_CREDENTIALS'].includes(code);

export function createInspectionError(url, error) {
  return {
    url,
    verdict: 'ERROR',
    coverageState: 'UNKNOWN',
    indexingState: 'UNKNOWN',
    pageFetchState: 'UNKNOWN',
    robotsTxtState: 'UNKNOWN',
    lastCrawlTime: null,
    userCanonical: null,
    googleCanonical: null,
    inspectionError: { code: classifyInspectionError(error) },
  };
}

export function createSkippedInspection(url, reason) {
  return {
    url,
    verdict: 'SKIPPED',
    coverageState: 'UNKNOWN',
    indexingState: 'UNKNOWN',
    pageFetchState: 'UNKNOWN',
    robotsTxtState: 'UNKNOWN',
    lastCrawlTime: null,
    userCanonical: null,
    googleCanonical: null,
    skipReason: reason,
  };
}

export function isNeedsAttention(item) {
  if (!item || item.verdict === 'ERROR' || item.verdict === 'SKIPPED') return false;
  const state = String(item.coverageState || '').toLowerCase();
  if (state === 'submitted and indexed' || state === 'indexed, not submitted in sitemap') return false;
  if (state.includes('currently not indexed')) return true;
  if (state.includes('unknown')) return true;
  if (state.includes('duplicate')) return true;
  if (state.includes('not found') || state.includes('blocked') || state.includes('error')) return true;
  return item.verdict !== 'PASS';
}

export function summarizeInspectionResults(results = []) {
  const successful = results.filter((item) => item.verdict !== 'ERROR' && item.verdict !== 'SKIPPED');
  const errors = results.filter((item) => item.verdict === 'ERROR');
  const skipped = results.filter((item) => item.verdict === 'SKIPPED');
  return {
    status: successful.length === 0 ? 'SEM_DADO' : errors.length || skipped.length ? 'PARCIAL' : 'OK',
    inspectedUrls: successful.length,
    failedUrls: errors.length,
    skippedUrls: skipped.length,
    inspectionErrors: errors,
    needsAttention: successful.filter(isNeedsAttention),
  };
}
